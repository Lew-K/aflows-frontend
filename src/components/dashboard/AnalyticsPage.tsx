import React from 'react';
import { LabelList } from "recharts";
import { useAuth } from '@/contexts/AuthContext';
import { useSales } from '@/hooks/useSales';
import { useRevenueAnalytics } from "@/hooks/useRevenueAnalytics";
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

// Constants
const PERIOD_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_quarter', label: 'This Quarter' },
  { value: 'last_quarter', label: 'Last Quarter' },
  { value: 'custom', label: 'Custom Range' },
] as const;

const ANIMATION_VARIANTS = {
  card: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
};

// Helper Functions
const getPeriodLabel = (period: string): string => {
  const found = PERIOD_OPTIONS.find(opt => opt.value === period);
  return found?.label || 'This Month';
};

const formatCurrency = (value: number | null | undefined): string => {
  if (value == null) return '—';
  return `KES ${value.toLocaleString()}`;
};

const formatPercentage = (value: number | null | undefined, prefix = true): string => {
  if (value == null) return '0%';
  const sign = prefix && value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

// Stat Card Component
const StatCard = ({
  icon: Icon,
  title,
  value,
  trend,
  percentageChange,
  isLoading = false,
}: {
  icon: any;
  title: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  percentageChange?: string;
  isLoading?: boolean;
}) => (
  <motion.div
    initial={ANIMATION_VARIANTS.card.initial}
    animate={ANIMATION_VARIANTS.card.animate}
    transition={{ duration: 0.4 }}
  >
    <Card className="hover:shadow-soft transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
        
        <p className="text-2xl font-bold text-foreground">
          {isLoading ? '...' : value}
        </p>
        
        {percentageChange && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend === 'up'
                ? 'text-success'
                : trend === 'down'
                ? 'text-destructive'
                : 'text-muted-foreground'
            }`}
          >
            {percentageChange}
            {trend === 'up' && <ArrowUpRight className="w-4 h-4" />}
            {trend === 'down' && <ArrowDownRight className="w-4 h-4" />}
          </div>
        )}
        
        <p className="text-sm text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  </motion.div>
);

// Period Filter Component
const PeriodFilter = ({
  period,
  customStart,
  customEnd,
  onPeriodChange,
  onCustomStartChange,
  onCustomEndChange,
  onApplyCustom,
}: {
  period: string;
  customStart: string;
  customEnd: string;
  onPeriodChange: (value: string) => void;
  onCustomStartChange: (value: string) => void;
  onCustomEndChange: (value: string) => void;
  onApplyCustom: () => void;
}) => (
  <div className="flex flex-wrap items-center gap-3">
    <select
      value={period}
      onChange={(e) => onPeriodChange(e.target.value)}
      className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      {PERIOD_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>

    {period === 'custom' && (
      <div className="flex items-center gap-3">
        <input
          type="date"
          value={customStart}
          onChange={(e) => onCustomStartChange(e.target.value)}
          className="h-10 w-36 rounded-xl border border-border bg-card px-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-label="Start date"
        />

        <input
          type="date"
          value={customEnd}
          onChange={(e) => onCustomEndChange(e.target.value)}
          className="h-10 w-36 rounded-xl border border-border bg-card px-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-label="End date"
        />

        <button
          onClick={onApplyCustom}
          disabled={!customStart || !customEnd}
          className="h-10 rounded-xl bg-primary px-4 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Apply
        </button>
      </div>
    )}
  </div>
);

// Payment Breakdown Component
const PaymentBreakdown = ({
  paymentChartData,
  totalSales,
  isLoading,
}: {
  paymentChartData: any[];
  totalSales: number;
  isLoading: boolean;
}) => (
  <motion.div
    initial={ANIMATION_VARIANTS.card.initial}
    animate={ANIMATION_VARIANTS.card.animate}
    transition={{ duration: 0.4 }}
  >
    <Card className="hover:shadow-soft transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Payment Breakdown
          </p>
        </div>

        <div
          className="mt-2"
          style={{
            height: `${paymentChartData.length * 28}px`,
            minHeight: "56px",
          }}
        >
          {isLoading ? (
            <p className="text-xs text-muted-foreground text-center mt-6">
              Loading...
            </p>
          ) : paymentChartData.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center mt-6">
              <p>No payments recorded</p>
              <p>This month</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={paymentChartData}
                margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
              >
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  width={80}
                  fontSize={12}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return (
                        <div
                          className="rounded-lg border border-border bg-card p-2 text-xs shadow-md"
                        >
                          <div className="font-semibold mb-1">{data.name}</div>
                          <div>Revenue: KES {data.revenue.toLocaleString()}</div>
                          <div>Transactions: {data.percentage}%</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="percentage"
                  fill="hsl(var(--primary))"
                  radius={[6, 6, 6, 6]}
                  isAnimationActive
                  animationDuration={800}
                >
                  <LabelList
                    dataKey="percentage"
                    position="insideRight"
                    formatter={(value: any) => `${value}%`}
                    style={{
                      fill: "hsl(var(--primary-foreground))",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground font-medium">
              Receipts Generated
            </p>
          </div>
          <div className="flex items-center gap-1">
            <p className="text-sm font-bold text-foreground">{totalSales}</p>
            <span className="text-xs font-medium text-success">↑ 12%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Revenue Trend Component
const RevenueTrend = ({
  revenueData,
  dailyRevenue,
  revenueView,
  onRevenueViewChange,
  isLoading,
}: {
  revenueData: any[];
  dailyRevenue: any[];
  revenueView: 'monthly' | 'daily';
  onRevenueViewChange: (view: 'monthly' | 'daily') => void;
  isLoading: boolean;
}) => (
  <motion.div
    initial={ANIMATION_VARIANTS.card.initial}
    animate={ANIMATION_VARIANTS.card.animate}
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
        <div className="flex justify-center gap-2 mb-4">
          {(['monthly', 'daily'] as const).map(view => (
            <button
              key={view}
              className={`px-3 py-1 rounded-xl text-sm font-medium transition-colors ${
                revenueView === view
                  ? 'bg-primary text-white'
                  : 'bg-card text-foreground hover:bg-muted'
              }`}
              onClick={() => onRevenueViewChange(view)}
            >
              {view === 'monthly' ? 'Monthly' : 'Daily'}
            </button>
          ))}
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={revenueView === 'monthly' ? revenueData : dailyRevenue ?? []}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey={revenueView === 'monthly' ? 'month' : 'date'}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => {
                  if (revenueView === 'monthly') return value;
                  const date = new Date(value);
                  return date.toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'short',
                  });
                }}
              />
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
);

// Top Selling Items Component
const TopSellingItems = ({
  chartTopItems,
  chartMetric,
  onChartMetricChange,
  isLoading,
}: {
  chartTopItems: any[];
  chartMetric: 'quantity' | 'revenue';
  onChartMetricChange: (metric: 'quantity' | 'revenue') => void;
  isLoading: boolean;
}) => (
  <motion.div
    initial={ANIMATION_VARIANTS.card.initial}
    animate={ANIMATION_VARIANTS.card.animate}
    transition={{ duration: 0.4, delay: 0.5 }}
  >
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Top Selling Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center gap-2 mb-4">
          {(['quantity', 'revenue'] as const).map(metric => (
            <button
              key={metric}
              className={`px-3 py-1 rounded-xl text-sm font-medium transition-colors ${
                chartMetric === metric
                  ? 'bg-primary text-white'
                  : 'bg-card text-foreground hover:bg-muted'
              }`}
              onClick={() => onChartMetricChange(metric)}
            >
              {metric === 'quantity' ? 'Items Sold' : 'Revenue'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : chartTopItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 text-center text-muted-foreground">
            <p>No sales data for this period</p>
            <p className="text-sm">Try changing the date range or period above</p>
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartTopItems}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar
                  dataKey="total"
                  fill="hsl(var(--primary))"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive
                  animationDuration={900}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

// Recent Activity Component
const RecentActivity = ({
  recentActivity,
}: {
  recentActivity: any[];
}) => (
  <motion.div
    initial={ANIMATION_VARIANTS.card.initial}
    animate={ANIMATION_VARIANTS.card.animate}
    transition={{ duration: 0.4, delay: 0.6 }}
  >
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No recent activity
            </p>
          ) : (
            recentActivity.map((activity) => (
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
            ))
          )}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Main Component
export const AnalyticsPage = () => {
  const { user, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Please login again.</div>;
  }

  const businessId = user?.businessId;

  const [period, setPeriod] = useState<'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'this_quarter' | 'last_quarter' | 'custom'>('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [fetchKey, setFetchKey] = useState(0);
  const [chartMetric, setChartMetric] = useState<'quantity' | 'revenue'>('quantity');
  const [revenueView, setRevenueView] = useState<'monthly' | 'daily'>('monthly');

  const { sales, loading } = useSales(
    businessId,
    period,
    customStart,
    customEnd,
    fetchKey
  );

  const {
    revenueSummary,
    dailyRevenue,
    topSellingItems,
    paymentMethods,
    loading: revenueLoading,
  } = useRevenueAnalytics(
    businessId,
    period,
    customStart,
    customEnd,
    fetchKey
  );

  const {
    paymentMethods: currentMonthPayments,
    revenueSummary: currentMonthSummary,
  } = useRevenueAnalytics(
    businessId,
    'this_month',
    '',
    '',
    fetchKey
  );

  const totalSales = sales?.length ?? 0;

  const chartTopItems = useMemo(() => {
    if (!topSellingItems) return [];
    return topSellingItems.map(item => ({
      name: item.item?.toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase()),
      total: chartMetric === 'quantity' ? item.quantity : item.revenue
    }));
  }, [topSellingItems, chartMetric]);

  const paymentChartData = paymentMethods.map(method => ({
    name: method.method,
    percentage: Number(method.percentageOfTransactions) || 0,
    revenue: Number(method.metrics?.revenue) || 0,
  }));

  const currentMonthReceipts = currentMonthSummary?.salesCount ?? 0;
  const receiptsGrowth = 12;

  // Mock data
  const revenueData = [
    { month: 'Jan', revenue: 85000 },
    { month: 'Feb', revenue: 92000 },
    { month: 'Mar', revenue: 108000 },
    { month: 'Apr', revenue: 95000 },
    { month: 'May', revenue: 125000 },
    { month: 'Jun', revenue: 145000 },
    { month: 'Jul', revenue: 168000 },
  ];

  const recentActivity = [
    { id: 1, action: 'New sale recorded', amount: 'KES 12,500', time: '2 min ago' },
    { id: 2, action: 'Receipt generated', amount: '#RC-2024-0842', time: '5 min ago' },
    { id: 3, action: 'File uploaded', amount: 'Invoice_March.pdf', time: '12 min ago' },
    { id: 4, action: 'New sale recorded', amount: 'KES 8,750', time: '25 min ago' },
    { id: 5, action: 'M-Pesa statement uploaded', amount: 'Statement_Q1.pdf', time: '1 hour ago' },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your business performance ({getPeriodLabel(period)})
          </p>
        </div>

        <PeriodFilter
          period={period}
          customStart={customStart}
          customEnd={customEnd}
          onPeriodChange={setPeriod}
          onCustomStartChange={setCustomStart}
          onCustomEndChange={setCustomEnd}
          onApplyCustom={() => {
            if (customStart && customEnd) {
              setFetchKey((prev) => prev + 1);
            }
          }}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          title="Total Revenue"
          value={revenueLoading ? '...' : formatCurrency(revenueSummary?.totalRevenue)}
          trend={revenueSummary?.trend as any}
          percentageChange={formatPercentage(revenueSummary?.percentageChange)}
          isLoading={revenueLoading}
        />

        <StatCard
          icon={ShoppingCart}
          title="Total Sales"
          value={loading ? '...' : totalSales.toString()}
          trend={revenueSummary?.trend as any}
          percentageChange={formatPercentage(revenueSummary?.percentageChange)}
          isLoading={loading}
        />

        <StatCard
          icon={Receipt}
          title="Receipts Generated (This Month)"
          value={currentMonthReceipts.toString()}
          percentageChange={`↑ ${receiptsGrowth}%`}
        />

        <PaymentBreakdown
          paymentChartData={paymentChartData}
          totalSales={totalSales}
          isLoading={revenueLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueTrend
          revenueData={revenueData}
          dailyRevenue={dailyRevenue ?? []}
          revenueView={revenueView}
          onRevenueViewChange={setRevenueView}
          isLoading={revenueLoading}
        />

        <TopSellingItems
          chartTopItems={chartTopItems}
          chartMetric={chartMetric}
          onChartMetricChange={setChartMetric}
          isLoading={loading}
        />
      </div>

      {/* Recent Activity */}
      <RecentActivity recentActivity={recentActivity} />
    </div>
  );
};
