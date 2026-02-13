"use client";

import React, { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSales } from "@/hooks/useSales";
import { useRevenueAnalytics } from "@/hooks/useRevenueAnalytics";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  BarChart3,
  TrendingUp,
  Receipt,
  DollarSign,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
} from "lucide-react";

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
} from "recharts";

export const AnalyticsPage = () => {
  const { user } = useAuth();

  const [period, setPeriod] = useState<
    | "today"
    | "yesterday"
    | "this_week"
    | "last_week"
    | "this_month"
    | "last_month"
    | "this_quarter"
    | "last_quarter"
    | "custom"
  >("this_month");

  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [fetchKey, setFetchKey] = useState(0);

  const businessId = user?.businessId ?? "";

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

  const totalSales = sales?.length ?? 0;

  const percentageChange =
    revenueSummary?.percentageChange != null
      ? `${revenueSummary.percentageChange}%`
      : "0%";

  const trend = revenueSummary?.trend ?? "neutral";

  /* ================= REVENUE TREND DATA ================= */
  const revenueTrendData = useMemo(() => {
    if (!Array.isArray(dailyRevenue)) return [];

    return dailyRevenue.map((item: any) => ({
      date: new Date(item.date).toLocaleDateString("en-KE", {
        month: "short",
        day: "numeric",
      }),
      revenue: Number(item.revenue) || 0,
    }));
  }, [dailyRevenue]);

  /* ================= PAYMENT METHOD % ================= */
  const paymentData = useMemo(() => {
    if (!Array.isArray(paymentMethods)) return [];

    const total = paymentMethods.reduce(
      (sum: number, m: any) => sum + (Number(m.total) || 0),
      0
    );

    if (total === 0) return [];

    return paymentMethods.map((m: any) => ({
      name: m.method,
      value: Number(((m.total / total) * 100).toFixed(1)),
    }));
  }, [paymentMethods]);

  /* ================= TOP 4 ITEMS ================= */
  const topItems = useMemo(() => {
    if (!Array.isArray(topSellingItems)) return [];
    return [...topSellingItems]
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 4);
  }, [topSellingItems]);

  return (
    <div className="space-y-6">
      {/* HEADER + FILTERS */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of your business performance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="h-10 rounded-xl border border-border bg-card px-3 text-sm"
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

          {period === "custom" && (
            <>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-10 rounded-xl border border-border bg-card px-3 text-sm"
              />
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="h-10 rounded-xl border border-border bg-card px-3 text-sm"
              />
              <button
                onClick={() => setFetchKey((prev) => prev + 1)}
                disabled={!customStart || !customEnd}
                className="h-10 rounded-xl bg-primary px-4 text-white text-sm"
              >
                Apply
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <Card>
          <CardContent className="p-6">
            <DollarSign className="w-6 h-6 text-primary mb-2" />
            <p className="text-2xl font-bold">
              {revenueLoading
                ? "..."
                : revenueSummary?.totalRevenue != null
                ? `KES ${revenueSummary.totalRevenue.toLocaleString()}`
                : "—"}
            </p>
            <p
              className={`text-sm ${
                trend === "up"
                  ? "text-green-600"
                  : trend === "down"
                  ? "text-red-600"
                  : "text-muted-foreground"
              }`}
            >
              {percentageChange}
            </p>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>

        {/* Sales */}
        <Card>
          <CardContent className="p-6">
            <ShoppingCart className="w-6 h-6 text-primary mb-2" />
            <p className="text-2xl font-bold">
              {loading ? "..." : totalSales || "—"}
            </p>
            <p className="text-sm text-muted-foreground">Total Sales</p>
          </CardContent>
        </Card>

        {/* Payment Method % */}
        <Card>
          <CardContent className="p-6">
            <CreditCard className="w-6 h-6 text-primary mb-2" />
            <p className="text-lg font-semibold">
              {paymentData[0]?.name ?? "—"}
            </p>
            <p className="text-sm text-muted-foreground">
              Most Used Payment
            </p>
          </CardContent>
        </Card>

        {/* Top Item */}
        <Card>
          <CardContent className="p-6">
            <Receipt className="w-6 h-6 text-primary mb-2" />
            <p className="text-lg font-semibold">
              {topItems[0]?.name ?? "—"}
            </p>
            <p className="text-sm text-muted-foreground">Top Selling Item</p>
          </CardContent>
        </Card>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary) / 0.2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top 4 Items */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topItems}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Payment Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={paymentData}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={100}
              >
                {paymentData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={`hsl(var(--primary) / ${0.4 + index * 0.15})`}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
