import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "@/lib/adminApi";
import { useAuth } from "@/contexts/AuthContext";

import {
  ArrowLeft,
  Building2,
  MoreVertical,
  Moon,
  Search,
  Sun,
  Shield,
  Database,
  Receipt,
  UserCog,
  Trash2,
  Power,
  Eye,
  RefreshCw,
} from "lucide-react";

type Business = {
  id: string;
  name: string;
  owner_email: string;
  business_owner?: string;
  phone?: string;

  status?: string;
  created_at?: string;

  subscription_tier?: string;
  subscription_status?: string;

  trial_ends_at?: string | null;
  current_period_end?: string | null;
};

const Businesses = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("admin_theme") === "dark";
  });

  const menuRef = useRef<HTMLDivElement | null>(null);

  // ---------- LOAD ----------
  useEffect(() => {
    let isMounted = true;

    const cached = sessionStorage.getItem("admin_businesses");

    if (cached) {
      setBusinesses(JSON.parse(cached));
    }

    adminApi
      .getBusinesses()
      .then((data) => {
        if (!isMounted) return;

        const list = data.businesses || [];

        setBusinesses(list);

        sessionStorage.setItem(
          "admin_businesses",
          JSON.stringify(list)
        );
      })
      .catch((err) => {
        console.error("Failed to load businesses", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // ---------- THEME ----------
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);

    localStorage.setItem(
      "admin_theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  // ---------- CLICK OUTSIDE ----------
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
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

  const isOverdue = (business: Business) => {
    if (!business.current_period_end) return false;
  
    const endDate = new Date(business.current_period_end);
    const now = new Date();
  
    return endDate < now;
  };
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  const updateBusinessState = (
    id: string,
    updates: Partial<Business> | null
  ) => {
    setBusinesses((prev) => {
      const newList = updates
        ? prev.map((b) =>
            b.id === id
              ? { ...b, ...updates }
              : b
          )
        : prev.filter((b) => b.id !== id);

      sessionStorage.setItem(
        "admin_businesses",
        JSON.stringify(newList)
      );

      return newList;
    });
  };

  // ---------- ACTIONS ----------
  const openDashboard = (id: string) =>
    window.open(
      `/dashboard?business_id=${id}`,
      "_blank"
    );

  const openReceipts = (id: string) =>
    window.open(
      `/internal-admin/business/${id}/receipts`,
      "_blank"
    );

  const openDB = (id: string) =>
    window.open(
      `/internal-admin/db/${id}`,
      "_blank"
    );

  const impersonateUser = async (id: string) => {
    const adminPassword = prompt(
      "Enter admin password to impersonate"
    );

    if (!adminPassword) return;

    try {
      const res = await adminApi.impersonate(
        id,
        adminPassword
      );

      const {
        access_token,
        refresh_token,
        user,
      } = res;

      if (!user?.businessId) {
        throw new Error("Invalid response");
      }

      login(access_token, refresh_token, {
        businessId: user.businessId,
        businessName: user.businessName || "",
        ownerName: user.ownerName || "",
        email: user.email || "",
      });

      localStorage.setItem(
        "is_impersonating",
        "true"
      );

      window.location.href = `/dashboard?business_id=${user.businessId}`;
    } catch (err) {
      console.error(
        "Impersonation error:",
        err
      );

      alert("Impersonation failed");
    }
  };

  const resetPassword = async (id: string) => {
    const adminPassword = prompt(
      "Enter admin password"
    );

    if (!adminPassword) return;

    const newPassword = prompt(
      "Enter new password"
    );

    if (!newPassword) return;

    try {
      await adminApi.resetPassword(
        id,
        newPassword,
        adminPassword
      );

      alert("Password updated");

      setOpenMenu(null);
    } catch (err) {
      alert("Reset failed");
    }
  };

  const deactivateBusiness = async (
    id: string
  ) => {
    const adminPassword = prompt(
      "Enter admin password to deactivate"
    );

    if (!adminPassword) return;

    if (!confirm("Deactivate this business?"))
      return;

    try {
      await adminApi.deactivateBusiness(
        id,
        adminPassword
      );

      updateBusinessState(id, {
        status: "inactive",
      });

      setOpenMenu(null);
    } catch (err) {
      console.error(
        "Deactivate failed",
        err
      );
    }
  };

  const activateBusiness = async (
    id: string
  ) => {
    const adminPassword = prompt(
      "Enter admin password to activate"
    );

    if (!adminPassword) return;

    try {
      await adminApi.activateBusiness(
        id,
        adminPassword
      );

      updateBusinessState(id, {
        status: "active",
      });

      setOpenMenu(null);
    } catch (err) {
      console.error(
        "Activate failed",
        err
      );
    }
  };

  const confirmDelete = async (
    id: string
  ) => {
    const password = prompt(
      "Enter admin password to delete this business"
    );

    if (!password) return;

    try {
      await adminApi.deleteBusiness(
        id,
        password
      );

      updateBusinessState(id, null);

      setOpenMenu(null);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // ---------- STATUS ----------
  const StatusBadge = ({
    business,
  }: {
    business: Business;
  }) => {
    let s = business.status?.toLowerCase() || "active";
  
    // Billing overdue overrides status
    if (isOverdue(business)) {
      s = "overdue";
    }
  
    const styles: Record<string, string> = {
      active:
        "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900",
  
      inactive:
        "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
  
      overdue:
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900",
  
      deactivated:
        "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900",
    };
  
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
          styles[s] || styles.active
        }`}
      >
        <span className="h-2 w-2 rounded-full bg-current opacity-70" />
  
        {s.charAt(0).toUpperCase() +
          s.slice(1)}
      </span>
    );
  };

  // ---------- KPI ----------
  const stats = useMemo(() => {
    return [
      {
        label: "Total",
        value: businesses.length,
      },
      {
        label: "Active",
        value: businesses.filter(
          (b) => b.status === "active"
        ).length,
      },
      {
        label: "Inactive",
        value: businesses.filter(
          (b) => b.status === "inactive"
        ).length,
      },
      {
        label: "Overdue",
        value: businesses.filter((b) =>
          isOverdue(b)
        ).length,
      },
      {
        label: "Pro",
        value: businesses.filter(
          (b) => b.subscription_tier?.toLowerCase() === "pro"
        ).length,
      },
    ];
  }, [businesses]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <div className="max-w-[1800px] mx-auto p-4 md:p-8 space-y-8">

        {/* STICKY TOPBAR */}
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-50/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 shadow-sm">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">

            {/* LEFT */}
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                Business Operations
              </h1>

              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Manage platform businesses,
                subscriptions, access, and
                operational actions.
              </p>
            </div>

            {/* RIGHT */}
            <div className="flex flex-wrap items-center gap-3">

              {/* SEARCH */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />

                <input
                  type="text"
                  placeholder="Search business or owner..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="w-[280px] md:w-[340px] h-11 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                />
              </div>

              {/* REFRESH */}
              <button
                className="h-11 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>

              {/* DARK MODE */}
              <button
                onClick={() =>
                  setDarkMode(!darkMode)
                }
                className="h-11 w-11 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center justify-center"
              >
                {darkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>

              {/* BACK */}
              <button
                onClick={() =>
                  navigate("/internal-admin")
                }
                className="h-11 px-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 text-sm font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          </div>
        </div>

        {/* KPI STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
          {stats.map((card, i) => (
            <div
              key={i}
              className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm hover:shadow-xl transition-all"
            >
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {card.label}
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-tight">
                {card.value}
              </h2>
            </div>
          ))}
        </div>

        {/* TABLE SECTION */}
        <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">

          {/* HEADER */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">

            <div>
              <h2 className="text-2xl font-black">
                All Businesses
              </h2>

              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Showing{" "}
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {
                    filteredBusinesses.length
                  }
                </span>{" "}
                of {businesses.length} total
                businesses
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-950/30 px-4 py-2 text-sm font-semibold text-green-700 dark:text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Live Data
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="p-5 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Business
                  </th>

                  <th className="p-5 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Owner
                  </th>

                  <th className="p-5 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Plan
                  </th>

                  <th className="p-5 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Status
                  </th>

                  <th className="p-5 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Joined
                  </th>

                  <th className="p-5 text-right text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredBusinesses.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-all"
                  >

                    {/* BUSINESS */}
                    <td className="p-5">
                      <div className="flex items-center gap-4">

                        <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-sm shrink-0">
                          {b.name
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100">
                            {b.name}
                          </p>

                          <div className="flex items-center gap-2 mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            <Building2 className="w-3 h-3" />
                            Business Account
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* OWNER */}
                    <td className="p-5">
                      <div>
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          {b.owner_email}
                        </p>
                      
                        {b.business_owner && (
                          <p className="text-xs text-zinc-500 mt-1">
                            {b.business_owner}
                          </p>
                        )}
                      
                        {b.phone && (
                          <p className="text-xs text-zinc-400 mt-1">
                            {b.phone}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* PLAN */}
                    <td className="p-5">
                      {(() => {
                        const tier =
                          b.subscription_tier?.toLowerCase() ||
                          "free";
                      
                        const styles: Record<string, string> = {
                          free:
                            "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
                      
                          starter:
                            "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
                      
                          pro:
                            "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
                      
                          enterprise:
                            "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
                        };
                      
                        return (
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                              styles[tier] || styles.free
                            }`}
                          >
                            {tier}
                          </span>
                        );
                      })()}
                    </td>

                    {/* STATUS */}
                    <td className="p-5">
                      <StatusBadge business={b} />
                      
                      {b.current_period_end && (
                        <p className="text-xs text-zinc-500 mt-2">
                          Renews:{" "}
                          {formatDate(b.current_period_end)}
                        </p>
                      )}
                    </td>

                    {/* JOINED */}
                    <td className="p-5">
                      <div>
                        <p className="text-sm font-medium">
                          {formatDate(
                            b.created_at
                          )}
                        </p>

                        <p className="text-xs text-zinc-500 mt-1">
                          Registration Date
                        </p>
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="p-5 relative">
                      <div className="flex items-center justify-end gap-2">

                        {/* OPEN */}
                        <button
                          onClick={() =>
                            openDashboard(b.id)
                          }
                          className="h-10 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-semibold transition-all flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Open
                        </button>

                        {/* IMPERSONATE */}
                        <button
                          onClick={() =>
                            impersonateUser(
                              b.id
                            )
                          }
                          className="h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-all flex items-center gap-2"
                        >
                          <UserCog className="w-4 h-4" />
                          Login
                        </button>

                        {/* MENU */}
                        <button
                          onClick={() =>
                            setOpenMenu(
                              openMenu === b.id
                                ? null
                                : b.id
                            )
                          }
                          className="h-10 w-10 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-all"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* DROPDOWN */}
                        {openMenu === b.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-5 top-16 w-64 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden z-[100]"
                          >
                            <div className="p-2 space-y-1">

                              <button
                                onClick={() =>
                                  openDashboard(
                                    b.id
                                  )
                                }
                                className="w-full rounded-xl px-4 py-3 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium transition-all flex items-center gap-3"
                              >
                                <Eye className="w-4 h-4" />
                                Open Dashboard
                              </button>

                              <button
                                onClick={() =>
                                  openReceipts(
                                    b.id
                                  )
                                }
                                className="w-full rounded-xl px-4 py-3 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium transition-all flex items-center gap-3"
                              >
                                <Receipt className="w-4 h-4" />
                                View Receipts
                              </button>

                              <button
                                onClick={() =>
                                  openDB(b.id)
                                }
                                className="w-full rounded-xl px-4 py-3 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium transition-all flex items-center gap-3"
                              >
                                <Database className="w-4 h-4" />
                                Database
                              </button>

                              <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />

                              <button
                                onClick={() =>
                                  impersonateUser(
                                    b.id
                                  )
                                }
                                className="w-full rounded-xl px-4 py-3 text-left hover:bg-purple-50 dark:hover:bg-purple-950/20 text-purple-600 text-sm font-semibold transition-all flex items-center gap-3"
                              >
                                <Shield className="w-4 h-4" />
                                Impersonate User
                              </button>

                              <button
                                onClick={() =>
                                  resetPassword(
                                    b.id
                                  )
                                }
                                className="w-full rounded-xl px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-600 text-sm font-semibold transition-all flex items-center gap-3"
                              >
                                <UserCog className="w-4 h-4" />
                                Reset Password
                              </button>

                              {b.status ===
                              "inactive" ? (
                                <button
                                  onClick={() =>
                                    activateBusiness(
                                      b.id
                                    )
                                  }
                                  className="w-full rounded-xl px-4 py-3 text-left hover:bg-green-50 dark:hover:bg-green-950/20 text-green-600 text-sm font-semibold transition-all flex items-center gap-3"
                                >
                                  <Power className="w-4 h-4" />
                                  Activate Business
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    deactivateBusiness(
                                      b.id
                                    )
                                  }
                                  className="w-full rounded-xl px-4 py-3 text-left hover:bg-orange-50 dark:hover:bg-orange-950/20 text-orange-600 text-sm font-semibold transition-all flex items-center gap-3"
                                >
                                  <Power className="w-4 h-4" />
                                  Deactivate Business
                                </button>
                              )}

                              <button
                                onClick={() =>
                                  confirmDelete(
                                    b.id
                                  )
                                }
                                className="w-full rounded-xl px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 text-sm font-semibold transition-all flex items-center gap-3"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Business
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* EMPTY */}
          {filteredBusinesses.length ===
            0 && (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="h-20 w-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6">
                <Building2 className="w-8 h-8 text-zinc-400" />
              </div>

              <h3 className="text-2xl font-black">
                No businesses found
              </h3>

              <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-md">
                Try adjusting your search
                query or refresh the
                business list.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Businesses;
