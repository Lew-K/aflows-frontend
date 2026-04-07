import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "@/lib/adminApi";
import { useAuth } from "@/contexts/AuthContext";
import { 
  MoreVertical, Search, ArrowLeft, Sun, Moon, 
  ExternalLink, UserShield, Key, Power, Trash2, Database, Receipt 
} from "lucide-react"; // Highly recommend adding Lucide for a polished look

// ... Business type stays the same

const Businesses = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // ---------- LOAD + PREFETCH ----------
  useEffect(() => {
    let isMounted = true;
    const cached = sessionStorage.getItem("admin_businesses");
    if (cached) {
      setBusinesses(JSON.parse(cached));
      setIsLoading(false);
    }

    adminApi.getBusinesses()
      .then((data) => {
        if (!isMounted) return;
        const list = data.businesses || [];
        setBusinesses(list);
        sessionStorage.setItem("admin_businesses", JSON.stringify(list));
      })
      .catch((err) => console.error("Failed to load businesses", err))
      .finally(() => setIsLoading(false));

    return () => { isMounted = false; };
  }, []);

  // ---------- CLICK OUTSIDE ----------
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredBusinesses = useMemo(() => {
    const query = search.toLowerCase();
    return businesses.filter(b => 
      b.name.toLowerCase().includes(query) || 
      b.owner_email.toLowerCase().includes(query)
    );
  }, [search, businesses]);

  // ---------- UI COMPONENTS (Local) ----------
  const StatusBadge = ({ status }: { status?: string }) => {
    const s = status?.toLowerCase() || "active";
    const configs: Record<string, string> = {
      active: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
      inactive: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
      deactivated: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
      overdue: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
    };
    const style = configs[s] || configs.active;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${style}`}>
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current"></span>
        {s.charAt(0).toUpperCase() + s.slice(1)}
      </span>
    );
  };

  // ... Logic functions (impersonateUser, etc.) stay exactly the same ...

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Businesses</h1>
            <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Manage {businesses.length} registered organizations and their access levels.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl border transition-all ${darkMode ? "bg-slate-900 border-slate-800 hover:bg-slate-800" : "bg-white border-slate-200 hover:bg-slate-50 shadow-sm"}`}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={() => navigate("/internal-admin")} 
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl font-medium transition-all ${darkMode ? "bg-slate-900 border-slate-800 hover:bg-slate-800" : "bg-white border-slate-200 hover:bg-slate-50 shadow-sm"}`}
            >
              <ArrowLeft size={18} /> Back
            </button>
          </div>
        </div>

        {/* SEARCH & STATS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              className={`pl-10 pr-4 py-2.5 w-full rounded-xl border outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${darkMode ? "bg-slate-900 border-slate-800 text-white placeholder:text-slate-600" : "bg-white border-slate-200 text-black shadow-sm"}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={`text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Results: <span className={darkMode ? "text-white" : "text-black"}>{filteredBusinesses.length}</span>
          </div>
        </div>

        {/* TABLE CONTAINER */}
        <div className={`rounded-2xl overflow-hidden border transition-all ${darkMode ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-white shadow-sm"}`}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className={`border-b ${darkMode ? "border-slate-800 bg-slate-900" : "bg-slate-50/50 border-slate-200"}`}>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Business</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Owner</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Plan</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Joined</th>
                  <th className="p-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? "divide-slate-800" : "divide-slate-100"}`}>
                {isLoading ? (
                  /* Skeleton Loader Placeholder */
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="p-4"><div className={`h-8 rounded-lg ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}></div></td>
                    </tr>
                  ))
                ) : filteredBusinesses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500">No businesses found matching your search.</td>
                  </tr>
                ) : (
                  filteredBusinesses.map((b) => (
                    <tr key={b.id} className={`group transition-colors ${darkMode ? "hover:bg-slate-800/40" : "hover:bg-slate-50/50"}`}>
                      <td className="p-4 text-sm font-semibold">{b.name}</td>
                      <td className="p-4 text-sm opacity-80">{b.owner_email}</td>
                      <td className="p-4 text-sm font-medium italic text-blue-500">{b.plan || "Free"}</td>
                      <td className="p-4"><StatusBadge status={b.status} /></td>
                      <td className="p-4 text-sm opacity-60 italic">{formatDate(b.created_at)}</td>
                      <td className="p-4 text-right relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === b.id ? null : b.id)}
                          className={`p-1.5 rounded-lg transition-all ${darkMode ? "hover:bg-slate-700" : "hover:bg-slate-200"}`}
                        >
                          <MoreVertical size={18} />
                        </button>

                        {openMenu === b.id && (
                          <div ref={menuRef} className={`absolute right-4 mt-2 w-56 rounded-xl border shadow-2xl z-[100] py-2 overflow-hidden animate-in fade-in zoom-in duration-100 ${darkMode ? "bg-slate-800 border-slate-700 shadow-black" : "bg-white border-slate-200 shadow-slate-200"}`}>
                            <MenuButton onClick={() => openDashboard(b.id)} icon={<ExternalLink size={14}/>} label="Open Dashboard" darkMode={darkMode} />
                            <MenuButton onClick={() => openReceipts(b.id)} icon={<Receipt size={14}/>} label="View Receipts" darkMode={darkMode} />
                            <MenuButton onClick={() => openDB(b.id)} icon={<Database size={14}/>} label="Database" darkMode={darkMode} />
                            
                            <div className={`border-t my-1 ${darkMode ? "border-slate-700" : "border-slate-100"}`}></div>
                            
                            <MenuButton onClick={() => impersonateUser(b.id)} icon={<UserShield size={14}/>} label="Impersonate" color="text-purple-500" darkMode={darkMode} />
                            <MenuButton onClick={() => resetPassword(b.id)} icon={<Key size={14}/>} label="Reset Password" color="text-blue-500" darkMode={darkMode} />
                            
                            {b.status === "inactive" ? (
                              <MenuButton onClick={() => activateBusiness(b.id)} icon={<Power size={14}/>} label="Activate" color="text-emerald-500" darkMode={darkMode} />
                            ) : (
                              <MenuButton onClick={() => deactivateBusiness(b.id)} icon={<Power size={14}/>} label="Deactivate" color="text-amber-500" darkMode={darkMode} />
                            )}
                            
                            <MenuButton onClick={() => confirmDelete(b.id)} icon={<Trash2 size={14}/>} label="Delete Business" color="text-rose-500" darkMode={darkMode} />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for menu items to keep code clean
const MenuButton = ({ onClick, label, icon, color = "", darkMode }: any) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${color} ${darkMode ? "hover:bg-slate-700" : "hover:bg-slate-50"}`}
  >
    {icon} {label}
  </button>
);

export default Businesses;
