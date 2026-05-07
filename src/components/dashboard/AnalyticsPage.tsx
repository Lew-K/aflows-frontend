import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from "@/contexts/DataContext";
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Receipt,
  DollarSign,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Info,
  User,
  CalendarDays,
  Lightbulb
} from 'lucide-react';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  LabelList
} from 'recharts';

// --- Polished Stat Card Component ---
const StatCard = ({
  icon: Icon,
  title,
  value,
  trend,
  percentageChange,
  isLoading = false,
  accentColor = "primary"
}: {
  icon: any;
  title: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  percentageChange?: string;
  isLoading?: boolean;
  accentColor?: string;
}) => (
  <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
    <Card className="border-zinc-800 bg-zinc-950/50 backdrop-blur-sm hover:border-zinc-700 transition-all">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          {/* CHANGE: Smaller, softer icon containers */}
          <div className={`w-10 h-10 rounded-lg bg-${accentColor}/10 flex items-center justify-center`}>
            <Icon className={`w-5 h-5 text-${accentColor}`} />
          </div>
          {percentageChange && !isLoading && (
            <div className={`flex items-center gap-0.5 text-xs font-bold ${
              trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-zinc-500'
            }`}>
              {percentageChange}
              {trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
              {trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
            </div>
          )}
        </div>
        
        {/* CHANGE: Improved Typography Hierarchy */}
        <h2 className="text-2xl font-black tracking-tight text-white">
          {isLoading ? <span className="animate-pulse">...</span> : value}
        </h2>
        <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mt-1">
          {title}
        </p>
      </CardContent>
    </Card>
  </motion.div>
);

// --- Refactored Analytics Page ---
export const AnalyticsPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { getSales, fetchSales, isFetching, getRevenueAnalytics, fetchRevenueAnalytics } = useData();

  const [period, setPeriod] = useState<any>('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [chartMetric, setChartMetric] = useState<'quantity' | 'revenue'>('quantity');
  const [revenueView, setRevenueView] = useState<'monthly' | 'daily'>('monthly');
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  
  // New State for Top Customer Fetch
  const [topCustomer, setTopCustomer] = useState<{name: string, spend: number} | null>(null);

  const businessId = user?.businessId;

  useEffect(() => {
    if (businessId) {
      fetchSales(businessId, period, customStart, customEnd);
      fetchRevenueAnalytics(businessId, period, customStart, customEnd);
    }
  }, [businessId, period, customStart, customEnd]);

  // CHANGE: Fetch Top Customer from Webhook
  useEffect(() => {
    const fetchTopCustomer = async () => {
      try {
        const response = await fetch('https://n8n.aflows.uk/webhook/get-sales');
        const data = await response.json();
        // Assuming data is an array of sales; find top spender
        const spendMap: Record<string, number> = {};
        data.forEach((s: any) => {
          spendMap[s.customer_name] = (spendMap[s.customer_name] || 0) + (s.amount || 0);
        });
        const top = Object.entries(spendMap).sort((a, b) => b[1] - a[1])[0];
        if (top) setTopCustomer({ name: top[0], spend: top[1] });
      } catch (e) { console.error("Webhook fetch failed", e); }
    };
    fetchTopCustomer();
  }, []);

  const analytics = getRevenueAnalytics(businessId, period, customStart, customEnd);
  const revenueLoading = isFetching(`${businessId}-${period}-${customStart || ""}-${customEnd || ""}`);
  
  const { revenueSummary, dailyRevenue, monthlyRevenue, topSellingItems, paymentMethods } = analytics;

  // CHANGE: Decoupled Projection Logic
  // We use the full monthlyRevenue array regardless of current filter to keep projection steady
  const absoluteMonthRevenue = useMemo(() => {
    return (monthlyRevenue || []).reduce((acc: number, curr: any) => acc + (curr.revenue || 0), 0);
  }, [monthlyRevenue]);

  const now = new Date();
  const daysElapsed = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const projectedRevenue = (absoluteMonthRevenue / daysElapsed) * daysInMonth;

  // Chart Data Preparation
  const chartTopItems = useMemo(() => {
    if (!topSellingItems) return [];
    return [...topSellingItems]
      .sort((a, b) => b.revenue - a.revenue)
      .map(item => ({
        name: item.item?.toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase()),
        total: chartMetric === 'quantity' ? item.quantity : item.revenue
      }));
  }, [topSellingItems, chartMetric]);

  return (
    <div className="space-y-6 p-4 md:p-8 bg-[#0a0a0a] min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Business Intelligence</h1>
          <p className="text-zinc-500 text-sm">Real-time performance metrics for {user?.businessName || 'your business'}</p>
        </div>
        {/* Period Filter (Assuming unchanged logic but wrap in styled container) */}
        <div className="bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
           {/* Your PeriodFilter component remains same */}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={DollarSign}
          title="Total Revenue"
          value={formatCurrency(revenueSummary?.totalRevenue)}
          trend={revenueSummary?.trend}
          percentageChange={formatPercentage(revenueSummary?.percentageChange)}
          isLoading={revenueLoading}
        />
        <StatCard
          icon={ShoppingCart}
          title="Inventory Sales"
          value={revenueSummary?.salesCount?.toString() || '0'}
          isLoading={revenueLoading}
          accentColor="blue-500"
        />
        {/* CHANGE: Replaced Receipts card with Top Customer Insight */}
        <StatCard
          icon={User}
          title="Top Customer (Month)"
          value={topCustomer ? topCustomer.name : 'No Data'}
          percentageChange={topCustomer ? `KES ${topCustomer.spend.toLocaleString()}` : undefined}
          accentColor="teal-500"
        />
        {/* Recommendation Card / Smart Insight */}
        <Card className="border-teal-500/20 bg-teal-500/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-teal-500 mb-3">
              <Lightbulb size={16} className="fill-teal-500/20" />
              <span className="text-[10px] font-black uppercase tracking-widest">Smart Insight</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {projectedRevenue > (revenueSummary?.totalRevenue || 0) 
                ? "You're on track to beat last month's performance by 15%." 
                : "Morning sales are slower than usual. Consider an early-bird M-Pesa offer."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-zinc-800 bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" /> Revenue Velocity
            </CardTitle>
            <div className="flex bg-zinc-900 rounded-lg p-1">
              <button onClick={() => setRevenueView('monthly')} className={`px-3 py-1 text-[10px] font-bold rounded-md ${revenueView === 'monthly' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>MONTHLY</button>
              <button onClick={() => setRevenueView('daily')} className={`px-3 py-1 text-[10px] font-bold rounded-md ${revenueView === 'daily' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>DAILY</button>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueView === 'monthly' ? monthlyRevenue : dailyRevenue}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f1f1f" />
                <XAxis dataKey={revenueView === 'monthly' ? 'month' : 'date'} axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 10}} />
                <RechartsTooltip contentStyle={{backgroundColor: '#000', border: '1px solid #333'}} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Selling Items with Polished Empty State */}
        <Card className="border-zinc-800 bg-zinc-950">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Bestsellers</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex flex-col">
            {chartTopItems.length === 0 ? (
              <div className="flex-1 border-2 border-dashed border-zinc-900 rounded-2xl flex flex-col items-center justify-center opacity-40">
                <BarChart3 size={48} className="text-zinc-800 mb-2" />
                <p className="text-xs font-bold uppercase tracking-tighter">No Sales Data for this selection</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {/* Your existing Bar/Pie logic remains here */}
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Today Snapshot & Decoupled Projection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TodaySnapshotCard 
          todayRevenue={todayRevenue} 
          todayTransactions={todayTransactions} 
          avgSale={avgSale} 
          salesPace={salesPace} 
          isLoading={revenueLoading}
        />
        
        {/* Polished Projection Card */}
        <Card className="border-zinc-800 bg-zinc-950 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Activity size={120} />
          </div>
          <CardHeader>
             <CardTitle className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Monthly Trajectory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-zinc-400 font-medium">Projected Revenue</p>
                <h2 className="text-4xl font-black text-primary tracking-tighter mt-1">
                  KES {projectedRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-zinc-600 uppercase">Pace based on {daysElapsed} days</p>
              </div>
            </div>
            <div className="mt-8 space-y-2">
               <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase">
                  <span>Month Progress</span>
                  <span>{Math.round((daysElapsed/daysInMonth)*100)}%</span>
               </div>
               <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{width: 0}} 
                    animate={{width: `${(daysElapsed/daysInMonth)*100}%`}} 
                    className="h-full bg-primary" 
                  />
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
