import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "@/lib/adminApi";
import axios from "axios"; // Ensure axios is installed: npm install axios

type Business = {
  id: string;
  name: string;
  owner_email: string;
  plan?: string;
  status?: string;
  created_at?: string;
};

const WEBHOOKS = {
  IMPERSONATE: "https://n8n.aflows.uk/webhook/api/admin/impersonate",
  DELETE: "https://n8n.aflows.uk/webhook/admin/delete-business",
  DEACTIVATE: "https://n8n.aflows.uk/webhook/admin/deactivate-business"
};

const Businesses = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // ---------- LOAD + PREFETCH ----------
  useEffect(() => {
    let isMounted = true;
    const cached = sessionStorage.getItem("admin_businesses");
    if (cached) setBusinesses(JSON.parse(cached));

    adminApi.getBusinesses()
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
  
  const impersonateUser = async (business: Business) => {
    try {
      const response = await axios.post(WEBHOOKS.IMPERSONATE, { 
        business_id: business.id,
        email: business.owner_email 
      });
      // Logic assumes webhook returns a redirect URL or a temp token
      if (response.data?.url) {
        window.open(response.data.url, "_blank");
      } else {
        alert("Impersonation session triggered for " + business.name);
      }
    } catch (err) { alert("Impersonation failed"); }
  };

  const toggleActivation = async (business: Business) => {
    const isDeactivated = ["deactivated", "inactive"].includes(business.status?.toLowerCase() || "");
    const actionLabel = isDeactivated ? "activate" : "deactivate";
    
    if (!confirm(`Are you sure you want to ${actionLabel} this business?`)) return;

    try {
      await axios.post(WEBHOOKS.DEACTIVATE, { 
        business_id: business.id, 
        action: actionLabel // sending the context to your n8n workflow
      });
      
      const newStatus = isDeactivated ? "active" : "inactive";
      updateBusinessState(business.id, { status: newStatus });
      setOpenMenu(null);
      alert(`Business successfully ${isDeactivated ? 'activated' : 'deactivated'}.`);
    } catch (err) { alert("Status update failed"); }
  };

  const confirmDelete = async (id: string) => {
    const password = prompt("Enter admin password to delete this business");
    if (!password) return;
    try {
      await axios.post(WEBHOOKS.DELETE, { business_id: id, admin_password: password });
      updateBusinessState(id, null);
      setOpenMenu(null);
      alert("Business deleted permanently.");
    } catch (err) { alert("Delete failed. Check password or connection."); }
  };

  // Helper formatting and UI logic remains the same...
  const filteredBusinesses = useMemo(() => {
    const query = search.toLowerCase();
    return businesses.filter(b => 
      b.name.toLowerCase().includes(query) || b.owner_email.toLowerCase().includes(query)
    );
  }, [search, businesses]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const StatusBadge = ({ status }: { status?: string }) => {
    const s = status?.toLowerCase() || "active";
    const configs: Record<string, string> = {
      active: "bg-green-100 text-green-700 border-green-200",
      inactive: "bg-gray-100 text-gray-700 border-gray-200",
      deactivated: "bg-orange-100 text-orange-700 border-orange-200",
    };
    const style = configs[s] || configs.active;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
        {s.charAt(0).toUpperCase() + s.slice(1)}
      </span>
    );
  };

  return (
    <div className={`p-8 space-y-6 min-h-screen ${darkMode ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}`}>
      {/* Header & Search */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">All Businesses</h1>
        <div className="flex gap-4">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 border rounded">{darkMode ? "☀️ Light" : "🌙 Dark"}</button>
          <button onClick={() => navigate("/internal-admin")} className="px-4 py-2 border rounded">Back</button>
        </div>
      </div>

      <input 
        type="text" 
        placeholder="Search..." 
        className={`border rounded px-3 py-2 w-full max-w-md ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white"}`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <div className={`border rounded-lg overflow-hidden ${darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
        <table className="w-full">
          <thead className={darkMode ? "bg-slate-900/50" : "bg-slate-50"}>
            <tr className="text-left text-xs font-semibold uppercase opacity-70">
              <th className="p-4">Business</th>
              <th className="p-4">Owner</th>
              <th className="p-4">Status</th>
              <th className="p-4">Joined</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/20">
            {filteredBusinesses.map((b) => {
              const isDeactivated = ["deactivated", "inactive"].includes(b.status?.toLowerCase() || "");
              
              return (
                <tr key={b.id} className="hover:bg-blue-50/10">
                  <td className="p-4 text-sm font-medium">{b.name}</td>
                  <td className="p-4 text-sm opacity-80">{b.owner_email}</td>
                  <td className="p-4"><StatusBadge status={b.status} /></td>
                  <td className="p-4 text-sm opacity-60">{formatDate(b.created_at)}</td>
                  <td className="p-4 text-right relative">
                    <button onClick={() => setOpenMenu(openMenu === b.id ? null : b.id)} className="px-2 py-1 border rounded">⋮</button>
                    {openMenu === b.id && (
                      <div ref={menuRef} className={`absolute right-4 mt-2 w-52 border rounded shadow-xl z-[100] py-1 ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white"}`}>
                        <button onClick={() => impersonateUser(b)} className="block w-full text-left px-4 py-2 text-sm text-purple-500 hover:bg-slate-100/10">✨ Impersonate</button>
                        <div className="border-t border-slate-700/20 my-1"></div>
                        
                        {/* Dynamic Toggle Button */}
                        <button 
                          onClick={() => toggleActivation(b)} 
                          className={`block w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-100/10 ${isDeactivated ? "text-green-500" : "text-orange-600"}`}
                        >
                          {isDeactivated ? "Activate Business" : "Deactivate Business"}
                        </button>

                        <button onClick={() => confirmDelete(b.id)} className="block w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-slate-100/10">Delete Business</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Businesses;
