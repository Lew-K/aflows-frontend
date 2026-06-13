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
  Mail,
} from "lucide-react";

import { adminApi } from "../../lib/adminApi";

// ADD after imports
type ActivityItem = {
  id: string;
  event_type: string;
  business_name: string;
  description: string;
  created_at: string;
};

const EVENT_TYPE_COLOR: Record<string, "success" | "danger" | "neutral"> = {
  business_created: "success",   business_activated: "success",
  payment_success: "success",    payment_received: "success",
  sale_recorded: "neutral",      business_deactivated: "danger",
  payment_failed: "danger",      payment_retry_failed: "danger",
  admin_impersonation: "neutral",password_reset: "neutral",
  business_deleted: "danger",
};
function getEventColor(e: string): "success" | "danger" | "neutral" {
  return EVENT_TYPE_COLOR[e] ?? "neutral";
}
function timeAgo(d: string): string {
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

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
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactPreview, setContactPreview] = useState<any[]>([]);
  
  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      adminApi.getStats().catch(() => null),
      adminApi.getActivity(5).catch(() => ({ activity: [] })),
      adminApi.getContactMessages({ limit: 5 }).catch(() => ({ messages: [] })),
    ]).then(([stats, activityRes, contactRes]) => {
      if (stats) setStatsData(stats);
      setRecentActivity(activityRes?.activity || []);
      setContactPreview(contactRes?.messages || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // useEffect(() => {
  //   adminApi.getStats()
  //     .then(d => setStatsData(d))
  //     .catch(() => {});
  // }, []);

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

  const attentionItems = useMemo(() => {
    if (!statsData) return [];
    const items: string[] = [];
    const pending = Number(statsData.businesses?.trialing ?? 0);
    const overdue = Number(statsData.businesses?.overdue ?? 0);
    const pendingPayments = Number(statsData.payments?.pending ?? 0);
    if (pending > 0) items.push(`${pending} business${pending !== 1 ? "es" : ""} pending approval`);
    if (overdue > 0) items.push(`${overdue} overdue subscription${overdue !== 1 ? "s" : ""}`);
    if (pendingPayments > 0) items.push(`${pendingPayments} payment${pendingPayments !== 1 ? "s" : ""} pending`);
    return items;
  }, [statsData]);
  
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

              <button onClick={fetchAll} disabled={loading} className="h-11 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
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
                  {recentActivity.length === 0 && !loading && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 py-4 text-center">
                    No recent activity found.
                  </p>
                )}
                {recentActivity.map((event) => {
                  const color = getEventColor(event.event_type);
                  return (
                    <div key={event.id} className="flex items-center justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
                      <div className="flex items-center gap-4">
                        <div className={`h-3 w-3 rounded-full shrink-0 ${color === "success" ? "bg-green-500" : color === "danger" ? "bg-red-500" : "bg-zinc-400"}`} />
                        <div>
                          <p className="font-medium">{event.description}</p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">{event.business_name}</p>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400 shrink-0 ml-4">{timeAgo(event.created_at)}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            {/* CONTACTS PREVIEW */}
            <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5" />
                  <h2 className="text-xl font-black">Contact Messages</h2>
                </div>
                <button
                  onClick={() => navigate('/internal-admin/contacts')}
                  className="h-9 px-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-sm font-semibold hover:opacity-90 transition-all"
                >
                  View All
                </button>
              </div>
            
              <div className="space-y-3">
                {contactPreview.length === 0 && !loading && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 py-4 text-center">No messages yet.</p>
                )}
                {contactPreview.map((msg: any) => (
                  <div
                    key={msg.id}
                    className="flex items-start justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold truncate">{msg.name}</p>
                        <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          msg.status === 'responded'
                            ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                        }`}>
                          {msg.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{msg.subject}</p>
                    </div>
                    <p className="text-xs text-zinc-400 shrink-0">{timeAgo(msg.created_at)}</p>
                  </div>
                ))}
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
                {attentionItems.length === 0 ? (
                  <div className="rounded-2xl border border-green-200 dark:border-green-900 bg-white/60 dark:bg-black/20 p-4 text-sm font-medium text-green-700 dark:text-green-400">
                    All clear — no issues detected
                  </div>
                ) : (
                  attentionItems.map((item, i) => (
                    <div key={i} className="rounded-2xl border border-red-200 dark:border-red-900 bg-white/60 dark:bg-black/20 p-4 text-sm font-medium">
                      {item}
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
