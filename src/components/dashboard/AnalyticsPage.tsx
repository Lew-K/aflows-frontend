import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { useSales } from '@/hooks/useSales';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart3,
  TrendingUp,
  FileUp,
  Receipt,
  DollarSign,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

// Mock data - structured for backend integration


// const [timeFilter, setTimeFilter] = useState<'month' | 'week'>('month');
// const [sales, setSales] = useState<any[]>([]);

// useEffect(() => {
//   const fetchSales = async () => {
//     const res = await fetch(`/api/sales?period=${timeFilter}`);
//     const data = await res.json();
//     setSales(data);
//   };

//   fetchSales();
// }, [timeFilter]);

// const totalSales = sales.length;

// const { percentageChange, trend } = useMemo(() => {
//   const now = new Date();

//   const thisWeek = sales.filter(sale => {
//     const d = new Date(sale.createdAt);
//     return d >= new Date(now.setDate(now.getDate() - 7));
//   });

//   const lastWeek = sales.filter(sale => {
//     const d = new Date(sale.createdAt);
//     return (
//       d >= new Date(now.setDate(now.getDate() - 14)) &&
//       d < new Date(now.setDate(now.getDate() - 7))
//     );
//   });

//   const diff = thisWeek.length - lastWeek.length;
//   const percent =
//     lastWeek.length === 0 ? 100 : (diff / lastWeek.length) * 100;

//   return {
//     percentageChange: `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`,
//     trend: percent >= 0 ? 'up' : 'down',
//   };
// }, [sales]);



// const stats = [
//   {
//     title: 'Total Revenue',
//     value: 'KES 1,245,000',
//     change: '+12.5%',
//     trend: 'up',
//     icon: DollarSign,
//   },
//   {
//     title: 'Total Sales',
//     value: '842',
//     change: '+8.2%',
//     trend: 'up',
//     icon: ShoppingCart,
//   },
//   {
//     title: 'Receipts Generated',
//     value: '756',
//     change: '+15.3%',
//     trend: 'up',
//     icon: Receipt,
//   },
//   {
//     title: 'Files Uploaded',
//     value: '234',
//     change: '-2.1%',
//     trend: 'down',
//     icon: FileUp,
//   },
// ];

// const revenueData: any[] = [];
// const salesByCategory: any[] = [];
// const recentActivity: any[] = [];



const revenueData = [
  { month: 'Jan', revenue: 85000 },
  { month: 'Feb', revenue: 92000 },
  { month: 'Mar', revenue: 108000 },
  { month: 'Apr', revenue: 95000 },
  { month: 'May', revenue: 125000 },
  { month: 'Jun', revenue: 145000 },
  { month: 'Jul', revenue: 168000 },
];

const salesByCategory = [
  { category: 'Electronics', sales: 45 },
  { category: 'Clothing', sales: 32 },
  { category: 'Food', sales: 28 },
  { category: 'Services', sales: 52 },
  { category: 'Other', sales: 18 },
];

const recentActivity = [
  { id: 1, action: 'New sale recorded', amount: 'KES 12,500', time: '2 min ago' },
  { id: 2, action: 'Receipt generated', amount: '#RC-2024-0842', time: '5 min ago' },
  { id: 3, action: 'File uploaded', amount: 'Invoice_March.pdf', time: '12 min ago' },
  { id: 4, action: 'New sale recorded', amount: 'KES 8,750', time: '25 min ago' },
  { id: 5, action: 'M-Pesa statement uploaded', amount: 'Statement_Q1.pdf', time: '1 hour ago' },
];

export const AnalyticsPage = () => {

  const [fetchKey, setFetchKey] = useState(0);

  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const { user } = useAuth(); 
  const [period, setPeriod] = useState<
    'today' | 'yesterday' | 'this_week' |'last_week' | 'this_month' | 'last_month' | 'this_quarter' | 'last_quarter' | 'custom'
  >('this_month');

  const { sales, loading } = useSales(
    user.businessId ?? '',
    period,
    customStart,
    customEnd,
    fetchKey
  );
    
  
  // useEffect(() => {

  //   const fetchSales = async (start?: string, end?: string) => {
  //     const url = new URL('/api/sales', window.location.origin);
  //     url.searchParams.append('period', period);
  //     if (start) url.searchParams.append('start', start);
  //     if (end) url.searchParams.append('end', end);
    
    
  //   // const fetchSales = async () => {
  //   //   const res = await fetch(`/api/sales?period=${period}`);
  //   //   // const res = await fetch(`/api/sales?period=${timeFilter}`);
  //   //   const data = await res.json();
  //   //   setSales(data);
  //   };
  
  //   fetchSales();
  // }, [period]);
  
  const totalSales = sales?.length ?? 0;
  
  const { percentageChange, trend } = useMemo(() => {

    const now = Date.now();

    const thisWeek = (sales ?? []).filter((sale: any) => {
      const d = new Date(sale.createdAt).getTime();
      return d >= now - 7 * 24 * 60 * 60 * 1000;
    });
  
    const lastWeek = (sales ?? []).filter((sale: any) => {
      const d = new Date(sale.createdAt).getTime();
      return (
        d >= now - 14 * 24 * 60 * 60 * 1000 &&
        d < now - 7 * 24 * 60 * 60 * 1000
      );
    });
  
    const diff = thisWeek.length - lastWeek.length;
  
    let percent: number | null = null;
  
    if (lastWeek.length > 0) {
      percent = (diff / lastWeek.length) * 100;
    }
  
    return {
      percentageChange:
        percent === null
          ? 'New activity'
          : `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`,
      trend:
        percent === null ? 'neutral' : percent >= 0 ? 'up' : 'down',
    };
  }, [sales]);

  useEffect(() => {
    console.log('Business ID:', user?.businessId);
    console.log('Sales from hook:', sales);
  }, [sales, user]);


  // useEffect(() => {
  //   if (period === 'custom' && (!customStart || !customEnd)) {
  //     return; // Don't fetch until both dates are set
  //   }
  // }, [period, customStart, customEnd]);








    
  //   const percent =
  //     lastWeek.length === 0 ? 100 : (diff / lastWeek.length) * 100;
  
  //   return {
  //     percentageChange: `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`,
  //     trend: percent >= 0 ? 'up' : 'down',
  //   };
  // }, [sales]);
  //   const now = new Date();
  
  //   const thisWeek = sales.filter(sale => {
  //     const d = new Date(sale.createdAt);
  //     return d >= new Date(now.setDate(now.getDate() - 7));
  //   });
  
  //   const lastWeek = sales.filter(sale => {
  //     const d = new Date(sale.createdAt);
  //     return (
  //       d >= new Date(now.setDate(now.getDate() - 14)) &&
  //       d < new Date(now.setDate(now.getDate() - 7))
  //     );
  //   });
  
  //   const diff = thisWeek.length - lastWeek.length;
  //   const percent =
  //     lastWeek.length === 0 ? 100 : (diff / lastWeek.length) * 100;
  
  //   return {
  //     percentageChange: `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`,
  //     trend: percent >= 0 ? 'up' : 'down',
  //   };
  // }, [sales]);
  
  
  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
             Overview of your business performance (
             {period === 'today'
               ? 'Today'
               : period === 'yesterday'
               ? 'Yesterday'
               : period === 'this_week'
               ? 'This Week'
               : period === 'last_week'
               ? 'Last Week'
               : period === 'this_month'
               ? 'This Month'
               : period === 'last_month'
               ? 'Last Month'
               : period === 'this_quarter'
               ? 'This Quarter'
               : period === 'last_quarter'
               ? 'Last Quarter'
               : period === 'custom'
               ? 'Custom Range'
               : 'This Month'}
            )

          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this_week">This Week</option>
            <option value="last_week">Last Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_quarter">This Quarter</option>
            <option value="last_quarter">Last Quarter</option>
            <option value="custom">Custom Range</option>
          </select>
        
          {period === 'custom' && (
            <>
              {/* DatePickers here */}
              <button
                onClick={() => {
                  if (customStart && customEnd) {
                    setFetchKey((prev) => prev + 1);
                  }
                }}
                disabled={!customStart || !customEnd}
                className="
                  h-10
                  rounded-xl
                  bg-primary
                  px-4
                  text-sm
                  font-medium
                  text-white
                  shadow-sm
                  transition
                  hover:bg-primary/90
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                Apply
              </button>
            </>
          )}
        </div>


        
       {/* <div className="flex flex-wrap items-center gap-3">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="border rounded-md px-3 py-2 text-sm bg-background"
        >
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="this_week">This Week</option>
          <option value="last_week">Last Week</option>
          <option value="this_month">This Month</option>
          <option value="last_month">Last Month</option>
          <option value="this_quarter">This Quarter</option>
          <option value="last_quarter">Last Quarter</option>
          <option value="custom">Custom Range</option>
        </select>
        {period === 'custom' && (
          <div className="flex gap-2 mt-2 items-center">
            <DatePicker
              selected={customStart ? new Date(customStart) : null}
              onChange={(date: Date) =>
                setCustomStart(date.toISOString().split('T')[0])
              }
              placeholderText="From"
              popperClassName="z-50"
              className="
                h-10
                w-36
                rounded-xl
                border
                border-border
                bg-card
                px-3
                text-sm
                text-foreground
                shadow-sm
                focus:outline-none
                focus:ring-2
                focus:ring-primary/50
              "
              
              {/* className="border rounded px-2 py-1 bg-background text-foreground"
              calendarClassName="dark:bg-gray-800 dark:text-white"
              dayClassName={(date) =>
                `hover:bg-primary/30 dark:hover:bg-primary/50 ${
                  customStart === date.toISOString().split('T')[0]
                    ? 'bg-primary/50 dark:bg-primary/70'
                    : ''
                }`
      //         } */}
      //       />
      //       <DatePicker
      //         selected={customEnd ? new Date(customEnd) : null}
      //         onChange={(date: Date) =>
      //           setCustomEnd(date.toISOString().split('T')[0])
      //         }
      //         placeholderText="To"
      //         popperClassName="z-50"
      //         className="
      //           h-10
      //           w-36
      //           rounded-xl
      //           border
      //           border-border
      //           bg-card
      //           px-3
      //           text-sm
      //           text-foreground
      //           shadow-sm
      //           focus:outline-none
      //           focus:ring-2
      //           focus:ring-primary/50
      //         "


              
      //         {/* className="border rounded px-2 py-1 bg-background text-foreground"
      //         calendarClassName="dark:bg-gray-800 dark:text-white"
      //         dayClassName={(date) =>
      //           `hover:bg-primary/30 dark:hover:bg-primary/50 ${
      //             customEnd === date.toISOString().split('T')[0]
      //               ? 'bg-primary/50 dark:bg-primary/70'
      //               : ''
      //           }`
      //         } */}
      //       />
      //       <button
      //         onClick={() => {
      //           if (customStart && customEnd) {
      //             setFetchKey((prev) => prev + 1);
      //           }
      //         }}
      //         className="px-3 py-1 bg-primary text-white rounded hover:bg-primary/90 transition-colors" */}
      //       >
      //         Apply
      //       </button>
      //     </div>
      //   )}

      // </div>


      
  

      {/* Stats Grid */}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="hover:shadow-soft transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">KES 1,245,000</p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </CardContent>
          </Card>
        </motion.div>
      
        {/* ✅ TOTAL SALES (DYNAMIC) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="hover:shadow-soft transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-primary" />
                </div>

                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    trend === 'up'
                     ? 'text-success'
                     : trend === 'down'
                     ? 'text-destructive'
                     : 'text-muted-foreground'
                }`}
              >                  
                {
                  percentageChange === 'New activity'
                    ? 'No previous data'
                    : `${percentageChange} vs previous period`
                }
                  
                {trend === 'up' && <ArrowUpRight className="w-4 h-4" />}
                {trend === 'down' && <ArrowDownRight className="w-4 h-4" />}
              </div>

            </div>
      
              <p className="text-2xl font-bold text-foreground">
               {loading
                 ? '...'
                 : totalSales > 0
                 ? totalSales
                 : '—'}
              </p>
              <p className="text-sm text-muted-foreground">Total Sales</p>
            </CardContent>
          </Card>
        </motion.div>
      
        {/* Receipts Generated */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="hover:shadow-soft transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">756</p>
              <p className="text-sm text-muted-foreground">Receipts Generated</p>
            </CardContent>
          </Card>
        </motion.div>
      
        {/* Files Uploaded */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="hover:shadow-soft transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <FileUp className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">234</p>
              <p className="text-sm text-muted-foreground">Files Uploaded</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      

      
      

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData ?? []}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Sales by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium text-foreground">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.amount}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
