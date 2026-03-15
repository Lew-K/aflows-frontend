import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "@/lib/adminApi";

type Business = {
  id: string;
  name: string;
  owner_email: string;
  plan?: string;
  status?: string;
  created_at?: string; // Added from API
};

const Businesses = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
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

  const resetPassword = async (id: string) => {
    const newPassword = prompt("Enter new password");
    if (!newPassword) return;
    try {
      await adminApi.resetPassword(id, newPassword);
      alert("Password updated");
      setOpenMenu(null);
    } catch (err) { alert("Reset failed"); }
  };

  const deactivateBusiness = async (id: string) => {
    if (!confirm("Deactivate this business?")) return;
    try {
      await adminApi.deactivateBusiness(id);
      updateBusinessState(id, { status: "inactive" });
      setOpenMenu(null);
    } catch (err) { console.error("Deactivate failed", err); }
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
    <div className="p-8 space-y-6 bg-white min-h-screen text-slate-900">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">All Businesses</h1>
        <button 
          onClick={() => navigate("/internal-admin")} 
          className="px-4 py-2 border border-slate-300 rounded hover:bg-slate-50 text-slate-700 transition-colors"
        >
          Back
        </button>
      </div>

      <input
        type="text"
        placeholder="Search business or owner email..."
        className="border border-slate-300 rounded px-3 py-2 w-full max-w-md text-black focus:ring-2 focus:ring-blue-500 outline-none bg-white"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <p className="text-sm text-slate-500">
        Showing <b>{filteredBusinesses.length}</b> of {businesses.length} businesses
      </p>

      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-left text-xs font-semibold text-slate-600 uppercase">Business</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-600 uppercase">Owner</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-600 uppercase">Plan</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-600 uppercase">Joined</th>
                <th className="p-4 text-right text-xs font-semibold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredBusinesses.map((b) => (
                <tr key={b.id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="p-4 text-sm font-medium text-slate-900">{b.name}</td>
                  <td className="p-4 text-sm text-slate-600">{b.owner_email}</td>
                  <td className="p-4 text-sm text-slate-600 capitalize">{b.plan || "Free"}</td>
                  <td className="p-4 text-sm">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    {formatDate(b.created_at)}
                  </td>
                  <td className="p-4 text-right relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === b.id ? null : b.id)}
                      className="inline-flex items-center justify-center w-8 h-8 text-slate-500 border border-slate-200 rounded hover:bg-white transition-all shadow-sm"
                    >
                      ⋮
                    </button>

                    {openMenu === b.id && (
                      <div 
                        ref={menuRef} 
                        className="absolute right-4 mt-2 w-52 bg-white border border-slate-200 rounded-md shadow-xl z-[100] py-1 text-slate-700"
                      >
                        <button onClick={() => openDashboard(b.id)} className="block w-full text-left px-4 py-2 hover:bg-slate-100 text-sm">Open Dashboard</button>
                        <button onClick={() => openReceipts(b.id)} className="block w-full text-left px-4 py-2 hover:bg-slate-100 text-sm">View Receipts</button>
                        <button onClick={() => openDB(b.id)} className="block w-full text-left px-4 py-2 hover:bg-slate-100 text-sm">Database</button>
                        <div className="border-t border-slate-100 my-1"></div>
                        <button onClick={() => resetPassword(b.id)} className="block w-full text-left px-4 py-2 hover:bg-slate-100 text-sm text-blue-600 font-medium">Reset Password</button>
                        <button onClick={() => deactivateBusiness(b.id)} className="block w-full text-left px-4 py-2 text-orange-600 hover:bg-orange-50 text-sm font-medium">Deactivate</button>
                        <button onClick={() => confirmDelete(b.id)} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-sm font-medium">Delete Business</button>
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
