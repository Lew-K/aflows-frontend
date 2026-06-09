import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../lib/adminApi";
import {
  ArrowLeft,
  Moon,
  RefreshCw,
  Sun,
  Activity as ActivityIcon,
} from "lucide-react";

type ActivityItem = {
  id: string;
  event_type: string;
  business_name: string;
  business_id: string;
  description: string;
  created_at: string;
};

const EVENT_COLOR: Record<string, { dot: string; badge: string }> = {
  business_created:    { dot: "bg-green-500",  badge: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" },
  business_activated:  { dot: "bg-green-500",  badge: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" },
  payment_success:     { dot: "bg-green-500",  badge: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" },
  business_deactivated:{ dot: "bg-orange-500", badge: "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400" },
  business_deleted:    { dot: "bg-red-500",    badge: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" },
  payment_failed:      { dot: "bg-red-500",    badge: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" },
  payment_retry_failed:{ dot: "bg-red-500",    badge: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" },
};

const DEFAULT_COLORS = {
  dot: "bg-zinc-400",
  badge: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

function formatEventLabel(eventType: string) {
  return eventType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const LIMIT_OPTIONS = [25, 50, 100, 250];

const ActivityPage = () => {
  const navigate = useNavigate();
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(100);
  const [search, setSearch] = useState("");

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("admin_theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("admin_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const fetchActivity = (l = limit) => {
    setLoading(true);
    adminApi
      .getActivity(l)
      .then((d) => setActivity(d.activity || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchActivity(limit);
  }, [limit]);

  const filtered = activity.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.business_name?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.event_type?.toLowerCase().includes(q) ||
      item.business_id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <div className="max-w-[1800px] mx-auto p-4 md:p-8 space-y-8">

        {/* TOPBAR */}
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-50/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 shadow-sm">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">Platform Activity</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Operational event log across all businesses.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* SEARCH */}
              <input
                type="text"
                placeholder="Filter by business, event, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-[260px] md:w-[320px] h-11 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
              />

              {/* LIMIT */}
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="h-11 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
              >
                {LIMIT_OPTIONS.map((l) => (
                  <option key={l} value={l}>
                    Last {l} events
                  </option>
                ))}
              </select>

              {/* REFRESH */}
              <button
                onClick={() => fetchActivity(limit)}
                disabled={loading}
                className="h-11 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>

              {/* DARK MODE */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="h-11 w-11 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center justify-center"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* BACK */}
              <button
                onClick={() => navigate("/internal-admin")}
                className="h-11 px-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 text-sm font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h2 className="text-2xl font-black">Event Log</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Showing{" "}
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{filtered.length}</span>{" "}
                of {activity.length} events
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-950/30 px-4 py-2 text-sm font-semibold text-green-700 dark:text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Live Data
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="p-5 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Time</th>
                  <th className="p-5 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Business</th>
                  <th className="p-5 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Business ID</th>
                  <th className="p-5 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Event</th>
                  <th className="p-5 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Description</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filtered.map((item) => {
                  const colors = EVENT_COLOR[item.event_type] ?? DEFAULT_COLORS;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-all"
                    >
                      {/* TIME */}
                      <td className="p-5 whitespace-nowrap">
                        <p className="text-sm font-medium">{formatDateTime(item.created_at)}</p>
                      </td>

                      {/* BUSINESS */}
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-xs shrink-0">
                            {(item.business_name ?? "?").slice(0, 2).toUpperCase()}
                          </div>
                          <p className="text-sm font-semibold">{item.business_name ?? "—"}</p>
                        </div>
                      </td>

                      {/* BUSINESS ID */}
                      <td className="p-5">
                        <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-lg px-2 py-1 inline-block max-w-[180px] truncate">
                          {item.business_id ?? "—"}
                        </p>
                      </td>

                      {/* EVENT TYPE */}
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full shrink-0 ${colors.dot}`} />
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${colors.badge}`}>
                            {formatEventLabel(item.event_type)}
                          </span>
                        </div>
                      </td>

                      {/* DESCRIPTION */}
                      <td className="p-5">
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">{item.description}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* EMPTY */}
          {filtered.length === 0 && !loading && (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="h-20 w-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6">
                <ActivityIcon className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-2xl font-black">No activity found</h3>
              <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-md">
                Try adjusting your search or increasing the event limit.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ActivityPage;

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { adminApi } from "../../lib/adminApi";

// type ActivityItem = {
//   id: string;
//   event_type: string;
//   business_name: string;
//   description: string;
//   created_at: string;
// };

// const Activity = () => {

//   const navigate = useNavigate();
//   const [activity, setActivity] = useState<ActivityItem[]>([]);

//   useEffect(() => {
//     adminApi.getActivity(100)
//       .then(d => setActivity(d.activity || []))
//       .catch(() => {});
//   }, []);
  
//   return (
//     <div className="p-8 space-y-6">

//       <div className="flex justify-between items-center">

//         <h1 className="text-2xl font-bold">
//           Platform Activity
//         </h1>

//         <button
//           onClick={() => navigate("/internal-admin")}
//           className="px-4 py-2 border rounded"
//         >
//           Back to Dashboard
//         </button>

//       </div>

//       <div className="border rounded-lg overflow-hidden">

//         <table className="w-full text-sm">

//           <thead className="bg-gray-100 text-left">
//             <tr>
//               <th className="p-3">Time</th>
//               <th className="p-3">Business</th>
//               <th className="p-3">Event</th>
//               <th className="p-3">Description</th>
//             </tr>
//           </thead>

//           <tbody>

//             {activity.map((item) => (

//               <tr key={item.id} className="border-t">

//                 <td className="p-3">{item.created_at}</td>
//                 <td className="p-3">{item.business_name}</td>
//                 <td className="p-3 capitalize">
//                   {item.event_type.replace("_", " ")}
//                 </td>
//                 <td className="p-3">{item.description}</td>

//               </tr>

//             ))}

//           </tbody>

//         </table>

//       </div>

//     </div>
//   );
// };

// export default Activity;
