import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "@/lib/adminApi";

type Business = {
  id: string;
  name: string;
  owner_email: string;
  plan?: string;
  status?: string;
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

  // ---------- SEARCH (Memoized for performance) ----------
  const filteredBusinesses = useMemo(() => {
    const query = search.toLowerCase();
    return businesses.filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.owner_email.toLowerCase().includes(query)
    );
  }, [search, businesses]);

  // ---------- HELPER: Sync State & Cache ----------
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
    } catch (err) {
      alert("Reset failed");
    }
  };

  const deactivateBusiness = async (id: string) => {
    if (!confirm("Deactivate this business?")) return;
    try {
      await adminApi.deactivateBusiness(id);
      updateBusinessState(id, { status: "inactive" });
      setOpenMenu(null);
    } catch (err) {
      console.error("Deactivate failed", err);
    }
  };

  const confirmDelete = async (id: string) => {
    const password = prompt("Enter admin password to delete this business");
    if (!password) return;
    try {
      await adminApi.deleteBusiness(id, password);
      updateBusinessState(id, null);
      setOpenMenu(null);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">All Businesses</h1>
        <button onClick={() => navigate("/internal-admin")} className="px-4 py-2 border rounded hover:bg-gray-50">
          Back
        </button>
      </div>

      <input
        type="text"
        placeholder="Search business or owner email..."
        className="border rounded px-3 py-2 w-full max-w-md text-black focus:ring-2 focus:ring-blue-500 outline-none"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <p className="text-sm text-gray-500">
        Showing <b>{filteredBusinesses.length}</b> of {businesses.length} businesses
      </p>

      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 text-black border-b">
            <tr>
              <th className="p-3 text-left">Business</th>
              <th className="p-3 text-left">Owner</th>
              <th className="p-3 text-left">Plan</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBusinesses.map((b) => (
              <tr key={b.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{b.name}</td>
                <td className="p-3">{b.owner_email}</td>
                <td className="p-3 capitalize">{b.plan || "Free"}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${b.status === 'inactive' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {b.status || "active"}
                  </span>
                </td>
                <td className="p-3 text-right relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === b.id ? null : b.id)}
                    className="px-2 py-1 border rounded hover:bg-white"
                  >
                    ⋮
                  </button>

                  {openMenu === b.id && (
                    <div ref={menuRef} className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-xl z-50 text-sm py-1">
                      <button onClick={() => openDashboard(b.id)} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Open Dashboard</button>
                      <button onClick={() => openReceipts(b.id)} className="block w-full text-left px-4 py-2 hover:bg-gray-100">View Receipts</button>
                      <button onClick={() => openDB(b.id)} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Database</button>
                      <div className="border-t my-1"></div>
                      <button onClick={() => resetPassword(b.id)} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-blue-600">Reset Password</button>
                      <button onClick={() => deactivateBusiness(b.id)} className="block w-full text-left px-4 py-2 text-yellow-600 hover:bg-gray-100">Deactivate</button>
                      <button onClick={() => confirmDelete(b.id)} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Businesses;
