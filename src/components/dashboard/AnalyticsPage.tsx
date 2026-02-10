import React from 'react';
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


const [timeFilter, setTimeFilter] = useState<'month' | 'week'>('month');
const [sales, setSales] = useState<any[]>([]);

useEffect(() => {
  const fetchSales = async () => {
    const res = await fetch(`/api/sales?period=${timeFilter}`);
    const data = await res.json();
    setSales(data);
  };

  fetchSales();
}, [timeFilter]);

const totalSales = sales.length;

const { percentageChange, trend } = useMemo(() => {
  const now = new Date();

  const thisWeek = sales.filter(sale => {
    const d = new Date(sale.createdAt);
    return d >= new Date(now.setDate(now.getDate() - 7));
  });

  const lastWeek = sales.filter(sale => {
    const d = new Date(sale.createdAt);
    return (
      d >= new Date(now.setDate(now.getDate() - 14)) &&
      d < new Date(now.setDate(now.getDate() - 7))
    );
  });

  const diff = thisWeek.length - lastWeek.length;
  const percent =
    lastWeek.length === 0 ? 100 : (diff / lastWeek.length) * 100;

  return {
    percentageChange: `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`,
    trend: percent >= 0 ? 'up' : 'down',
  };
}, [sales]);



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

// const revenueData = [
//   { month: 'Jan', revenue: 85000 },
//   { month: 'Feb', revenue: 92000 },
//   { month: 'Mar', revenue: 108000 },
//   { month: 'Apr', revenue: 95000 },
//   { month: 'May', revenue: 125000 },
//   { month: 'Jun', revenue: 145000 },
//   { month: 'Jul', revenue: 168000 },
// ];

// const salesByCategory = [
//   { category: 'Electronics', sales: 45 },
//   { category: 'Clothing', sales: 32 },
//   { category: 'Food', sales: 28 },
//   { category: 'Services', sales: 52 },
//   { category: 'Other', sales: 18 },
// ];

// const recentActivity = [
//   { id: 1, action: 'New sale recorded', amount: 'KES 12,500', time: '2 min ago' },
//   { id: 2, action: 'Receipt generated', amount: '#RC-2024-0842', time: '5 min ago' },
//   { id: 3, action: 'File uploaded', amount: 'Invoice_March.pdf', time: '12 min ago' },
//   { id: 4, action: 'New sale recorded', amount: 'KES 8,750', time: '25 min ago' },
//   { id: 5, action: 'M-Pesa statement uploaded', amount: 'Statement_Q1.pdf', time: '1 hour ago' },
// ];

export const AnalyticsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Overview of your business performance</p>
      </div>

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
                    trend === 'up' ? 'text-success' : 'text-destructive'
                  }`}
                >
                  {percentageChange}
                  {trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                </div>
              </div>
      
              <p className="text-2xl font-bold text-foreground">{totalSales}</p>
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
                  <AreaChart data={revenueData}>
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
