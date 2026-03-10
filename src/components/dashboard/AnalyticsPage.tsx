import React from 'react';
import { LabelList } from "recharts";
import { useAuth } from '@/contexts/AuthContext';
import { useSales } from '@/hooks/useSales';
import { useRevenueAnalytics } from "@/hooks/useRevenueAnalytics";
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  FileUp,
  Receipt,
  DollarSign,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Activity,
  Info,
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
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
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
  hasMultipleMonths
}: {
  revenueData: any[];
  dailyRevenue: any[];
  revenueView: 'monthly' | 'daily';
  onRevenueViewChange: (view: 'monthly' | 'daily') => void;
  isLoading: boolean;
  hasMultipleMonths: boolean;

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

          {revenueView === "monthly" && !hasMultipleMonths ? (
        
            <div className="flex flex-col items-center justify-center h-full space-y-6">
        
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Revenue This Month
                </p>
        
                <p className="text-3xl font-bold">
                  KES {revenueData?.[0]?.revenue?.toLocaleString() ?? 0}
                </p>
              </div>
        
              <div className="w-full h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyRevenue}>
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={false}
                    />
                    <Tooltip />
                  </LineChart>
                </ResponsiveContainer>
              </div>
        
              <p className="text-xs text-muted-foreground">
                Daily revenue trend
              </p>
        
            </div>
        
          ) : (
        
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueView === "monthly" ? revenueData : dailyRevenue}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
        
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        
                <XAxis
                  dataKey={revenueView === "monthly" ? "month" : "date"}
                  fontSize={12}
                  tickFormatter={(value) =>
                    revenueView === "daily"
                      ? new Date(value).toLocaleDateString("en-KE", { day: "numeric", month: "short" })
                      : value
                  }
                />
        
                <YAxis fontSize={12} />
        
                <Tooltip />
        
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
        
              </AreaChart>
            </ResponsiveContainer>
        
          )}
        
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
  chartType,
  onChartTypeChange,
  isLoading,
}: {
  chartTopItems: any[];
  chartMetric: 'quantity' | 'revenue';
  onChartMetricChange: (metric: 'quantity' | 'revenue') => void;
  chartType: 'bar' | 'pie';
  onChartTypeChange: (type: 'bar' | 'pie') => void;
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

        <div className="flex justify-center gap-2 mb-4">

          {(['bar','pie'] as const).map(type => (
            <button
              key={type}
              className={`px-3 py-1 rounded-xl text-sm ${
                chartType === type
                  ? 'bg-primary text-white'
                  : 'bg-card hover:bg-muted'
              }`}
              onClick={() => onChartTypeChange(type)}
            >
              {type === 'bar' ? 'Bar Chart' : 'Pie Chart'}
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

            {chartType === "bar" ? (
          
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
          
            ) : (
          
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
          
                  <Pie
                    data={chartTopItems}
                    dataKey="total"
                    nameKey="name"
                    outerRadius={100}
                    label={({name, percent}) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {chartTopItems.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={`hsl(var(--primary) / ${1 - index * 0.15})`}
                      />
                    ))}
                  </Pie>
          
                  <Tooltip />
                  <Legend />
          
                </PieChart>
              </ResponsiveContainer>
          
            )}
          
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

// Today Snapshot and Monthly projection Component
// Helper for consistent row styling
const TodaySnapshotCard = ({
  todayRevenue,
  todayTransactions,
  avgSale,
  salesPace,
  isLoading = false,
}: {
  todayRevenue: number;
  todayTransactions: number;
  avgSale: number;
  salesPace: number | null;
  isLoading?: boolean;
}) => {
  const trend = salesPace !== null ? (salesPace >= 0 ? 'up' : 'down') : 'neutral';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      initial={ANIMATION_VARIANTS.card.initial}
      animate={ANIMATION_VARIANTS.card.animate}
    >
      <Card className="h-full shadow-sm hover:shadow-md transition-all border-l-4 border-l-primary">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Today Snapshot
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <div className="text-3xl font-bold tracking-tight">
              {isLoading ? '...' : formatCurrency(todayRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total revenue today</p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                <ShoppingCart className="h-3 w-3" /> Transactions
              </span>
              <p className="text-lg font-semibold">{isLoading ? '...' : todayTransactions}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" /> Avg. Sale
              </span>
              <p className="text-lg font-semibold">{isLoading ? '...' : formatCurrency(avgSale)}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            {salesPace !== null && todayTransactions > 0 ? (
              <>
                <div className={`flex items-center gap-1.5 text-sm font-bold ${
                  trend === 'up' ? 'text-success' : 'text-destructive'
                }`}>
                  {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{formatPercentage(salesPace)} Sales Pace</span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger><Info className="h-3.5 w-3.5 text-muted-foreground hover:text-primary transition-colors" /></TooltipTrigger>
                    <TooltipContent className="max-w-[200px] text-xs">
                      Today vs. your daily average this month.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : (
              <p className="text-xs text-muted-foreground italic">No sales recorded today yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

import { CalendarDays, BarChart3, Info } from "lucide-react";

const MonthlyProjectionCard = ({
  monthRevenue,
  projectedRevenue,
  daysElapsed,
  daysInMonth,
  isLoading = false,
}: {
  monthRevenue: number;
  projectedRevenue: number;
  daysElapsed: number;
  daysInMonth: number;
  isLoading?: boolean;
}) => {
  const progressPercent = (daysElapsed / daysInMonth) * 100;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      initial={ANIMATION_VARIANTS.card.initial}
      animate={ANIMATION_VARIANTS.card.animate}
    >
      <Card className="h-full shadow-sm hover:shadow-md transition-all border-l-4 border-l-muted-foreground">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Monthly Projection
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>

        <CardContent className="space-y-6">
          {monthRevenue === 0 && !isLoading ? (
            <div className="h-[120px] flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-muted/20">
              <p className="text-sm font-medium text-muted-foreground">No sales this month yet</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase">Projection appears after first sale</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Revenue So Far</p>
                  <p className="text-xl font-bold">{isLoading ? '...' : formatCurrency(monthRevenue)}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 mb-1">
                    <p className="text-xs font-bold text-primary uppercase tracking-tighter">Projected</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger><Info className="h-3 w-3 text-muted-foreground" /></TooltipTrigger>
                        <TooltipContent className="text-xs">
                          (Current Revenue / Days Elapsed) × Total Days in Month
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-2xl font-black text-primary">
                    {isLoading ? '...' : formatCurrency(projectedRevenue)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                  <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Month Progress</span>
                  <span>{daysElapsed} / {daysInMonth} Days</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};


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
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  useEffect(() => {
    if (businessId) {
      setFetchKey(prev => prev + 1);
    }
  }, [businessId, period]);

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
    monthlyRevenue,
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

  // const {
  //   paymentMethods: currentMonthPayments,
  //   revenueSummary: currentMonthSummary,
  // } = useRevenueAnalytics(
  //   businessId,
  //   'this_month',
  //   '',
  //   '',
  //   fetchKey
  // );

  const totalSales = sales?.length ?? 0;

  const chartTopItems = useMemo(() => {
    if (!topSellingItems) return [];
    return [...topSellingItems]
      .sort((a,b) => b.revenue - a.revenue)
      .map(item => ({
      name: item.item?.toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase()),
      total: chartMetric === 'quantity' ? item.quantity : item.revenue
    }));
  }, [topSellingItems, chartMetric]);

  const paymentChartData = paymentMethods.map(method => ({
    name: method.method,
    percentage: Number(method.percentageOfRevenue) || 0,
    revenue: Number(method.metrics?.revenue) || 0,
  }));

  const currentMonthReceipts = revenueSummary?.salesCount ?? 0;
  const receiptsGrowth = 12;

  // Mock data
  const revenueData = monthlyRevenue ?? [];

  const hasMultipleMonths =
    revenueData.filter(m => m.revenue > 0).length > 1;

  // Get today's date
const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// Filter sales for today
const todaySales = useMemo(() => sales?.filter(s => s.created_at.startsWith(today)) ?? [], [sales, today]);

// Today Snapshot
const todayRevenue = todaySales.reduce((sum, s) => sum + (s.amount ?? 0), 0);
const todayTransactions = todaySales.length;
const avgSale = todayTransactions ? todayRevenue / todayTransactions : 0;

// Monthly Projection
const monthRevenue = revenueSummary?.totalRevenue ?? 0;
const now = new Date();
const daysElapsed = now.getDate();
const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
const averageDailyRevenue = daysElapsed ? monthRevenue / daysElapsed : 0;
const projectedRevenue = averageDailyRevenue * daysInMonth;

// Sales pace = compare today's revenue vs avg day
const salesPace = averageDailyRevenue ? (todayRevenue - averageDailyRevenue) / averageDailyRevenue : null;

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
          hasMultipleMonths={hasMultipleMonths}
        />

        <TopSellingItems
          chartTopItems={chartTopItems}
          chartMetric={chartMetric}
          onChartMetricChange={setChartMetric}
          chartType={chartType}
          onChartTypeChange={setChartType}
          isLoading={loading}
        />
      </div>

      {/* Recent Activity */}
      {/* Today Snapshot & Monthly Projection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TodaySnapshotCard
          todayRevenue={todayRevenue}
          todayTransactions={todayTransactions}
          avgSale={avgSale}
          salesPace={salesPace}
          isLoading={loading}
        />
      
        <MonthlyProjectionCard
          monthRevenue={monthRevenue}
          projectedRevenue={projectedRevenue}
          daysElapsed={daysElapsed}
          daysInMonth={daysInMonth}
          isLoading={loading}
        />
      </div>
    </div>
  );
};
