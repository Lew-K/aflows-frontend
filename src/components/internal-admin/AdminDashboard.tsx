import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  Building2,
  Database,
  HardDrive,
  Moon,
  RefreshCw,
  Server,
  Sun,
  Users,
  Wallet,
  ShieldAlert,
  ArrowUpRight,
} from "lucide-react";

import { adminApi } from "../lib/adminApi"; // Adjust the path if yours is different

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("admin_theme") === "dark";
  });

  useEffect(() => {
    const admin = localStorage.getItem("superadmin");

    if (!admin) {
      navigate("/internal-admin/login");
    }
  }, [navigate]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("admin_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    adminApi.getStats()
      .then(d => setStatsData(d))
      .catch(() => {});
  }, []);

  const stats = useMemo(() => [
    { 
      title: 'Businesses', 
      value: statsData?.businesses?.total ?? '...', 
      change: `+${statsData?.businesses?.new_this_week ?? 0} this week`, 
      icon: Building2 
    },
    { 
      title: 'MRR', 
      value: `KES ${Number(statsData?.revenue?.monthly_revenue ?? 0).toLocaleString()}`, 
      change: 'Last 30 days', 
      icon: Wallet 
    },
    { 
      title: 'Active Today', 
      value: statsData?.activity?.active_today ?? '...', 
      change: 'Businesses with sales', 
      icon: Activity 
    },
    { 
      title: 'Overdue', 
      value: statsData?.businesses?.overdue ?? '...', 
      change: 'Need attention', 
      icon: AlertTriangle 
    },
  ], [statsData]);
  
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <div className="max-w-[1800px] mx-auto p-4 md:p-8 space-y-8">

        {/* HEADER */}
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-50/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                Admin Control Center
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Monitor infrastructure, businesses, payments, and platform operations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search businesses, logs, receipts..."
                  className="w-[280px] md:w-[360px] h-11 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                />
              </div>

              <button className="h-11 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 text-sm font-medium">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="h-11 w-11 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center justify-center"
              >
                {darkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem("admin_token");
                  localStorage.removeItem("superadmin");
                  navigate("/internal-admin/login");
                }}
                className="h-11 px-5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* KPI GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;

            return (
              <div
                key={i}
                className="relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {stat.title}
                    </p>

                    <h2 className="mt-3 text-4xl font-black tracking-tight">
                      {stat.value}
                    </h2>

                    <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                      <ArrowUpRight className="w-3 h-3" />
                      {stat.change}
                    </div>
                  </div>

                  <div className="h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="xl:col-span-2 space-y-6">

            {/* BUSINESS OPERATIONS */}
            <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black">Business Operations</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Manage business accounts, approvals, and overdue subscriptions.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/internal-admin/businesses")}
                  className="h-11 px-5 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-semibold hover:opacity-90 transition-all"
                >
                  Open Businesses
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-5">
                  <p className="text-sm text-red-500 font-medium">Overdue Accounts</p>
                  <h3 className="mt-2 text-3xl font-black text-red-600">{statsData?.businesses?.overdue ?? '...'}</h3>
                </div>

                <div className="rounded-2xl border border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/20 p-5">
                  <p className="text-sm text-yellow-600 font-medium">Pending Approvals</p>
                  <h3 className="mt-2 text-3xl font-black text-yellow-700">{statsData?.businesses?.trialing ?? '...'}</h3>
                </div>

                <div className="rounded-2xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20 p-5">
                  <p className="text-sm text-green-600 font-medium">Active Today</p>
                  <h3 className="mt-2 text-3xl font-black text-green-700">{statsData?.activity?.active_today ?? '...'}</h3>
                </div>
              </div>
            </section>

            {/* ACTIVITY */}
            <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black">Platform Activity</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Real-time operational events across the platform.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/internal-admin/activity")}
                  className="text-sm font-semibold hover:underline"
                >
                  View all
                </button>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: "New business created",
                    time: "2m ago",
                    type: "success",
                  },
                  {
                    title: "Payment retry failed",
                    time: "18m ago",
                    type: "danger",
                  },
                  {
                    title: "Admin settings updated",
                    time: "1h ago",
                    type: "neutral",
                  },
                ].map((event, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          event.type === "success"
                            ? "bg-green-500"
                            : event.type === "danger"
                            ? "bg-red-500"
                            : "bg-zinc-400"
                        }`}
                      />

                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {event.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            {/* SYSTEM HEALTH */}
            <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Server className="w-5 h-5" />
                <h2 className="text-xl font-black">Infrastructure Health</h2>
              </div>

              <div className="space-y-4">
                {[
                  {
                    name: "API",
                    icon: Activity,
                    status: "Healthy",
                    color: "green",
                  },
                  {
                    name: "Postgres",
                    icon: Database,
                    status: "Healthy",
                    color: "green",
                  },
                  {
                    name: "Storage",
                    icon: HardDrive,
                    status: "Warning",
                    color: "yellow",
                  },
                  {
                    name: "Security",
                    icon: ShieldAlert,
                    status: "3 alerts",
                    color: "red",
                  },
                ].map((item, i) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>

                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Operational service
                          </p>
                        </div>
                      </div>

                      <div
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          item.color === "green"
                            ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                            : item.color === "yellow"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
                            : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                        }`}
                      >
                        {item.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ALERTS */}
            <section className="rounded-3xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h2 className="text-xl font-black text-red-700 dark:text-red-400">
                  Needs Attention
                </h2>
              </div>

              <div className="space-y-3">
                {[
                  "2 businesses pending approval",
                  "1 failed payment retry",
                  "4 flagged users",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-red-200 dark:border-red-900 bg-white/60 dark:bg-black/20 p-4 text-sm font-medium"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
