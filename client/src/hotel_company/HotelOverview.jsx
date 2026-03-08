import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Hotel,
  Bed,
  Utensils,
  ChevronRight,
  BarChart3,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import * as api from '@/api';

const Skeleton = ({ className }) => (
  <div className={`relative overflow-hidden bg-[var(--theme-primary)]/5 rounded-xl ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-[var(--theme-primary)]/10 to-transparent" />
  </div>
);

const HotelOverview = () => {
  const navigate = useNavigate();
  const [occupancyData, setOccupancyData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const dateRange = {
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      };

      const [occupancy, revenue, sales, trend] = await Promise.all([
        api.fetchOccupancyReport(dateRange),
        api.fetchRevenueReport(dateRange),
        api.fetchSalesReport(dateRange),
        api.fetchRevenueTrend(dateRange)
      ]);

      setOccupancyData(occupancy.data);
      setRevenueData(revenue.data);
      setSalesData(sales.data);
      setRevenueTrend(trend.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const occupancyChartData = [
    { name: 'Occupied', value: parseFloat(occupancyData?.bookedUnits || 0) },
    { name: 'Available', value: parseFloat((occupancyData?.totalRooms || 0) - (occupancyData?.bookedUnits || 0)) }
  ];

  const totalStaff = 24; // Hardcoded for now as it's not in the report API yet
  
  const renderStatValue = (val, formatter = (v) => v) => {
    if (loading) return <Skeleton className="h-8 w-24 mt-2" />;
    return <h3 className="text-2xl md:text-3xl font-semibold text-[var(--theme-text)] mt-1 tracking-tight">{formatter(val)}</h3>;
  };

  return (
    <div className="px-2 py-1 md:px-4 md:py-2 space-y-3 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--theme-text)] uppercase italic">Hotel <span className="text-[var(--theme-primary)]">Overview</span></h1>
          <p className="text-[10px] md:text-xs font-medium uppercase tracking-widest opacity-40 mt-1 italic">Snapshot of your hotel's pulse over the last 30 days</p>
        </div>
        <div className="flex items-center gap-2 bg-[var(--theme-header-bg)] px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-transparent self-start md:self-auto shadow-sm">
          <Calendar className="h-3 md:h-4 w-3 md:w-4 opacity-40" />
          <span className="text-[10px] font-semibold uppercase opacity-40">Last 30 Days</span>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Revenue Card */}
        <Card className="bg-[var(--theme-header-bg)] border-none shadow-sm rounded-xl overflow-hidden group relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-5 md:p-6 relative z-10">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500 transition-colors group-hover:bg-emerald-500/20">
                <DollarSign size={20} />
              </div>
              <div className="flex items-center text-emerald-500 text-[10px] font-semibold italic">
                <ArrowUpRight className="h-3.5 w-3.5" />
                +14%
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.15em] opacity-40">Total Revenue</p>
              {renderStatValue(revenueData?.totalRevenue, v => `${(v || 0).toLocaleString()} ETB`)}
            </div>
          </CardContent>
        </Card>

        {/* Occupancy Card */}
        <Card className="bg-[var(--theme-header-bg)] border-none shadow-sm rounded-xl overflow-hidden group relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-5 md:p-6 relative z-10">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500 transition-colors group-hover:bg-blue-500/20">
                <Bed size={20} />
              </div>
              <div className="flex items-center text-blue-500 text-[10px] font-semibold italic">
                <TrendingUp className="h-3.5 w-3.5" />
                High Demand
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.15em] opacity-40">Occupancy</p>
              {renderStatValue(occupancyData?.occupancyRate, v => `${v || 0}%`)}
            </div>
          </CardContent>
        </Card>

        {/* Restaurant Card */}
        <Card className="bg-[var(--theme-header-bg)] border-none shadow-sm rounded-xl overflow-hidden group relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-5 md:p-6 relative z-10">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-pink-500/10 rounded-xl text-pink-500 transition-colors group-hover:bg-pink-500/20">
                <Utensils size={20} />
              </div>
              <div className="flex items-center text-red-500 text-[10px] font-semibold italic">
                <ArrowDownRight className="h-3.5 w-3.5" />
                -2% Seasonal
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.15em] opacity-40">Restaurant</p>
              {renderStatValue(revenueData?.orderRevenue, v => `${(v || 0).toLocaleString()} ETB`)}
            </div>
          </CardContent>
        </Card>

        {/* Staff Card */}
        <Card className="bg-[var(--theme-header-bg)] border-none shadow-sm rounded-xl overflow-hidden group relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-5 md:p-6 relative z-10">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-500 transition-colors group-hover:bg-purple-500/20">
                <Users size={20} />
              </div>
              <div className="flex items-center text-purple-500 text-[10px] font-semibold italic">
                <ChevronRight className="h-3.5 w-3.5" />
                {occupancyData?.bookedUnits} Active
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.15em] opacity-40">Total Staff</p>
              {renderStatValue(totalStaff)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Revenue Performance Area Chart */}
        <Card className="lg:col-span-2 bg-[var(--theme-header-bg)] border-none shadow-sm rounded-2xl p-6 md:p-8 overflow-hidden relative">
          <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-[var(--theme-primary)]/5 rounded-full blur-[80px] pointer-events-none" />
          <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between pb-6 border-b border-[var(--border)]/50">
            <div>
              <CardTitle className="text-lg md:text-xl font-semibold uppercase text-[var(--theme-text)] italic">Performance <span className="text-[var(--theme-primary)]">Trends</span></CardTitle>
              <CardDescription className="text-[10px] font-medium uppercase tracking-widest opacity-40">Financial growth trajectory</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="rounded-lg opacity-40 hover:opacity-100 transition-all hover:bg-[var(--theme-primary)]/10" onClick={() => navigate('/hotel-dashboard/analytics')}>
              <BarChart3 className="h-5 w-5" />
            </Button>
          </CardHeader>
          <div className="h-[250px] md:h-[350px] w-full mt-6 relative z-10">
            {loading ? (
              <div className="w-full h-full flex flex-col gap-4">
                <Skeleton className="w-full h-full rounded-xl" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--theme-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--theme-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 'medium', textTransform: 'uppercase', opacity: 0.4 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 'medium', opacity: 0.4 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--theme-header-bg)', 
                      borderColor: 'var(--border)', 
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 'medium',
                      textTransform: 'uppercase',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                    }} 
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--theme-primary)" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Status Hub (Occupancy + Quick Actions) */}
        <div className="space-y-6 md:space-y-8">
          <Card className="bg-[var(--theme-header-bg)] border-none shadow-sm rounded-2xl p-6 md:p-8 flex flex-col items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[var(--theme-primary)]/5 to-transparent pointer-events-none" />
            <CardHeader className="px-0 pt-0 w-full text-center relative z-10">
              <CardTitle className="text-lg md:text-xl font-semibold uppercase text-[var(--theme-text)] italic">Room <span className="text-[var(--theme-primary)]">Fill</span></CardTitle>
            </CardHeader>
            <div className="h-[180px] md:h-[200px] w-full relative mt-4 z-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                  >
                    {occupancyChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--theme-primary)' : 'rgba(255,255,255,0.05)'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                {loading ? <Skeleton className="h-10 w-16 mb-1 rounded-lg" /> : <span className="text-2xl md:text-3xl font-semibold text-[var(--theme-text)] tracking-tight">{occupancyData?.occupancyRate || 0}%</span>}
                <span className="text-[8px] md:text-[9px] font-medium uppercase opacity-20 tracking-widest mt-0.5">Occupied</span>
              </div>
            </div>
            <div className="w-full mt-6 md:mt-8 space-y-3 relative z-10">
               <div className="flex items-center justify-between bg-[var(--theme-bg)]/20 p-3.5 md:p-4 rounded-xl border-none shadow-sm transition-colors hover:bg-[var(--theme-bg)]/30">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-[var(--theme-primary)]" />
                    <span className="text-[10px] font-semibold uppercase text-[var(--theme-text)]">Booked Units</span>
                  </div>
                  {loading ? <Skeleton className="h-5 w-8" /> : <span className="text-sm font-semibold text-[var(--theme-text)]">{occupancyData?.bookedUnits || 0}</span>}
               </div>
               <div className="flex items-center justify-between bg-[var(--theme-bg)]/20 p-3.5 md:p-4 rounded-xl border-none shadow-sm transition-colors hover:bg-[var(--theme-bg)]/30">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-[var(--theme-text)]/10" />
                    <span className="text-[10px] font-semibold uppercase text-[var(--theme-text)]">Available</span>
                  </div>
                  {loading ? <Skeleton className="h-5 w-8" /> : <span className="text-sm font-semibold text-[var(--theme-text)]">{(occupancyData?.totalRooms || 0) - (occupancyData?.bookedUnits || 0)}</span>}
               </div>
            </div>
          </Card>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <Button 
              variant="outline"
              onClick={() => navigate('/hotel-dashboard/room-management')} 
              className="h-20 md:h-24 rounded-xl flex-col gap-2 bg-[var(--theme-header-bg)] border-none shadow-sm text-[var(--theme-text)] hover:bg-[var(--theme-primary)] hover:text-white transition-all group hover:border-solid"
            >
              <Hotel className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] md:text-[10px] font-semibold uppercase">Rooms</span>
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/hotel-dashboard/bookings')} 
              className="h-20 md:h-24 rounded-xl flex-col gap-2 bg-[var(--theme-header-bg)] border-none shadow-sm text-[var(--theme-text)] hover:bg-[var(--theme-primary)] hover:text-white transition-all group hover:border-solid"
            >
              <Calendar className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] md:text-[10px] font-semibold uppercase">Book</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelOverview;
