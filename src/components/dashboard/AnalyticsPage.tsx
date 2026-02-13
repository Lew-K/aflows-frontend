"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

interface AnalyticsProps {
  revenueSummary?: {
    totalRevenue?: number;
    percentageChange?: string;
    trend?: "up" | "down" | "neutral";
  };
  revenueTrend?: { date: string; revenue: number }[];
  paymentMethods?: { method: string; total: number }[];
  topSellingItems?: { name: string; total: number }[];
}

export default function AnalyticsPage({
  revenueSummary,
  revenueTrend,
  paymentMethods,
  topSellingItems,
}: AnalyticsProps) {
  // -------------------------------
  // Safe Revenue Trend Data
  // -------------------------------
  const trendData = useMemo(() => {
    if (!Array.isArray(revenueTrend)) return [];
    return revenueTrend.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-KE", {
        month: "short",
      }),
      revenue: Number(item.revenue) || 0,
    }));
  }, [revenueTrend]);

  // -------------------------------
  // Safe Payment Data
  // -------------------------------
  const paymentData = useMemo(() => {
    if (!Array.isArray(paymentMethods)) return [];

    const total = paymentMethods.reduce(
      (sum, m) => sum + (Number(m.total) || 0),
      0
    );

    if (total === 0) return [];

    return paymentMethods.map((m) => ({
      name: m.method,
      value: Number(((m.total / total) * 100).toFixed(1)),
    }));
  }, [paymentMethods]);

  // -------------------------------
  // Safe Top Items
  // -------------------------------
  const topItems = useMemo(() => {
    if (!Array.isArray(topSellingItems)) return [];
    return topSellingItems.slice(0, 4);
  }, [topSellingItems]);

  const totalRevenue = revenueSummary?.totalRevenue ?? 0;
  const percentageChange = revenueSummary?.percentageChange ?? "0%";
  const trendDirection = revenueSummary?.trend ?? "neutral";

  return (
    <div className="space-y-8 p-6">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Business performance overview
        </p>
      </div>

      {/* ================= INSIGHT BANNER ================= */}
      <Card className="rounded-2xl border border-primary/20 bg-primary/5">
        <CardContent className="p-6 space-y-2">
          <p className="font-medium">📊 Business Insights</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              Revenue changed {percentageChange} compared to previous period.
            </li>
            {topItems[0] && (
              <li>{topItems[0].name} is your top selling item.</li>
            )}
            {paymentData[0] && (
              <li>{paymentData[0].name} is your most used payment method.</li>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* ================= KPI CARDS ================= */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              KES {totalRevenue.toLocaleString()}
            </p>
            <p
              className={`text-sm mt-1 ${
                trendDirection === "up"
                  ? "text-green-600"
                  : trendDirection === "down"
                  ? "text-red-600"
                  : "text-muted-foreground"
              }`}
            >
              {percentageChange}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Top Item</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {topItems[0]?.name ?? "No data"}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Most Used Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {paymentData[0]?.name ?? "No data"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ================= REVENUE TREND ================= */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Revenue Trend (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">
              No revenue trend data available
            </p>
          )}
        </CardContent>
      </Card>

      {/* ================= PAYMENT + TOP ITEMS ================= */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Payment Donut */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Payment Methods (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {paymentData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`hsl(var(--primary) / ${
                          0.4 + index * 0.15
                        })`}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">
                No payment data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Selling Items */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent>
            {topItems.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topItems}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="total"
                    fill="hsl(var(--primary))"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">
                No item data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
