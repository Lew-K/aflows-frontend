import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const admin = localStorage.getItem("superadmin");
    if (!admin) {
      navigate("/internal-admin/login");
    }
  }, [navigate]);

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 transition-colors duration-300 p-4 md:p-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Platform Admin</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400">System overview and management</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
            >
              {darkMode ? "🌞" : "🌙"}
            </button>

            <button
              onClick={() => {
                localStorage.removeItem("admin_token");
                localStorage.removeItem("superadmin");
                navigate("/internal-admin/login");
              }}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-sm hover:shadow transition-all active:scale-95"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            { label: "Total Businesses", val: "124", color: "text-blue-600" },
            { label: "Active Today", val: "18", color: "text-green-600" },
            { label: "Issues", val: "3", color: "text-red-500" },
            { label: "Revenue (KES)", val: "245,000", color: "text-gray-900 dark:text-white" },
          ].map((stat, i) => (
            <div key={i} className="p-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.val}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Primary Business Card */}
            <div
              onClick={() => navigate("/internal-admin/businesses")}
              className="group relative p-8 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl hover:ring-2 hover:ring-black dark:hover:ring-white transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-flex items-center justify-center p-3 bg-gray-100 dark:bg-zinc-800 rounded-lg mb-4 text-2xl">🏢</span>
                  <h2 className="text-2xl font-bold">Business Management</h2>
                  <p className="mt-2 text-gray-500 dark:text-zinc-400 max-w-md">
                    Manage accounts, deactivate for non-payment, and monitor platform usage.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">124</p>
                  <p className="text-xs text-gray-400 uppercase">Total</p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-red-500 font-bold text-lg">6</span>
                  <span className="text-xs text-gray-400 uppercase">Overdue</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-yellow-500 font-bold text-lg">3</span>
                  <span className="text-xs text-gray-400 uppercase">Pending</span>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); navigate("/internal-admin/businesses?filter=overdue"); }}
                  className="px-4 py-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-semibold rounded-lg hover:bg-red-100 transition"
                >
                  View Overdue
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate("/internal-admin/businesses?filter=pending"); }}
                  className="px-4 py-2 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 text-sm font-semibold rounded-lg hover:bg-yellow-100 transition"
                >
                  Approve New
                </button>
              </div>
            </div>

            {/* Platform Activity Mini-Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div
                onClick={() => navigate("/internal-admin/activity")}
                className="p-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl hover:shadow-lg transition cursor-pointer"
              >
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span>📊</span> Activity Logs
                </h3>
                <p className="text-sm text-gray-500 mt-1">Audit platform-wide events.</p>
              </div>

              <div className="p-6 bg-gray-100/50 dark:bg-zinc-900/50 border border-dashed border-gray-300 dark:border-zinc-800 rounded-2xl opacity-60">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span>💳</span> Payments
                </h3>
                <p className="text-sm text-gray-500 mt-1">Coming soon: Subscriptions</p>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Attention Section */}
            <div className="p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
              <h2 className="text-amber-800 dark:text-amber-400 font-bold mb-4 flex items-center gap-2">
                ⚠️ Needs Attention
              </h2>
              <div className="space-y-3">
                {[
                  "2 businesses pending approval",
                  "1 failed payment retry",
                  "4 users flagged"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-amber-900 dark:text-amber-300/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="p-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl">
              <h2 className="font-bold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {[
                  { text: "New business created", time: "2m ago" },
                  { text: "Upgraded to premium", time: "1h ago" },
                  { text: "Admin settings updated", time: "3h ago" },
                ].map((act, i) => (
                  <div key={i} className="flex justify-between items-start gap-4">
                    <p className="text-sm text-gray-600 dark:text-zinc-400">• {act.text}</p>
                    <span className="text-[10px] font-mono text-gray-400 shrink-0">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
