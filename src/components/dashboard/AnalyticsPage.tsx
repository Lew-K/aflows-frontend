import React from 'react';
import { LabelList } from "recharts";
import { useAuth } from '@/contexts/AuthContext';
import { useData } from "@/contexts/DataContext";
import { useAccess } from '@/hooks/useAccess';
import { StaffAnalyticsView } from './StaffAnalyticsView';
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
  Zap,
  Users,
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
}

// Stat Card Component
const StatCard = ({
  icon: Icon,
  title,
  scopeLabel,
  value,
  trend,
  percentageChange,
  isLoading = false,
  subtitle,
}: {
  icon: any;
  title: string;
  scopeLabel?: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  percentageChange?: string;
  isLoading?: boolean;
  subtitle?: string;
}) => (
  <motion.div
    initial={ANIMATION_VARIANTS.card.initial}
    animate={ANIMATION_VARIANTS.card.animate}
    transition={{ duration: 0.4 }}
  >
    <Card className="hover:shadow-soft transition-shadow h-full">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="text-right min-w-0">
            <p className="text-[11px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider truncate">
              {title}
            </p>
            {scopeLabel && (
              <p className="text-[10px] text-muted-foreground/70 truncate">{scopeLabel}</p>
            )}
          </div>
        </div>
        
        <p className="text-2xl sm:text-3xl font-black text-foreground">
          {isLoading ? '...' : value}
        </p>
        
        {percentageChange && (
          <div
            className={`flex items-center gap-1 text-xs sm:text-sm font-medium mt-2 ${
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
        
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
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
  <div className="flex flex-wrap items-center gap-3" data-tour="analytics-period-selector">
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
    <Card className="hover:shadow-soft transition-shadow h-full" data-tour="payment-breakdown">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="text-right min-w-0">
            <p className="text-[11px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider truncate">
              Payment Breakdown
            </p>
            <p className="text-[10px] text-muted-foreground/70 truncate">This Month</p>
          </div>
        </div>

        <div
          className="mt-4"
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

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Top Payment Method
            </p>
          </div>
          <div className="flex items-center gap-1">
            <p className="text-sm font-black text-foreground">
              {paymentChartData.length > 0 ? paymentChartData[0].name : '—'}
            </p>
            {paymentChartData.length > 0 && (
              <span className="text-xs font-medium text-success">{paymentChartData[0].percentage}%</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Top Customer Card Component (NEW)
const TopCustomerCard = ({
  topCustomer,
  receiptsCount,
  newCustomersCount,
  returningCustomersCount,
  isLoading = false,
}: {
  topCustomer: { name: string; totalSpend: number } | null;
  receiptsCount: number;
  newCustomersCount: number;
  returningCustomersCount: number;
  isLoading?: boolean;
}) => (
  <motion.div
    initial={ANIMATION_VARIANTS.card.initial}
    animate={ANIMATION_VARIANTS.card.animate}
    transition={{ duration: 0.4, delay: 0.1 }}
  >
    <Card className="hover:shadow-soft transition-shadow h-full" data-tour="payment-breakdown">
      
      
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="text-right min-w-0">
            <p className="text-[11px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider truncate">
              Top Customers
            </p>
            <p className="text-[10px] text-muted-foreground/70 truncate">This Month</p>
          </div>
        </div>
      
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center">
            <p className="text-3xl font-black text-green-600">
              {isLoading ? '...' : newCustomersCount}
            </p>
            <p className="text-[10px] font-bold text-green-600/70 uppercase tracking-wider mt-1">
              New
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-blue-600">
              {isLoading ? '...' : returningCustomersCount}
            </p>
            <p className="text-[10px] font-bold text-blue-600/70 uppercase tracking-wider mt-1">
              Returning
            </p>
          </div>
        </div>
      
        {/* Secondary — Top customer */}
        <div className="border-t border-border/50 pt-3 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Top Customer
            </p>
            <p className="text-sm font-black text-foreground truncate mt-0.5">
              {isLoading ? '...' : topCustomer?.name || 'N/A'}
            </p>
          </div>
          <p className="text-sm font-bold text-foreground shrink-0 ml-2">
            {isLoading ? '...' : formatCurrency(topCustomer?.totalSpend)}
          </p>
        </div>
      </CardContent>

      
    </Card>
  </motion.div>
);

// const AnalyticsSummaryStrip = ({
//   revenueSummary,
//   revenueLoading,
//   totalSales,
//   loading,
//   paymentChartData,
//   topCustomer,
//   newCustomersCount,
//   returningCustomersCount,
//   canViewAdvanced,
// }: {
//   revenueSummary: any;
//   revenueLoading: boolean;
//   totalSales: number;
//   loading: boolean;
//   paymentChartData: any[];
//   topCustomer: { name: string; totalSpend: number } | null;
//   newCustomersCount: number;
//   returningCustomersCount: number;
//   canViewAdvanced: boolean;
// }) => {
//   const topPaymentMethod = paymentChartData?.[0];

//   return (
//     <motion.div
//       initial={ANIMATION_VARIANTS.card.initial}
//       animate={ANIMATION_VARIANTS.card.animate}
//       transition={{ duration: 0.4 }}
//     >
//       <Card className="overflow-hidden">
//         <CardContent className="p-0">

//           {/* Scope Labels */}
//           <div
//             className={`grid ${
//               canViewAdvanced
//                 ? "lg:grid-cols-[2fr_2fr]"
//                 : "lg:grid-cols-[2fr_1fr]"
//             } border-b bg-muted/20`}
//           >
//             <div className="px-4 py-2 border-r">
//               <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
//                 Filtered
//               </p>
//             </div>

//             <div className="px-4 py-2">
//               <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
//                 This Month
//               </p>
//             </div>
//           </div>

//           {/* Metrics */}
//           <div
//             className={`grid ${
//               canViewAdvanced
//                 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
//                 : "grid-cols-1 md:grid-cols-3"
//             }`}
//           >
//             {/* Revenue */}
//             <div className="p-4 lg:p-5 border-b md:border-r md:border-b-0">
//               <div className="flex items-center gap-2 mb-2">
//                 <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
//                   <DollarSign className="w-4 h-4 text-primary" />
//                 </div>

//                 <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
//                   Revenue
//                 </span>
//               </div>

//               <p className="text-2xl font-black">
//                 {revenueLoading
//                   ? "..."
//                   : formatCurrency(revenueSummary?.totalRevenue)}
//               </p>

//               {revenueSummary?.percentageChange !== undefined && (
//                 <div
//                   className={`flex items-center gap-1 text-xs font-medium mt-1 ${
//                     revenueSummary?.trend === "up"
//                       ? "text-success"
//                       : revenueSummary?.trend === "down"
//                       ? "text-destructive"
//                       : "text-muted-foreground"
//                   }`}
//                 >
//                   {formatPercentage(revenueSummary?.percentageChange)}

//                   {revenueSummary?.trend === "up" && (
//                     <ArrowUpRight className="w-3 h-3" />
//                   )}

//                   {revenueSummary?.trend === "down" && (
//                     <ArrowDownRight className="w-3 h-3" />
//                   )}
//                 </div>
//               )}

//               {revenueSummary?.previousRevenue && (
//                 <p className="text-xs text-muted-foreground mt-1 truncate">
//                   vs {formatCurrency(revenueSummary.previousRevenue)}
//                 </p>
//               )}
//             </div>

//             {/* Sales */}
//             <div
//               className={`p-4 lg:p-5 border-b ${
//                 canViewAdvanced ? "lg:border-r" : ""
//               } md:border-b-0`}
//             >
//               <div className="flex items-center gap-2 mb-2">
//                 <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
//                   <ShoppingCart className="w-4 h-4 text-primary" />
//                 </div>

//                 <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
//                   Sales
//                 </span>
//               </div>

//               <p className="text-2xl font-black">
//                 {loading ? "..." : totalSales}
//               </p>

//               {revenueSummary?.totalRevenue && totalSales > 0 && (
//                 <p className="text-xs text-muted-foreground mt-1">
//                   Avg{" "}
//                   {formatCurrency(
//                     Math.round(revenueSummary.totalRevenue / totalSales)
//                   )}
//                 </p>
//               )}

//               {revenueSummary?.percentageChange !== undefined && (
//                 <p className="text-xs mt-1 text-muted-foreground">
//                   {formatPercentage(revenueSummary?.percentageChange)}
//                 </p>
//               )}
//             </div>

//             {/* Payments */}
//             <div
//               className={`p-4 lg:p-5 ${
//                 canViewAdvanced ? "md:border-r" : ""
//               } border-b md:border-b-0`}
//             >
//               <div className="flex items-center gap-2 mb-3">
//                 <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
//                   <DollarSign className="w-4 h-4 text-primary" />
//                 </div>

//                 <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
//                   Payments
//                 </span>
//               </div>

//               {revenueLoading ? (
//                 <p className="text-sm text-muted-foreground">Loading...</p>
//               ) : paymentChartData.length === 0 ? (
//                 <p className="text-sm text-muted-foreground">
//                   No payment data
//                 </p>
//               ) : (
//                 <div className="space-y-1.5">
//                   {paymentChartData.slice(0, 3).map((method) => (
//                     <div
//                       key={method.name}
//                       className="flex items-center justify-between text-sm"
//                     >
//                       <span className="truncate">{method.name}</span>
//                       <span className="font-semibold">
//                         {method.percentage}%
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {topPaymentMethod && (
//                 <p className="text-xs text-muted-foreground mt-3">
//                   Top:{" "}
//                   <span className="font-medium text-foreground">
//                     {topPaymentMethod.name}
//                   </span>
//                 </p>
//               )}
//             </div>

//             {/* Customers */}
//             {canViewAdvanced && (
//               <div className="p-4 lg:p-5">
//                 <div className="flex items-center gap-2 mb-3">
//                   <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
//                     <Users className="w-4 h-4 text-primary" />
//                   </div>

//                   <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
//                     Customers
//                   </span>
//                 </div>

//                 {/* New vs Returning */}
//                 <div className="rounded-lg border bg-muted/20 p-2 mb-3">
//                   <div className="grid grid-cols-2 divide-x">
//                     <div className="text-center">
//                       <p className="text-lg font-black text-green-600">
//                         {newCustomersCount}
//                       </p>

//                       <p className="text-[10px] uppercase font-bold text-muted-foreground">
//                         New
//                       </p>
//                     </div>

//                     <div className="text-center">
//                       <p className="text-lg font-black text-blue-600">
//                         {returningCustomersCount}
//                       </p>

//                       <p className="text-[10px] uppercase font-bold text-muted-foreground">
//                         Returning
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Top Customer */}
//                 <div className="flex items-center justify-between gap-3">
//                   <span
//                     className="font-semibold text-sm truncate"
//                     title={topCustomer?.name}
//                   >
//                     {topCustomer?.name || "N/A"}
//                   </span>

//                   <span className="font-black text-sm shrink-0">
//                     {formatCurrency(topCustomer?.totalSpend)}
//                   </span>
//                 </div>

//                 <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1">
//                   Top Customer
//                 </p>
//               </div>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </motion.div>
//   );
// };

// Smart Recommendation Card Component (NEW)
const SmartRecommendationCard = ({
  topItems,
  salesPace,
  totalRevenue,
  isLoading = false,
}: {
  topItems: any[];
  salesPace: number | null;
  totalRevenue: number;
  isLoading?: boolean;
}) => {
  const getRecommendation = () => {
    if (isLoading) {
      return { title: 'Analyzing...', message: 'Gathering insights', icon: 'zap', color: 'bg-yellow-500/5 border-l-yellow-500/50' };
    }

    // Check top selling item
    if (topItems.length > 0 && topItems[0].quantity > 50) {
      return {
        title: 'Stock Up',
        message: `Your "${topItems[0].item}" is flying off the shelves with ${topItems[0].quantity} units sold.`,
        icon: 'zap',
        color: 'bg-success/5 border-l-success/50',
      };
    }

    // Check sales pace
    if (salesPace !== null && salesPace > 0.2) {
      return {
        title: 'Great Pace',
        message: `You're ${Math.round(salesPace * 100)}% above your daily average—keep it up!`,
        icon: 'zap',
        color: 'bg-success/5 border-l-success/50',
      };
    }

    if (salesPace !== null && salesPace < -0.3) {
      return {
        title: 'Sales Dip',
        message: `Sales are ${Math.abs(Math.round(salesPace * 100))}% below average. Consider a promotion.`,
        icon: 'zap',
        color: 'bg-yellow-500/5 border-l-yellow-500/50',
      };
    }

    return {
      title: 'Business as Usual',
      message: 'Your sales are tracking normally. Keep monitoring for opportunities.',
      icon: 'zap',
      color: 'bg-blue-500/5 border-l-blue-500/50',
    };
  };

  const rec = getRecommendation();

  return (
    <motion.div
      initial={ANIMATION_VARIANTS.card.initial}
      animate={ANIMATION_VARIANTS.card.animate}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className={`hover:shadow-soft transition-shadow h-full border-l-4 ${rec.color}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
          </div>
          
          <p className="text-lg font-black text-foreground">
            {rec.title}
          </p>
          
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            {rec.message}
          </p>
          
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-4">Smart Insight</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

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
    <Card className="h-full" data-tour="revenue-trend">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Revenue Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="inline-flex bg-muted rounded-lg p-1 mx-auto mb-4 flex justify-center">
          {(['monthly', 'daily'] as const).map(view => (
            <button
              key={view}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                revenueView === view ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => onRevenueViewChange(view)}
            >
              {view === 'monthly' ? 'Monthly' : 'Daily'}
            </button>
          ))}
        </div>
        

        <div className="h-52 sm:h-72">

          {revenueView === "monthly" && !hasMultipleMonths ? (
        
            <div className="flex flex-col items-center justify-center h-full space-y-6">
        
              <div className="text-center">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Revenue This Month
                </p>
        
                <p className="text-4xl font-black mt-2">
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
    <Card className="h-full" data-tour="top-selling-items">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Top Selling Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
          <div className="inline-flex bg-muted rounded-lg p-1">
            {(['quantity', 'revenue'] as const).map(metric => (
              <button key={metric}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${chartMetric === metric ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => onChartMetricChange(metric)}
              >
                {metric === 'quantity' ? 'Items Sold' : 'Revenue'}
              </button>
            ))}
          </div>
          <div className="hidden sm:inline-flex bg-muted rounded-lg p-1">
            {(['bar', 'pie'] as const).map(type => (
              <button key={type}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${chartType === type ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => onChartTypeChange(type)}
              >
                {type === 'bar' ? 'Bar' : 'Pie'}
              </button>
            ))}
          </div>
        </div>


        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : chartTopItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 text-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
            <BarChart3 className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="font-medium">No sales data for this period</p>
            <p className="text-xs mt-1">Try changing the date range or period above</p>
          </div>
        ) : (
          <div className="h-52 sm:h-72">

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

// Today Snapshot Component
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
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Today Snapshot
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <div className="text-3xl font-black tracking-tight">
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

import { CalendarDays } from "lucide-react";

// Monthly Projection Component
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
      <Card className="h-full shadow-sm hover:shadow-md transition-all border-l-4 border-l-success">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
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
                  <p className="text-xl font-black">{isLoading ? '...' : formatCurrency(monthRevenue)}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 mb-1">
                    <p className="text-xs font-bold text-success uppercase tracking-tighter">Projected</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger><Info className="h-3 w-3 text-muted-foreground" /></TooltipTrigger>
                        <TooltipContent className="text-xs">
                          (Current Revenue / Days Elapsed) × Total Days in Month
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-2xl font-black text-success">
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
                    className="h-full bg-success"
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
  const { role, can, tier, isStaff } = useAccess();

  const [period, setPeriod] = useState<'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'this_quarter' | 'last_quarter' | 'custom'>('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [fetchKey, setFetchKey] = useState(0);
  const [chartMetric, setChartMetric] = useState<'quantity' | 'revenue'>('quantity');
  const [revenueView, setRevenueView] = useState<'monthly' | 'daily'>('monthly');
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  // const [topCustomer, setTopCustomer] = useState<{ name: string; totalSpend: number } | null>(null);
  // const [receiptsCount, setReceiptsCount] = useState(0);
  // const [fetchingReceipts, setFetchingReceipts] = useState(false);

  const { getSales, fetchSales, isFetching, getRevenueAnalytics, fetchRevenueAnalytics, refreshSales } = useData();

  // Fetch sales for the selected period
  useEffect(() => {
    if (businessId) {
      fetchSales(businessId, period, customStart, customEnd);
    }
  }, [businessId, period, customStart, customEnd, fetchKey]);

  useEffect(() => {
    if (businessId) {
      fetchSales(businessId, 'all');
    }
  }, [businessId]);
  
  const sales = getSales(businessId, period, customStart, customEnd);

  const thisMonthSales = getSales(businessId, 'this_month');

  const { topCustomer, receiptsCount, newCustomersCount, returningCustomersCount } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
  
    // Filter to only this month's sales client-side — guards against webhook returning all-time data
    const filteredSales = thisMonthSales.filter((sale: any) => {
      const saleDate = new Date(sale.created_at);
      return (
        saleDate.getMonth() === currentMonth &&
        saleDate.getFullYear() === currentYear
      );
    });
  
    const customerSpends: Record<string, { name: string; total: number }> = {};
  
    filteredSales.forEach((sale: any) => {
      const name = sale.customer_name || 'Walk-in Customer';
      if (!customerSpends[name]) customerSpends[name] = { name, total: 0 };
      customerSpends[name].total += Number(sale.total_amount ?? 0);
    });
  
    const sorted = Object.values(customerSpends).sort((a, b) => b.total - a.total);
  
    const allSales = getSales(businessId, 'all');

    const previousCustomers = new Set(
      allSales
        .filter((s: any) => {
          const saleDate = new Date(s.created_at);
          return (
            saleDate.getMonth() < currentMonth ||
            saleDate.getFullYear() < currentYear
          );
        })
        .map((s: any) => s.customer_name || 'Walk-in Customer')
    );
    
    const uniqueThisMonth = Object.keys(
      filteredSales.reduce((acc: any, sale: any) => {
        const name = sale.customer_name || 'Walk-in Customer';
        acc[name] = true;
        return acc;
      }, {})
    );
    
    const newCustomersCount = uniqueThisMonth.filter(
      (name) => !previousCustomers.has(name)
    ).length;
    
    const returningCustomersCount = uniqueThisMonth.filter(
      (name) => previousCustomers.has(name)
    ).length;
    
    return {
      topCustomer: sorted[0] ? { name: sorted[0].name, totalSpend: sorted[0].total } : null,
      receiptsCount: filteredSales.length,
      newCustomersCount,
      returningCustomersCount,
    };
  }, [thisMonthSales]);
  
  const loading = isFetching(`${businessId}-${period}-${customStart || ""}-${customEnd || ""}`);

  // Fetch analytics for the selected period
  useEffect(() => {
    if (businessId) {
      fetchRevenueAnalytics(businessId, period, customStart, customEnd);
    }
  }, [businessId, period, customStart, customEnd, fetchKey]);
  
  const analytics = getRevenueAnalytics(businessId, period, customStart, customEnd);
  
  const revenueSummary = analytics.revenueSummary;
  const dailyRevenue = analytics.dailyRevenue;
  const monthlyRevenue = analytics.monthlyRevenue;
  const topSellingItems = analytics.topSellingItems;
  const paymentMethods = analytics.paymentMethods;
  
  const revenueLoading = isFetching(
    `${businessId}-${period}-${customStart || ""}-${customEnd || ""}`
  );

  // Fetch full month analytics independently (for projection - DECOUPLED)
  useEffect(() => {
    if (businessId) {
      fetchRevenueAnalytics(businessId, 'this_month');
    }
  }, [businessId]);
  
  const monthAnalytics = getRevenueAnalytics(businessId, 'this_month');

  // Fetch receipts and top customer data from webhook
  // useEffect(() => {
  //   const fetchReceiptsAndTopCustomer = async () => {
  //     if (!businessId) return;
      
  //     setFetchingReceipts(true);
  //     try {
  //       const url = new URL('https://n8n.aflows.uk/webhook/get-sales');
  //       url.searchParams.append('business_id', businessId);
  //       url.searchParams.append('period', 'this_month');

  //       const response = await fetch(url.toString());
  //       const data = await response.json();
        
  //       const allSales = data?.sales?.sales || [];
  //       setReceiptsCount(allSales.length);

  //       // Calculate top customer
  //       const customerSpends: Record<string, { name: string; total: number }> = {};
  //       allSales.forEach((sale: any) => {
  //         const customerName = sale.customer_name || 'Walk-in Customer';
  //         if (!customerSpends[customerName]) {
  //           customerSpends[customerName] = { name: customerName, total: 0 };
  //         }
  //         customerSpends[customerName].total += Number(sale.total_amount ?? 0);
  //       });

  //       const topCust = Object.values(customerSpends).sort((a, b) => b.total - a.total)[0];
  //       if (topCust) {
  //         setTopCustomer({ name: topCust.name, totalSpend: topCust.total });
  //       }
  //     } catch (error) {
  //       console.error('Failed to fetch receipts and top customer:', error);
  //     } finally {
  //       setFetchingReceipts(false);
  //     }
  //   };

  //   fetchReceiptsAndTopCustomer();
  // }, [businessId]);

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
  })).sort((a, b) => b.percentage - a.percentage);

  const revenueData = monthlyRevenue ?? [];

  const hasMultipleMonths =
    revenueData.filter(m => m.revenue > 0).length > 1;

  // Get today's date
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' });

  // Filter sales for today
  const todaySales = useMemo(() => sales?.filter(s => s.created_at.startsWith(today)) ?? [], [sales, today]);

  // Today Snapshot
  const todayRevenue = todaySales.reduce((sum, s) => sum + (s.amount ?? 0), 0);
  const todayTransactions = todaySales.length;
  const avgSale = todayTransactions ? todayRevenue / todayTransactions : 0;

  // Monthly Projection (using full month data, independent of period filter - DECOUPLED)
  const monthRevenue = monthAnalytics.revenueSummary?.totalRevenue ?? 0;
  const now = new Date();
  const daysElapsed = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const averageDailyRevenue = daysElapsed ? monthRevenue / daysElapsed : 0;
  const projectedRevenue = averageDailyRevenue * daysInMonth;

  // Sales pace = compare today's revenue vs avg day
  const salesPace = averageDailyRevenue ? (todayRevenue - averageDailyRevenue) / averageDailyRevenue : null;

  if (isStaff) {
    return <StaffAnalyticsView businessId={businessId} tier={tier} />;
  }
  
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
          onApplyCustom={async () => {
          if (customStart && customEnd) {
            await refreshSales(businessId, 'custom', customStart, customEnd);
            fetchRevenueAnalytics(businessId, 'custom', customStart, customEnd);
            setFetchKey(prev => prev + 1);
          }
        }}
        />
      </div>


      

      
      <div className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 ${can('analytics_advanced') ? 'xl:grid-cols-4' : 'lg:grid-cols-3'} gap-3 sm:gap-4`} data-tour="analytics-kpis">
        <StatCard
          icon={DollarSign}
          title="Total Revenue"
          scopeLabel={getPeriodLabel(period)}
          value={revenueLoading ? '...' : formatCurrency(revenueSummary?.totalRevenue)}
          trend={revenueSummary?.trend as any}
          percentageChange={formatPercentage(revenueSummary?.percentageChange)}
          isLoading={revenueLoading}
          subtitle={revenueSummary?.previousRevenue ? `vs ${formatCurrency(revenueSummary.previousRevenue)} last period` : undefined}
        />
        <StatCard
          icon={ShoppingCart}
          title="Total Sales"
          scopeLabel={getPeriodLabel(period)}
          value={loading ? '...' : totalSales.toString()}
          trend={revenueSummary?.trend === 'flat' ? 'neutral' : revenueSummary?.trend}
          percentageChange={formatPercentage(revenueSummary?.percentageChange)}
          isLoading={loading}
          subtitle={totalSales > 0 && revenueSummary?.totalRevenue
            ? `avg ${formatCurrency(Math.round(revenueSummary.totalRevenue / totalSales))} per sale`
            : undefined}
        />
        <PaymentBreakdown
          paymentChartData={paymentChartData}
          totalSales={totalSales}
          isLoading={revenueLoading}
        />

        {can('analytics_advanced') && (
          <TopCustomerCard
            topCustomer={topCustomer}
            receiptsCount={receiptsCount}
            newCustomersCount={newCustomersCount}
            returningCustomersCount={returningCustomersCount}
            isLoading={isFetching(`${businessId}-this_month--`)}
          />
        )}
      </div>

      {/* New month empty state — shown when current period has no data */}
      {!revenueSummary?.totalRevenue && !revenueLoading && period === 'this_month' && (
        <div className="rounded-xl border border-border/50 bg-muted/20 p-6 text-center">
          <TrendingUp className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-semibold text-foreground">New month, fresh start</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            No sales recorded yet this month. Charts will fill in as you record sales.{' '}
            <button
              className="text-primary underline hover:no-underline"
              onClick={() => setPeriod('last_month')}
            >
              View last month instead
            </button>
          </p>
        </div>
      )}

      {/* Charts Grid */}
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

      {/* Smart Recommendation, Today Snapshot & Monthly Projection — Growth+ only */}
      {tier === 'pro' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-tour="analytics-insights-row">
          <SmartRecommendationCard
            topItems={topSellingItems}
            salesPace={salesPace}
            totalRevenue={revenueSummary?.totalRevenue ?? 0}
            isLoading={loading}
          />
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
      )}
    </div>
  );
};
