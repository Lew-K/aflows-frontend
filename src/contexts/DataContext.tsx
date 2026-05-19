import React, { createContext, useContext, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { useRef } from "react";
import { useNotifications } from '@/contexts/NotificationContext';


// 🔥 Minimal useful types
type Sale = {
  amount: number;
  created_at: string;
};

interface RevenueAnalytics {
  revenueSummary: any;
  dailyRevenue: any[];
  monthlyRevenue: any[];
  topSellingItems: any[];
  paymentMethods: any[];
}

interface Business {
  business_id: string;
  business_name: string;
  phone: string;
  location?: string;
  logo_url?: string;
  receipt_prefix?: string;
  receipt_footer?: string;
  tax_rate?: string | number;
  discount_type?: "percentage" | "fixed";
  discount_value?: string | number;
  subscription_tier?: 'starter' | 'growth' | 'pro';
  subscription_status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  trial_ends_at?: string | null;
}

interface DataContextType {
  inventory: any[];
  customers: any[];

  // SALES
  getSales: (
    businessId: string,
    period: string,
    start?: string,
    end?: string
  ) => Sale[];

  fetchSales: (
    businessId: string,
    period: string,
    start?: string,
    end?: string
  ) => Promise<void>;

  // ANALYTICS
  getRevenueAnalytics: (
    businessId: string,
    period: string,
    start?: string,
    end?: string
  ) => RevenueAnalytics;

  fetchRevenueAnalytics: (
    businessId: string,
    period: string,
    start?: string,
    end?: string
  ) => Promise<void>;

  // 🔥 per-key loading
  isFetching: (key: string) => boolean;

  revenue: any;
  loading: boolean;

  prefetchAll: (businessId: string) => Promise<void>;
  refreshInventory: (businessId: string) => Promise<void>;
  fetchInventory: (businessId: string) => Promise<void>;
  refreshBusiness: (businessId: string) => Promise<void>;
  refreshCustomers: (businessId: string) => Promise<void>;
  refreshSales: (businessId: string, period: string, start?: string, end?: string) => Promise<void>;
  business: Business | null;
  fetchBusiness: (businessId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);


export const DataProvider = ({ children }: any) => {

  const { addNotification } = useNotifications();

  const inFlight = useRef(new Map<string, Promise<void>>());
  
  
  const [inventory, setInventory] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [salesCache, setSalesCache] = useState<Record<string, Sale[]>>({});
  const [lastFetched, setLastFetched] = useState<Record<string, number>>({});
  const [business, setBusiness] = useState<Business | null>(null);
  
  
  const [analyticsCache, setAnalyticsCache] = useState<
    Record<string, RevenueAnalytics>
  >({});
  const [fetchingKeys, setFetchingKeys] = useState<Record<string, boolean>>({});
  const [revenue, setRevenue] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  // 🔑 cache key
  const getKey = (
    businessId: string,
    period: string,
    start?: string,
    end?: string
  ) => {
    return `${businessId}-${period}-${start || ""}-${end || ""}`;
  };

  // INVENTORY
  const fetchInventory = async (businessId: string) => {
    const key = `${businessId}-inventory`;
  
    // Skip if already fetching
    if (fetchingKeys[key]) return;
  
    // Skip if data is fresh (within 5 minutes)
    const STALE_TIME = 1000 * 60 * 5;
    const isStale = !lastFetched[key] || Date.now() - lastFetched[key] > STALE_TIME;
    if (inventory.length > 0 && !isStale) return;
  
    setFetchingKeys((prev) => ({ ...prev, [key]: true }));
  
    try {
      const res = await apiFetch(
        `https://n8n.aflows.uk/webhook/inventory?businessId=${businessId}`
      );
      const data = await res.json();
      const items = data?.items || [];
      setInventory(items);
  
      const activeItems = items.filter((item: any) => item.last_movement !== null);
  
      const STOCK_NOTIF_KEY = 'stock_notifications_last_fired';
      const TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24;
      const lastFiredRaw = localStorage.getItem(STOCK_NOTIF_KEY);
      const lastFired = lastFiredRaw ? parseInt(lastFiredRaw, 10) : 0;
      const shouldNotify = Date.now() - lastFired > TWENTY_FOUR_HOURS;
  
      if (shouldNotify) {
        const outOfStock = activeItems.filter((item: any) => item.stock <= 0);
        const lowStock = activeItems.filter(
          (item: any) => item.stock > 0 && item.stock <= item.low_stock_threshold
        );
  
        if (outOfStock.length > 0) {
          const names = outOfStock.slice(0, 3).map((i: any) => i.name).join(', ');
          const extra = outOfStock.length > 3 ? ` and ${outOfStock.length - 3} more` : '';
          addNotification(
            'error',
            `${outOfStock.length} item${outOfStock.length > 1 ? 's' : ''} out of stock`,
            `${names}${extra} need restocking immediately.`
          );
        }
  
        if (lowStock.length > 0) {
          const names = lowStock.slice(0, 3).map((i: any) => i.name).join(', ');
          const extra = lowStock.length > 3 ? ` and ${lowStock.length - 3} more` : '';
          addNotification(
            'warning',
            `${lowStock.length} item${lowStock.length > 1 ? 's' : ''} running low`,
            `${names}${extra} are below their stock threshold.`
          );
        }
  
        if (outOfStock.length > 0 || lowStock.length > 0) {
          localStorage.setItem(STOCK_NOTIF_KEY, Date.now().toString());
        }
      }
    } catch (err) {
      console.error("Inventory fetch error:", err);
    } finally {
      setFetchingKeys((prev) => ({ ...prev, [key]: false }));
      setLastFetched((prev) => ({ ...prev, [key]: Date.now() }));
    }
  };
  // CUSTOMERS
  const fetchCustomers = async (businessId: string) => {
    const res = await apiFetch(`/api/customers?businessId=${businessId}`);
    const data = await res.json();
    setCustomers(data || []);
  };

  // BUSINESS
  const fetchBusiness = async (businessId: string) => {
    const res = await apiFetch(
      `https://n8n.aflows.uk/webhook/business-settings?businessId=${businessId}`
    );
    const data = await res.json();
    const result = Array.isArray(data) ? data[0] : data;
    if (result?.success) {
      setBusiness(result);
    }
  };
 
  
  // SALES (🔥 cache + loading safe)
  const fetchSales = async (
    businessId: string,
    period: string = "today",
    start?: string,
    end?: string
  ) => {

    const key = getKey(businessId, period, start, end);

    const STALE_TIME = 1000 * 60 * 5; // 5 minutes

    const isStale =
      !lastFetched[key] ||
      Date.now() - lastFetched[key] > STALE_TIME;
    
    // ✅ if data exists AND not stale → skip
    const existing = salesCache[key];

    if (existing && !isStale) return;
    
    
  
    // // ✅ Already cached → skip
    // if (salesCache[key]) return;
  
    // ✅ Already fetching → reuse same promise
    if (inFlight.current.has(key)) {
      return inFlight.current.get(key);
    }
  
    const promise = (async () => {
      setFetchingKeys((prev) => ({ ...prev, [key]: true }));
  
      try {
        const url = new URL(`https://n8n.aflows.uk/webhook/get-sales`);
        url.searchParams.append("business_id", businessId);
        url.searchParams.append("period", period);
  
        if (period === "custom" && start && end) {
          url.searchParams.append("start", start);
          url.searchParams.append("end", end);
        }
  
        const res = await apiFetch(url.toString());
        const data = await res.json();
  
        const mapped: Sale[] = (data?.sales?.sales || []).map((s: any) => ({
          ...s,
          amount: Number(s.total_amount ?? 0),
        }));
  
        setSalesCache((prev) => ({
          ...prev,
          [key]: mapped,
        }));

        setLastFetched((prev) => ({
          ...prev,
          [key]: Date.now(),
        }));
      } catch (err) {
        console.error("Sales fetch error:", err);
      } finally {
        setFetchingKeys((prev) => ({ ...prev, [key]: false }));
        inFlight.current.delete(key);
      }
    })();
  
    inFlight.current.set(key, promise);
    return promise;
  };

  // ANALYTICS (🔥 cache + loading safe)
  const fetchRevenueAnalytics = async (
    businessId: string,
    period: string = "month",
    start?: string,
    end?: string
  ) => {
    const key = getKey(businessId, period, start, end);

    if (analyticsCache[key]) return;

    setFetchingKeys((prev) => ({ ...prev, [key]: true }));

    try {
      const url = new URL(`https://n8n.aflows.uk/webhook/revenue`);
      url.searchParams.append("businessId", businessId);

      if (period === "custom" && start && end) {
        url.searchParams.append("start", start);
        url.searchParams.append("end", end);
      } else {
        url.searchParams.append("period", period);
      }

      const res = await apiFetch(url.toString());
      const json = await res.json();

      const data = Array.isArray(json) ? json[0] : json;

      setAnalyticsCache((prev) => {
        if (prev[key]) return prev;

        return {
          ...prev,
          [key]: {
            revenueSummary: data?.revenueSummary ?? null,
            dailyRevenue: data?.dailyRevenue ?? [],
            monthlyRevenue: data?.monthlyRevenue ?? [],
            topSellingItems: data?.topSellingItems ?? [],
            paymentMethods: data?.paymentMethods ?? [],
          },
        };
      });
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setFetchingKeys((prev) => ({ ...prev, [key]: false }));
    }
  };

  // SIMPLE REVENUE (legacy)
  const fetchRevenue = async (businessId: string) => {
    const url = new URL(`https://n8n.aflows.uk/webhook/revenue`);
    url.searchParams.append("businessId", businessId);
    url.searchParams.append("period", "today");

    const res = await apiFetch(url.toString());
    const data = await res.json();

    setRevenue(Array.isArray(data) ? data[0] : data);
  };

  // PREFETCH
  const prefetchAll = async (businessId: string) => {
    setLoading(true);

    try {
      await Promise.all([
        fetchInventory(businessId),
        fetchSales(businessId, "this_month"),
        fetchRevenueAnalytics(businessId, "this_month"),
        fetchRevenue(businessId),
        fetchBusiness(businessId),
      ]);
    } catch (err) {
      console.error("Prefetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // GETTERS
  const getSales = (
    businessId: string,
    period: string,
    start?: string,
    end?: string
  ) => {
    const key = getKey(businessId, period, start, end);
    return salesCache[key] || [];
  };

  const getRevenueAnalytics = (
    businessId: string,
    period: string,
    start?: string,
    end?: string
  ): RevenueAnalytics => {
    const key = getKey(businessId, period, start, end);

    return (
      analyticsCache[key] || {
        revenueSummary: null,
        dailyRevenue: [],
        monthlyRevenue: [],
        topSellingItems: [],
        paymentMethods: [],
      }
    );
  };

  const isFetching = (key: string) => !!fetchingKeys[key];

  const refreshSales = async (
    businessId: string,
    period: string,
    start?: string,
    end?: string
  ) => {
    const key = getKey(businessId, period, start, end);
    setSalesCache((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setLastFetched((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    await fetchSales(businessId, period, start, end);
  };

  
  const refreshInventory = async (businessId: string) => {
    const key = `${businessId}-inventory`;
    setLastFetched((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setInventory([]);
    await fetchInventory(businessId);
  };
  const refreshBusiness = async (businessId: string) => {
    await fetchBusiness(businessId);
  };

  const refreshCustomers = async (businessId: string) => {
    await fetchCustomers(businessId);
  };

  return (
    <DataContext.Provider
      value={{
        inventory,
        customers,
        getSales,
        fetchSales,
        getRevenueAnalytics,
        fetchRevenueAnalytics,
        isFetching,
        revenue,
        loading,
        prefetchAll,
        refreshInventory,
        refreshBusiness,
        refreshCustomers,
        refreshSales,
        fetchInventory,
        business,
        fetchBusiness,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
};
