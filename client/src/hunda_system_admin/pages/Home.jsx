import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { 
  Badge 
} from "@/components/ui/badge";
import { 
  Separator 
} from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Hotel, 
  Users, 
  Bell
} from "lucide-react";

const Home = () => {
  const profile = JSON.parse(localStorage.getItem('profile'))?.user || {};

  return (
    <AdminLayout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight opacity-90 uppercase">
            System Overview
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">
            Monitoring global system performance and activations.
          </p>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="px-4 py-1.5 font-bold uppercase tracking-widest text-[10px] bg-white border-slate-200">
            Real-time Sync Active
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="border-none shadow-sm ring-1 ring-slate-200/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-slate-500">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest">Total Hotels</CardTitle>
            <Hotel className="h-4 w-4 text-[var(--theme-primary)]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black opacity-90 tracking-tighter">124</div>
            <p className="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-1 uppercase tracking-wider">
              <span>+12.5%</span> 
              <span className="text-slate-400 font-medium">Growth Index</span>
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm ring-1 ring-slate-200/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-slate-500">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest">System Admins</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black opacity-90 tracking-tighter">12</div>
            <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">Operational Status: Optimal</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm ring-1 ring-slate-200/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-slate-500">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest">Gross Revenue</CardTitle>
            <span className="text-xs font-black text-green-500">$</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 tracking-tighter">$45,231</div>
            <p className="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-1 uppercase tracking-wider">
              <span>+20.1%</span> 
              <span className="text-slate-400 font-medium">Monthly Yield</span>
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm ring-1 ring-slate-200/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-slate-500">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest">Network Request</CardTitle>
            <Bell className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 tracking-tighter">573</div>
            <p className="text-[10px] text-blue-600 font-bold flex items-center gap-1 mt-1 uppercase tracking-wider">
              <span>+201</span> 
              <span className="text-slate-400 font-medium">Session Traffic</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <div className="flex items-center justify-between mb-6">
           <TabsList className="bg-[var(--theme-bg)] p-1 border border-[var(--theme-border)]">
            <TabsTrigger value="overview" className="text-[10px] font-black uppercase tracking-widest px-6 data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-white transition-all">Performance</TabsTrigger>
            <TabsTrigger value="activities" className="text-[10px] font-black uppercase tracking-widest px-6 data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-white transition-all">Logs</TabsTrigger>
            <TabsTrigger value="hotellist" className="text-[10px] font-black uppercase tracking-widest px-6 data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-white transition-all">Infrastructure</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-none shadow-sm ring-1 ring-slate-200/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-black uppercase tracking-tight">Booking Stream</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">Aggregated real-time booking distribution.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-slate-100">
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">ID</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hotel Node</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                      <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Credit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-slate-50 transition-colors hover:bg-slate-50/50 group">
                      <TableCell className="font-bold text-xs px-4">INV-A01</TableCell>
                      <TableCell className="font-bold text-xs">GRAND HILTON ADDIS</TableCell>
                      <TableCell><Badge className="bg-green-500/10 text-green-600 border-none text-[9px] font-black uppercase px-2 py-0.5">Verified</Badge></TableCell>
                      <TableCell className="text-right font-black text-xs px-4 text-[var(--theme-primary)]">$250.00</TableCell>
                    </TableRow>
                    <TableRow className="border-slate-50 transition-colors hover:bg-slate-50/50 group">
                      <TableCell className="font-bold text-xs px-4">INV-A02</TableCell>
                      <TableCell className="font-bold text-xs">SHERATON REGENCY</TableCell>
                      <TableCell><Badge className="bg-orange-500/10 text-orange-600 border-none text-[9px] font-black uppercase px-2 py-0.5">Process</Badge></TableCell>
                      <TableCell className="text-right font-black text-xs px-4 text-[var(--theme-primary)]">$150.00</TableCell>
                    </TableRow>
                    <TableRow className="border-slate-50 transition-colors hover:bg-slate-50/50 group">
                      <TableCell className="font-bold text-xs px-4">INV-A03</TableCell>
                      <TableCell className="font-bold text-xs">SKYLIGHT INTERNATIONAL</TableCell>
                      <TableCell><Badge className="bg-red-500/10 text-red-600 border-none text-[9px] font-black uppercase px-2 py-0.5">Rejected</Badge></TableCell>
                      <TableCell className="text-right font-black text-xs px-4 text-[var(--theme-primary)]">$350.00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-slate-200/50 h-fit">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-black uppercase tracking-tight">Telemetry</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">Core server health and resource audit.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">CPU Load</span>
                    <span className="font-black text-[10px] text-green-600 uppercase tracking-widest tracking-wide">42% NOMINAL</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--theme-primary)] w-[42%]"></div>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Memory</span>
                    <span className="font-black text-[10px] text-orange-600 uppercase tracking-widest tracking-wide">68% PEAK</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 w-[68%]"></div>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Latency</span>
                    <span className="font-black text-[10px] text-green-600 uppercase tracking-widest tracking-wide">12MS ULTRA</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--theme-primary)] w-[15%]"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="activities">
           <Card className="border-none shadow-sm ring-1 ring-slate-200/50">
            <CardHeader>
              <CardTitle className="text-lg font-black uppercase tracking-tight">System Logs</CardTitle>
              <CardDescription className="text-xs font-medium text-slate-500">Encrypted audit trail of administrative actions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4 p-4 hover:bg-slate-50/80 rounded-xl transition-all border border-transparent hover:border-slate-100">
                  <Avatar className="h-9 w-9 ring-2 ring-blue-50">
                    <AvatarFallback className="bg-slate-900 text-white text-[10px] font-black">SY</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-bold text-slate-900 tracking-tight">
                      <span className="text-blue-600 uppercase font-black">ADMIN_001</span> initiated NODE_CREATE for "Luxury Palace Resort".
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-widest">T+ 02 MINS AGO</p>
                  </div>
                </div>
                <Separator className="opacity-40" />
                <div className="flex gap-4 p-4 hover:bg-slate-50/80 rounded-xl transition-all border border-transparent hover:border-slate-100">
                  <Avatar className="h-9 w-9 ring-2 ring-orange-50">
                    <AvatarFallback className="bg-slate-900 text-white text-[10px] font-black">CP</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-bold text-slate-900 tracking-tight">
                      <span className="text-orange-600 uppercase font-black">COMPANY_MGR</span> committed PRICE_SYNC for "Grand Hilton".
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-widest">T+ 45 MINS AGO</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default Home;

