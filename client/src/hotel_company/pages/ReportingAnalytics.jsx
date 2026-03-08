import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar, RefreshCw, DollarSign, Bed, Utensils,
  GlassWater, LayoutGrid, ChevronDown, ArrowUpRight,
  Clock, CheckCircle, AlertCircle, TrendingUp, Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell
} from "@/components/ui/table";
import * as api from '@/api';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileDown, FileJson, FileText, Download } from 'lucide-react';

// ── Constants ──────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'all',      label: 'All Sales',  icon: LayoutGrid,   color: 'text-[var(--theme-primary)]',  bg: 'bg-[var(--theme-primary)]/10' },
  { key: 'rooms',    label: 'Rooms',      icon: Bed,           color: 'text-blue-500',                bg: 'bg-blue-500/10' },
  { key: 'foods',    label: 'Foods',      icon: Utensils,      color: 'text-orange-500',              bg: 'bg-orange-500/10' },
  { key: 'popular',  label: 'Popular',    icon: TrendingUp,    color: 'text-emerald-500',             bg: 'bg-emerald-500/10' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmt = (n) =>
  `${(parseFloat(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ETB`;

const Skeleton = ({ className }) => (
  <div className={`relative overflow-hidden bg-[var(--theme-primary)]/5 rounded-xl ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-[var(--theme-primary)]/10 to-transparent" />
  </div>
);

const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '—';

// ── Sub-components ─────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, color, bg }) {
  return (
    <Card className="bg-[var(--theme-header-bg)] border-none shadow-sm rounded-xl">
      <CardContent className="p-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-40">{label}</p>
          <h3 className="text-2xl font-bold mt-1 text-[var(--theme-text)]">{value}</h3>
          {sub && <p className={`text-[10px] font-semibold mt-1 ${color}`}>{sub}</p>}
        </div>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
          <Icon size={18} className={color} />
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ msg = 'No data for this period' }) {
  return (
    <TableRow>
      <TableCell colSpan={10} className="py-14 text-center">
        <p className="text-sm opacity-30 font-medium">{msg}</p>
      </TableCell>
    </TableRow>
  );
}

function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="p-6 space-y-4">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-12 w-32" />
        </div>
      ))}
    </div>
  );
}

// ── Room Sales Table ───────────────────────────────────────────────────────────
function RoomTable({ rows }) {
  if (!rows?.length) return (
    <Table><TableBody><EmptyState msg="No paid room stays in this period" /></TableBody></Table>
  );
  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <Table className="min-w-[800px] md:min-w-full">
        <TableHeader className="bg-[var(--theme-bg)]/30">
          <TableRow className="border-b border-[var(--border)]/5 hover:bg-transparent">
            {['#', 'Guest', 'Room(s)', 'Check In', 'Booked Out', 'Actual Out', 'Booked Nights', 'Actual Nights', 'Status', 'Amount'].map(h => (
              <TableHead key={h} className="text-[10px] font-semibold uppercase tracking-widest py-3 px-4 whitespace-nowrap">{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={r.id} className="border-b border-[var(--border)]/5 hover:bg-[var(--theme-bg)]/50 transition-colors">
              <TableCell className="px-4 py-4 text-[10px] opacity-30 font-semibold">#{i + 1}</TableCell>
              <TableCell className="px-4 py-4 min-w-[150px]">
                <p className="font-semibold text-sm">{r.guestName}</p>
                <p className="text-[10px] opacity-40">{r.guestEmail}</p>
              </TableCell>
              <TableCell className="px-4 py-4 font-mono text-xs whitespace-nowrap">{r.rooms}</TableCell>
              <TableCell className="px-4 py-4 text-xs whitespace-nowrap">{fmtDate(r.checkInDate)}</TableCell>
              <TableCell className="px-4 py-4 text-xs whitespace-nowrap">{fmtDate(r.bookedCheckOut)}</TableCell>
              <TableCell className="px-4 py-4 text-xs whitespace-nowrap">{fmtDate(r.actualCheckOut)}</TableCell>
              <TableCell className="px-4 py-4">
                <Badge variant="outline" className="text-[10px] border-blue-500/20 text-blue-500">
                  {r.bookedNights}n
                </Badge>
              </TableCell>
              <TableCell className="px-4 py-4">
                {r.earlyCheckout ? (
                  <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500 gap-1">
                    <AlertCircle size={10} /> {r.actualNights}n
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] border-emerald-500/20 text-emerald-500 gap-1">
                    <CheckCircle size={10} /> {r.actualNights}n
                  </Badge>
                )}
              </TableCell>
              <TableCell className="px-4 py-4">
                <Badge className={`text-[10px] ${r.status === 'Checked Out' ? 'bg-emerald-500/10 text-emerald-500 border-none' : 'bg-blue-500/10 text-blue-500 border-none'}`}>
                  {r.status}
                </Badge>
              </TableCell>
              <TableCell className="px-4 py-4">
                <p className="font-bold text-sm text-[var(--theme-text)] whitespace-nowrap">{fmt(r.totalAmount)}</p>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Food/Beverage Table ────────────────────────────────────────────────────────
function FoodCategoryTable({ categories, emptyMsg }) {
  if (!categories?.length) return (
    <Table><TableBody><EmptyState msg={emptyMsg} /></TableBody></Table>
  );
  return (
    <div className="space-y-4 p-2 md:p-4">
      {categories.map(cat => (
        <div key={cat.categoryId} className="rounded-xl overflow-hidden border border-[var(--border)]/10">
          <div className="bg-[var(--theme-bg)]/40 px-3 md:px-5 py-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[var(--theme-text)]">{cat.categoryName}</span>
              <Badge variant="outline" className="text-[10px] border-[var(--border)]/20">
                {cat.totalQty} units
              </Badge>
            </div>
            <span className="font-bold text-[var(--theme-primary)] text-sm">{fmt(cat.totalRevenue)}</span>
          </div>
          <div className="overflow-x-auto">
            <Table className="min-w-[400px] md:min-w-full">
              <TableHeader className="bg-[var(--theme-bg)]/10">
                <TableRow className="border-b border-[var(--border)]/5 hover:bg-transparent">
                  <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-2 px-3 md:px-5">Item</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-2">Qty Sold</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-2 text-right pr-3 md:pr-5">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cat.items.map(item => (
                  <TableRow key={item.name} className="border-b border-[var(--border)]/5 hover:bg-[var(--theme-bg)]/50 transition-colors">
                    <TableCell className="px-3 md:px-5 py-3 font-medium text-sm">{item.name}</TableCell>
                    <TableCell className="py-3">
                      <Badge variant="outline" className="text-[10px] border-[var(--border)]/20">{item.qty}</Badge>
                    </TableCell>
                    <TableCell className="py-3 text-right pr-3 md:pr-5 font-bold text-sm">{fmt(item.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── All-Sales Summary Table ────────────────────────────────────────────────────
function AllSummaryTable({ data }) {
  if (!data) return null;
  const { totals, rooms, foodCategories, beverageCategories } = data;
  const rows = [
    { label: 'Room Stays', desc: 'Checked In & Out paid bookings', icon: Bed, color: 'text-blue-500', bg: 'bg-blue-500/10', value: totals.roomRevenue, count: rooms.length },
    { label: 'Food Orders', desc: 'Direct restaurant payments', icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-500/10', value: totals.directPaymentOrders, count: foodCategories.reduce((s, c) => s + c.totalQty, 0) },
    { label: 'Room Charges', desc: 'Orders billed to guest rooms', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', value: totals.roomBilledOrders, count: '—' },
  ];
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[600px] md:min-w-full">
        <TableHeader className="bg-[var(--theme-bg)]/30">
          <TableRow className="border-b border-[var(--border)]/5 hover:bg-transparent">
            <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-3 pl-6">Stream</TableHead>
            <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-3">Units / Count</TableHead>
            <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-3 text-right pr-6">Revenue</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(r => (
            <TableRow key={r.label} className="border-b border-[var(--border)]/5 hover:bg-[var(--theme-bg)]/50 transition-colors">
              <TableCell className="pl-6 py-5">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg ${r.bg} flex items-center justify-center`}>
                    <r.icon size={16} className={r.color} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{r.label}</p>
                    <p className="text-[10px] opacity-40">{r.desc}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-5">
                <Badge variant="outline" className="text-[10px] border-[var(--border)]/20">{r.count}</Badge>
              </TableCell>
              <TableCell className="py-5 text-right pr-6">
                <p className="font-bold text-lg text-[var(--theme-text)]">{fmt(r.value)}</p>
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-[var(--theme-primary)]/5 border-none">
            <TableCell className="pl-6 py-5 font-bold text-sm uppercase italic text-[var(--theme-primary)]">
              Grand Total Revenue
            </TableCell>
            <TableCell />
            <TableCell className="py-5 text-right pr-6">
              <p className="font-bold text-2xl md:text-3xl text-[var(--theme-primary)] tracking-tighter">{fmt(totals.roomRevenue + totals.foodRevenue)}</p>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
function PopularItemsTable({ items }) {
  if (!items?.length) return (
    <Table><TableBody><EmptyState msg="No popular items data yet" /></TableBody></Table>
  );
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[600px] md:min-w-full">
        <TableHeader className="bg-[var(--theme-bg)]/30">
          <TableRow className="border-b border-[var(--border)]/5 hover:bg-transparent">
            <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-3 pl-6">Rank</TableHead>
            <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-3">Menu Item</TableHead>
            <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-3 text-center">Qty Sold</TableHead>
            <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-3 text-right pr-6">Direct Revenue</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, idx) => (
            <TableRow key={item.menuItemId} className="border-b border-[var(--border)]/5 hover:bg-[var(--theme-bg)]/50 transition-colors">
              <TableCell className="pl-6 py-4 font-mono text-xs opacity-30">#{idx + 1}</TableCell>
              <TableCell className="py-4 font-semibold text-sm">{item.MenuItem?.name}</TableCell>
              <TableCell className="py-4 text-center">
                <Badge variant="outline" className="text-[10px] border-[var(--border)]/20">{item.totalSold} sold</Badge>
              </TableCell>
              <TableCell className="py-4 text-right pr-6 font-bold text-sm">
                {fmt(item.totalSold * (item.MenuItem?.price || 0))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const ReportingAnalytics = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [foodFilter, setFoodFilter] = useState('All');
  const [data, setData] = useState(null);
  const [popularItems, setPopularItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const [salesRes, popularRes] = await Promise.all([
        api.fetchCategorySalesReport(dateRange),
        api.fetchPopularItemsReport({ limit: 10 })
      ]);
      setData(salesRes.data);
      setPopularItems(popularRes.data);
    } catch (err) {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => { fetchReports(); }, []);

  const activeCat = CATEGORIES.find(c => c.key === activeTab);

  const totalFoodItems = data?.foodCategories.reduce((s,c)=>s+c.totalQty,0) || 0;
  
  const kpis = data ? [
    { label: 'Total Revenue',    value: fmt(data.totals.roomRevenue + data.totals.foodRevenue),    sub: 'Excl. Beverages',        icon: DollarSign,  color: 'text-[var(--theme-primary)]', bg: 'bg-[var(--theme-primary)]/10' },
    { label: 'Room Revenue',     value: fmt(data.totals.roomRevenue),     sub: `${data.rooms.length} paid stays`,                              icon: Bed,         color: 'text-blue-500',                bg: 'bg-blue-500/10' },
    { label: 'Food Revenue',     value: fmt(data.totals.foodRevenue),     sub: `${totalFoodItems} items sold`,   icon: Utensils,    color: 'text-orange-500',              bg: 'bg-orange-500/10' },
  ] : [];

  const filteredFoodCategories = data?.foodCategories.filter(c => foodFilter === 'All' || c.categoryName === foodFilter);

  // ── Export Shared Logic ───────────────────────────────────────────────────
  const getExportData = () => {
    if (!data) return null;
    if (activeTab === 'rooms') return data.rooms;
    if (activeTab === 'foods') return filteredFoodCategories.flatMap(c => c.items.map(i => ({ ...i, category: c.categoryName })));
    if (activeTab === 'all') {
      // Consolidate both
      const rooms = data.rooms.map(r => ({ ...r, type: 'Room', label: r.guestName, detail: r.rooms, amount: r.totalAmount }));
      const foods = data.foodCategories.flatMap(c => c.items.map(i => ({ ...i, type: 'Food', label: i.name, detail: c.categoryName, amount: i.revenue })));
      return [...rooms, ...foods];
    }
    return null;
  };

  const exportToCSV = () => {
    const raw = getExportData();
    if (!raw?.length) { toast.error('No data to export'); return; }

    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (activeTab === 'rooms') {
      csvContent += "Guest,Rooms,Check-In,Check-Out,Nights,Amount\n";
      raw.forEach(r => {
        csvContent += `"${r.guestName}","${r.rooms}","${fmtDate(r.checkInDate)}","${fmtDate(r.actualCheckOut)}",${r.actualNights},"${r.totalAmount}"\n`;
      });
    } else if (activeTab === 'foods') {
      csvContent += "Category,Item,Quantity,Revenue\n";
      raw.forEach(r => {
        csvContent += `"${r.category}","${r.name}",${r.qty},"${r.revenue}"\n`;
      });
    } else {
      csvContent += "Type,Item/Guest,Detail,Amount\n";
      raw.forEach(r => {
        csvContent += `"${r.type}","${r.label}","${r.detail}",${r.amount}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Hotel_Report_${activeTab}_${dateRange.startDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Exported');
  };

  const exportToPDF = () => {
    const raw = getExportData();
    if (!raw?.length) { toast.error('No data to export'); return; }

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(60, 55, 51); // --theme-text color approx
    doc.text(`Hotel Sales Report: ${activeTab.toUpperCase()}`, 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Period: ${dateRange.startDate} to ${dateRange.endDate}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 35);

    if (activeTab === 'rooms') {
      autoTable(doc, {
        startY: 45,
        head: [['Guest', 'Rooms', 'Check-In', 'Check-Out', 'Nights', 'Amount']],
        body: raw.map(r => [
          r.guestName, r.rooms, fmtDate(r.checkInDate), fmtDate(r.actualCheckOut), r.actualNights, fmt(r.totalAmount)
        ]),
        headStyles: { fillColor: [195, 163, 112] }, // --theme-primary
      });
    } else if (activeTab === 'foods') {
      autoTable(doc, {
        startY: 45,
        head: [['Category', 'Item', 'Qty', 'Revenue']],
        body: raw.map(r => [
          r.category, r.name, r.qty, fmt(r.revenue)
        ]),
        headStyles: { fillColor: [195, 163, 112] },
      });
    } else {
      autoTable(doc, {
        startY: 45,
        head: [['Type', 'Description', 'Detail', 'Amount']],
        body: raw.map(r => [
          r.type, r.label, r.detail, fmt(r.amount)
        ]),
        headStyles: { fillColor: [195, 163, 112] },
      });
    }

    doc.save(`Hotel_Report_${activeTab}_${dateRange.startDate}.pdf`);
    toast.success('PDF Exported');
  };

  return (
    <div className="px-2 py-1 md:px-4 md:py-2 space-y-5 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--theme-text)] uppercase italic">
            Sales <span className="text-[var(--theme-primary)]">Report</span>
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-40 mt-1">
            Room stays · Food orders · Beverage orders
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[var(--theme-header-bg)] p-3 rounded-2xl shadow-sm border border-[var(--border)]/5">
          <div className="grid grid-cols-2 sm:flex items-center gap-2 px-1 divide-x divide-[var(--border)]/10">
            <div className="flex items-center gap-2 pr-2">
              <Calendar className="h-3.5 w-3.5 opacity-40 shrink-0" />
              <Input 
                type="date" 
                value={dateRange.startDate}
                onChange={e => setDateRange(d => ({ ...d, startDate: e.target.value }))}
                className="bg-transparent border-none p-0 h-auto text-[10px] font-bold uppercase focus-visible:ring-0 min-w-[100px]" 
              />
            </div>
            <div className="flex items-center gap-2 pl-3">
              <Input 
                type="date" 
                value={dateRange.endDate}
                onChange={e => setDateRange(d => ({ ...d, endDate: e.target.value }))}
                className="bg-transparent border-none p-0 h-auto text-[10px] font-bold uppercase focus-visible:ring-0 min-w-[100px]" 
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={fetchReports}
              className="flex-1 sm:flex-none rounded-xl h-9 px-4 bg-[var(--theme-primary)] text-white text-[10px] font-bold uppercase gap-2"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> 
              {loading ? "Updating..." : "Update"}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-1 sm:flex-none rounded-xl h-9 px-4 text-[10px] font-bold uppercase gap-2 border-[var(--border)]/20">
                  <Download size={14} /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[var(--theme-header-bg)] border-[var(--border)]/10 p-2 rounded-2xl shadow-2xl">
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-2 py-2">Choose Format</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[var(--border)]/10 my-1" />
                <DropdownMenuItem onClick={() => exportToCSV()} className="gap-3 py-3 px-3 cursor-pointer rounded-xl focus:bg-[var(--theme-primary)]/10">
                  <div className="h-8 w-8 rounded-lg bg-orange-50 average flex items-center justify-center">
                    <FileText size={16} className="text-orange-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">Spreadsheet (CSV)</span>
                    <span className="text-[10px] opacity-40 font-medium">Best for Excel/Sheets</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToPDF()} className="gap-3 py-3 px-3 cursor-pointer rounded-xl focus:bg-[var(--theme-primary)]/10">
                  <div className="h-8 w-8 rounded-lg bg-red-50 average flex items-center justify-center">
                    <FileDown size={16} className="text-red-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">Document (PDF)</span>
                    <span className="text-[10px] opacity-40 font-medium">Best for printing/sharing</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 shadow-sm" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(k => <KpiCard key={k.label} {...k} />)}
        </div>
      )}

      {/* Category Dropdown Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
        {CATEGORIES.map(cat => {
          const isActive = activeTab === cat.key;
          return (
            <button key={cat.key} onClick={() => setActiveTab(cat.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                ${isActive ? `${cat.bg} ${cat.color} shadow-sm border border-${cat.color.split('-')[1]}-200/50` : 'bg-[var(--theme-header-bg)] opacity-50 hover:opacity-100 hover:bg-[var(--theme-bg)]/50'}`}>
              <cat.icon size={12} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Data Table Section */}
      <Card className="bg-[var(--theme-header-bg)] border-none shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-[var(--theme-bg)]/40 border-b border-[var(--border)]/10 px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-xl ${activeCat.bg} flex items-center justify-center shrink-0`}>
                <activeCat.icon size={18} className={activeCat.color} />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm md:text-base font-black uppercase tracking-tight text-[var(--theme-text)] truncate">{activeCat.label}</CardTitle>
                <CardDescription className="text-[9px] md:text-[10px] uppercase tracking-widest opacity-40 font-bold flex flex-wrap items-center gap-2 mt-0.5">
                  {activeTab === 'all' && 'Consolidated sales across all revenue streams'}
                  {activeTab === 'rooms' && 'Checked-in & checked-out paid room stays'}
                  {activeTab === 'foods' && (
                    <>
                      <span>Showing {foodFilter} food items</span>
                      <select 
                        value={foodFilter}
                        onChange={(e) => setFoodFilter(e.target.value)}
                        className="bg-[var(--theme-bg)] border border-[var(--border)]/20 rounded-lg px-2 py-1 text-[9px] uppercase font-black text-[var(--theme-primary)] outline-none"
                      >
                        <option value="All">All Food Categories</option>
                        {data?.foodCategories.map(c => (
                          <option key={c.categoryId} value={c.categoryName}>{c.categoryName}</option>
                        ))}
                      </select>
                    </>
                  )}
                </CardDescription>
              </div>
            </div>
            {data && activeTab === 'rooms' && (
              <div className="flex items-center gap-3 text-[9px] font-bold opacity-50">
                <span className="flex items-center gap-1.5"><AlertCircle size={12} className="text-amber-500" /> Amber = early checkout</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <SkeletonTable rows={6} />
          ) : (
            <>
              {activeTab === 'all'      && <AllSummaryTable data={data} />}
              {activeTab === 'rooms'    && <RoomTable rows={data?.rooms} />}
              {activeTab === 'foods'    && <FoodCategoryTable categories={filteredFoodCategories} emptyMsg="No food orders served in this period" />}
              {activeTab === 'popular'  && <PopularItemsTable items={popularItems} />}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportingAnalytics;
