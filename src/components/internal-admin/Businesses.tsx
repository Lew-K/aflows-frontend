import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "@/lib/adminApi";
import axios from "axios";

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

const PAGE_SIZE = 20;

const Businesses = () => {
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [page, setPage] = useState(1);

  const [sortField, setSortField] = useState<keyof Business>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const menuRef = useRef<HTMLDivElement | null>(null);

  const toast = (msg: string) => {
    const el = document.createElement("div");
    el.innerText = msg;
    el.className =
      "fixed bottom-5 right-5 bg-black text-white px-4 py-2 rounded shadow-lg z-50";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  };

  // ---------- LOAD BUSINESSES ----------
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
      .catch(() => toast("Failed to load businesses"));

    return () => {
      isMounted = false;
    };
  }, []);

  // ---------- CLICK OUTSIDE ----------
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

  // ---------- SEARCH ----------
  const filteredBusinesses = useMemo(() => {
    const q = search.toLowerCase();

    return businesses.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.owner_email.toLowerCase().includes(q)
    );
  }, [search, businesses]);

  // ---------- SORT ----------
  const sortedBusinesses = useMemo(() => {
    const sorted = [...filteredBusinesses].sort((a, b) => {
      const aVal = (a[sortField] || "").toString();
      const bVal = (b[sortField] || "").toString();

      if (sortDirection === "asc") return aVal.localeCompare(bVal);
      return bVal.localeCompare(aVal);
    });

    return sorted;
  }, [filteredBusinesses, sortField, sortDirection]);

  // ---------- PAGINATION ----------
  const totalPages = Math.ceil(sortedBusinesses.length / PAGE_SIZE);

  const paginatedBusinesses = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedBusinesses.slice(start, start + PAGE_SIZE);
  }, [sortedBusinesses, page]);

  // ---------- SORT HANDLER ----------
  const toggleSort = (field: keyof Business) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // ---------- ACTIONS ----------

  const impersonateUser = async (business: Business) => {
    if (loadingId) return;

    try {
      setLoadingId(business.id);

      const res = await axios.post(WEBHOOKS.IMPERSONATE, {
        business_id: business.id,
        email: business.owner_email
      });

      if (res.data?.url) {
        window.open(res.data.url, "_blank", "noopener,noreferrer");
      }

      toast(`Impersonation started for ${business.name}`);
    } catch {
      toast("Impersonation failed");
    } finally {
      setLoadingId(null);
      setOpenMenu(null);
    }
  };

  const toggleActivation = async (business: Business) => {
    if (loadingId) return;

    const inactive = ["inactive", "deactivated"].includes(
      business.status?.toLowerCase() || ""
    );

    try {
      setLoadingId(business.id);

      await axios.post(WEBHOOKS.DEACTIVATE, {
        business_id: business.id,
        action: inactive ? "activate" : "deactivate"
      });

      updateBusinessState(business.id, {
        status: inactive ? "active" : "inactive"
      });

      toast(`Business ${inactive ? "activated" : "deactivated"}`);
    } catch {
      toast("Status update failed");
    } finally {
      setLoadingId(null);
      setOpenMenu(null);
    }
  };

  const confirmDelete = async (id: string) => {
    if (loadingId) return;

    const password = prompt("Enter admin password");

    if (!password) return;

    try {
      setLoadingId(id);

      await axios.post(WEBHOOKS.DELETE, {
        business_id: id,
        admin_password: password
      });

      updateBusinessState(id, null);

      toast("Business deleted");
    } catch {
      toast("Delete failed");
    } finally {
      setLoadingId(null);
      setOpenMenu(null);
    }
  };

  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        })
      : "-";

  // ---------- UI ----------
  return (
    <div className={`p-8 ${darkMode ? "bg-slate-900 text-white" : "bg-white"}`}>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Businesses</h1>

        <div className="flex gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="border px-3 py-2 rounded"
          >
            {darkMode ? "Light" : "Dark"}
          </button>

          <button
            onClick={() => navigate("/internal-admin")}
            className="border px-3 py-2 rounded"
          >
            Back
          </button>
        </div>
      </div>

      <input
        placeholder="Search businesses..."
        className="border px-3 py-2 rounded mb-6 w-full max-w-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="w-full border rounded overflow-hidden">
        <thead className="bg-slate-100 text-xs uppercase">
          <tr>
            <th onClick={() => toggleSort("name")} className="p-4 cursor-pointer">
              Business
            </th>
            <th onClick={() => toggleSort("owner_email")} className="p-4 cursor-pointer">
              Owner
            </th>
            <th onClick={() => toggleSort("status")} className="p-4 cursor-pointer">
              Status
            </th>
            <th onClick={() => toggleSort("created_at")} className="p-4 cursor-pointer">
              Joined
            </th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {paginatedBusinesses.map((b) => {
            const inactive = ["inactive", "deactivated"].includes(
              b.status?.toLowerCase() || ""
            );

            return (
              <tr key={b.id} className="border-t">
                <td className="p-4">{b.name}</td>
                <td className="p-4">{b.owner_email}</td>
                <td className="p-4 capitalize">{b.status}</td>
                <td className="p-4">{formatDate(b.created_at)}</td>

                <td className="p-4 text-right relative">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === b.id ? null : b.id)
                    }
                    className="border px-2 py-1 rounded"
                  >
                    ⋮
                  </button>

                  {openMenu === b.id && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 mt-2 w-52 bg-white border rounded shadow-xl"
                    >
                      <button
                        disabled={loadingId === b.id}
                        onClick={() => impersonateUser(b)}
                        className="block w-full px-4 py-2 text-left text-purple-600"
                      >
                        {loadingId === b.id ? "Loading..." : "Impersonate"}
                      </button>

                      <button
                        disabled={loadingId === b.id}
                        onClick={() => toggleActivation(b)}
                        className={`block w-full px-4 py-2 text-left ${
                          inactive ? "text-green-600" : "text-orange-600"
                        }`}
                      >
                        {loadingId === b.id
                          ? "Processing..."
                          : inactive
                          ? "Activate Business"
                          : "Deactivate Business"}
                      </button>

                      <button
                        disabled={loadingId === b.id}
                        onClick={() => confirmDelete(b.id)}
                        className="block w-full px-4 py-2 text-left text-red-600"
                      >
                        {loadingId === b.id ? "Deleting..." : "Delete Business"}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}

      <div className="flex justify-between mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="border px-3 py-1 rounded"
        >
          Previous
        </button>

        <span>
          Page {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="border px-3 py-1 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Businesses;
