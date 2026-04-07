import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "@/lib/adminApi";

type Business = {
  id: string;
  name: string;
  owner_email: string;
  plan?: string;
  status?: string;
  created_at?: string;
};

const Businesses = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false); // Toggle State
  const menuRef = useRef<HTMLDivElement | null>(null);

  // ---------- LOAD + PREFETCH ----------
  useEffect(() => {
    let isMounted = true;
    const cached = sessionStorage.getItem("admin_businesses");
    if (cached) setBusinesses(JSON.parse(cached));

    adminApi
      .getBusinesses()
      .then((data) => {
        if (!isMounted) return;
        const list = data.businesses || [];
        setBusinesses(list);
        sessionStorage.setItem("admin_businesses", JSON.stringify(list));
      })
      .catch((err) => console.error("Failed to load businesses", err));

    return () => { isMounted = false; };
  }, []);

  // ---------- CLICK OUTSIDE HANDLER ----------
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---------- SEARCH ----------
  const filteredBusinesses = useMemo(() => {
    const query = search.toLowerCase();
    return businesses.filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.owner_email.toLowerCase().includes(query)
    );
  }, [search, businesses]);

  // ---------- HELPERS ----------
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const StatusBadge = ({ status }: { status?: string }) => {
    const s = status?.toLowerCase() || "active";
    const configs: Record<string, string> = {
      active: "bg-green-100 text-green-700 border-green-200",
      inactive: "bg-gray-100 text-gray-700 border-gray-200",
      deactivated: "bg-orange-100 text-orange-700 border-orange-200",
      overdue: "bg-red-100 text-red-700 border-red-200",
    };
    const style = configs[s] || configs.active;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
        <span className={`mr-1.5 h-2 w-2 rounded-full ${style.split(' ')[1].replace('text', 'bg')}`}></span>
        {s.charAt(0).toUpperCase() + s.slice(1)}
      </span>
    );
  };

  const updateBusinessState = (id: string, updates: Partial<Business> | null) => {
    setBusinesses((prev) => {
      const newList = updates 
        ? prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
        : prev.filter((b) => b.id !== id);
      sessionStorage.setItem("admin_businesses", JSON.stringify(newList));
      return newList;
    });
  };

  // ---------- ACTIONS ----------
  const openDashboard = (id: string) => window.open(`/dashboard?business_id=${id}`, "_blank");
  const openReceipts = (id: string) => window.open(`/internal-admin/business/${id}/receipts`, "_blank");
  const openDB = (id: string) => window.open(`/internal-admin/db/${id}`, "_blank");
  
  const impersonateUser = async (id: string) => {
    const adminPassword = prompt("Enter admin password to impersonate");
    if (!adminPassword) return;
  
    try {
      const res = await adminApi.impersonate(id, adminPassword);
  
      const {
        access_token,
        refresh_token,
        business_id
      } = res;
  
      // 🔥 CRITICAL: overwrite session
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("business_id", business_id);
  
      // optional: mark session as impersonation
      localStorage.setItem("is_impersonating", "true");
  
      // open dashboard AFTER setting tokens
      window.open(`/dashboard`, "_blank");
  
    } catch (err) {
      alert("Impersonation failed");
    }
  };

  const resetPassword = async (id: string) => {
    const adminPassword = prompt("Enter admin password");
    if (!adminPassword) return;
  
    const newPassword = prompt("Enter new password");
    if (!newPassword) return;
  
    try {
      await adminApi.resetPassword(id, newPassword, adminPassword);
      alert("Password updated");
      setOpenMenu(null);
    } catch (err) {
      alert("Reset failed");
    }
  };

  const deactivateBusiness = async (id: string) => {
    const adminPassword = prompt("Enter admin password to deactivate");
    if (!adminPassword) return;
  
    if (!confirm("Deactivate this business?")) return;
  
    try {
      await adminApi.deactivateBusiness(id, adminPassword);
      updateBusinessState(id, { status: "inactive" });
      setOpenMenu(null);
    } catch (err) {
      console.error("Deactivate failed", err);
    }
  };

  const activateBusiness = async (id: string) => {
    const adminPassword = prompt("Enter admin password to activate");
    if (!adminPassword) return;
  
    try {
      await adminApi.activateBusiness(id, adminPassword);
      updateBusinessState(id, { status: "active" });
      setOpenMenu(null);
    } catch (err) {
      console.error("Activate failed", err);
    }
  };

  const confirmDelete = async (id: string) => {
    const password = prompt("Enter admin password to delete this business");
    if (!password) return;
    try {
      await adminApi.deleteBusiness(id, password);
      updateBusinessState(id, null);
      setOpenMenu(null);
    } catch (err) { console.error("Delete failed", err); }
  };

  return (
    <div className={`p-8 space-y-6 min-h-screen transition-colors duration-200 ${darkMode ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}`}>
      <div className="flex justify-between items-center">
        <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-black"}`}>All Businesses</h1>
        
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg border transition-all ${darkMode ? "bg-slate-800 border-slate-700 hover:bg-slate-700" : "bg-slate-100 border-slate-200 hover:bg-slate-200"}`}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button 
            onClick={() => navigate("/internal-admin")} 
            className={`px-4 py-2 border rounded transition-colors ${darkMode ? "border-slate-700 hover:bg-slate-800" : "border-slate-300 hover:bg-slate-50"}`}
          >
            Back
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search business or owner email..."
        className={`border rounded px-3 py-2 w-full max-w-md focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-black"}`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
        Showing <b>{filteredBusinesses.length}</b> of {businesses.length} businesses
      </p>

      <div className={`border rounded-lg overflow-hidden shadow-sm transition-colors ${darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className={`${darkMode ? "bg-slate-900/50" : "bg-slate-50"} border-b ${darkMode ? "border-slate-700" : "border-slate-200"}`}>
              <tr>
                <th className={`p-4 text-left text-xs font-semibold uppercase ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Business</th>
                <th className={`p-4 text-left text-xs font-semibold uppercase ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Owner</th>
                <th className={`p-4 text-left text-xs font-semibold uppercase ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Plan</th>
                <th className={`p-4 text-left text-xs font-semibold uppercase ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Status</th>
                <th className={`p-4 text-left text-xs font-semibold uppercase ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Joined</th>
                <th className={`p-4 text-right text-xs font-semibold uppercase ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? "divide-slate-700" : "divide-slate-200"}`}>
              {filteredBusinesses.map((b) => (
                <tr key={b.id} className={`transition-colors group ${darkMode ? "hover:bg-slate-700/50" : "hover:bg-blue-50/50"}`}>
                  <td className={`p-4 text-sm font-medium ${darkMode ? "text-slate-200" : "text-slate-900"}`}>{b.name}</td>
                  <td className={`p-4 text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>{b.owner_email}</td>
                  <td className={`p-4 text-sm capitalize ${darkMode ? "text-slate-400" : "text-slate-600"}`}>{b.plan || "Free"}</td>
                  <td className="p-4 text-sm">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className={`p-4 text-sm ${darkMode ? "text-slate-500" : "text-slate-500"}`}>
                    {formatDate(b.created_at)}
                  </td>
                  <td className="p-4 text-right relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === b.id ? null : b.id)}
                      className={`inline-flex items-center justify-center w-8 h-8 border rounded transition-all shadow-sm ${darkMode ? "text-slate-400 border-slate-600 hover:bg-slate-600" : "text-slate-500 border-slate-200 hover:bg-white"}`}
                    >
                      ⋮
                    </button>

                    {openMenu === b.id && (
                      <div 
                        ref={menuRef} 
                        className={`absolute right-4 mt-2 w-52 border rounded-md shadow-xl z-[100] py-1 transition-colors ${darkMode ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-700"}`}
                      >
                        <button onClick={() => openDashboard(b.id)} className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}>Open Dashboard</button>
                        <button onClick={() => openReceipts(b.id)} className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}>View Receipts</button>
                        <button onClick={() => openDB(b.id)} className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}>Database</button>
                        <button onClick={() => impersonateUser(b.id)} className={`block w-full text-left px-4 py-2 text-sm font-medium text-purple-500 ${darkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}>✨ Impersonate</button>
                        <div className={`border-t my-1 ${darkMode ? "border-slate-700" : "border-slate-100"}`}></div>
                        <button onClick={() => resetPassword(b.id)} className={`block w-full text-left px-4 py-2 text-sm font-medium text-blue-500 ${darkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}>Reset Password</button>
                        {b.status === "inactive" ? (
                          <button
                            onClick={() => activateBusiness(b.id)}
                            className={`block w-full text-left px-4 py-2 text-sm font-medium text-green-600 ${
                              darkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"
                            }`}
                          >
                            Activate
                          </button>
                        ) : (
                          <button
                            onClick={() => deactivateBusiness(b.id)}
                            className={`block w-full text-left px-4 py-2 text-sm font-medium text-orange-600 ${
                              darkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"
                            }`}
                          >
                            Deactivate
                          </button>
                        )}
                        <button onClick={() => confirmDelete(b.id)} className={`block w-full text-left px-4 py-2 text-sm font-medium text-red-600 ${darkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}>Delete Business</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Businesses;
