import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

/*
------------------------------------
Types
------------------------------------
*/

type Metrics = {
  revenue: number;
  transactions: number;
  avgSale: number;
  bestDay: string;
};

type Trend = {
  day: string;
  revenue: number;
};

type Customer = {
  name: string;
  total: number;
};

/*
------------------------------------
Mock Data (Replace with API later)
------------------------------------
*/

const metrics: Metrics = {
  revenue: 240000,
  transactions: 132,
  avgSale: 1818,
  bestDay: "Friday"
};

const trendData: Trend[] = [
  { day: "Mon", revenue: 12000 },
  { day: "Tue", revenue: 18000 },
  { day: "Wed", revenue: 9000 },
  { day: "Thu", revenue: 20000 },
  { day: "Fri", revenue: 30000 },
  { day: "Sat", revenue: 22000 },
  { day: "Sun", revenue: 15000 }
];

const customers: Customer[] = [
  { name: "Lewis Kamau", total: 55000 },
  { name: "Max V", total: 36000 },
  { name: "Coni Coni", total: 30000 },
  { name: "Sarah W", total: 24000 }
];

/*
------------------------------------
Main Reports Page
------------------------------------
*/

export default function ReportsPage() {

  const [dateRange, setDateRange] = useState("month");

  const exportData = (type: string) => {
    alert(`Exporting ${type}... (connect backend later)`);
  };

  return (
    <div style={{ padding: "32px", background: "#f7f7f7", minHeight: "100vh" }}>

      {/* Header */}

      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700 }}>
          Reports & Analytics
        </h1>

        <p style={{ color: "#666" }}>
          Analyze performance and export business data
        </p>
      </div>

      {/* Date Range Filter */}

      <div style={{ marginBottom: "24px", display: "flex", gap: "10px" }}>

        {["today", "week", "month", "year"].map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "1px solid #ddd",
              background: dateRange === range ? "#111" : "#fff",
              color: dateRange === range ? "#fff" : "#000",
              cursor: "pointer"
            }}
          >
            {range.toUpperCase()}
          </button>
        ))}

      </div>

      {/* KPI STRIP */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "16px",
          marginBottom: "30px"
        }}
      >

        <KPI title="Revenue" value={`KES ${metrics.revenue}`} />

        <KPI title="Transactions" value={metrics.transactions} />

        <KPI title="Average Sale" value={`KES ${metrics.avgSale}`} />

        <KPI title="Best Sales Day" value={metrics.bestDay} />

      </div>

      {/* Sales Trend Chart */}

      <div
        style={{
          background: "#fff",
          padding: "24px",
          borderRadius: "10px",
          marginBottom: "30px"
        }}
      >

        <h3 style={{ marginBottom: "16px" }}>
          Revenue Trend
        </h3>

        <ResponsiveContainer width="100%" height={300}>

          <LineChart data={trendData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="day" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#4F46E5"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

      {/* Top Customers */}

      <div
        style={{
          background: "#fff",
          padding: "24px",
          borderRadius: "10px",
          marginBottom: "30px"
        }}
      >

        <h3 style={{ marginBottom: "16px" }}>
          Top Customers
        </h3>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>

          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
              <th style={{ paddingBottom: "10px" }}>Customer</th>
              <th>Total Spent</th>
            </tr>
          </thead>

          <tbody>

            {customers.map((c, i) => (

              <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>

                <td style={{ padding: "10px 0" }}>
                  {c.name}
                </td>

                <td style={{ fontWeight: 600 }}>
                  KES {c.total}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* Export Center */}

      <div
        style={{
          background: "#fff",
          padding: "24px",
          borderRadius: "10px"
        }}
      >

        <h3 style={{ marginBottom: "16px" }}>
          Export Data
        </h3>

        <div style={{ display: "flex", gap: "12px" }}>

          <button
            onClick={() => exportData("sales")}
            style={exportButtonStyle("#2563EB")}
          >
            Export Sales CSV
          </button>

          <button
            onClick={() => exportData("customers")}
            style={exportButtonStyle("#059669")}
          >
            Export Customers CSV
          </button>

          <button
            onClick={() => exportData("inventory")}
            style={exportButtonStyle("#7C3AED")}
          >
            Export Inventory CSV
          </button>

        </div>

      </div>

    </div>
  );
}

/*
------------------------------------
KPI Component
------------------------------------
*/

function KPI({ title, value }: { title: string; value: any }) {

  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "10px"
      }}
    >

      <p style={{ color: "#777", fontSize: "14px" }}>
        {title}
      </p>

      <h2 style={{ fontSize: "24px", marginTop: "6px" }}>
        {value}
      </h2>

    </div>
  );
}

/*
------------------------------------
Export Button Style
------------------------------------
*/

function exportButtonStyle(color: string) {

  return {
    padding: "10px 16px",
    borderRadius: "6px",
    border: "none",
    background: color,
    color: "white",
    cursor: "pointer"
  } as React.CSSProperties;

}
