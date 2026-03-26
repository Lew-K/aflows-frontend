import React, { createContext, useContext, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";

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
  refreshCustomers: (businessId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: any) => {
  const inFlight = new Map<string, Promise<void>>();
  
  
  const [inventory, setInventory] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [salesCache, setSalesCache] = useState<Record<string, Sale[]>>({});
  const [lastFetched, setLastFetched] = useState<Record<string, number>>({});
  
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
    const res = await apiFetch(
      `https://n8n.aflows.uk/webhook/inventory?businessId=${businessId}`
    );
    const data = await res.json();
    setInventory(data?.items || []);
  };

  // CUSTOMERS
  const fetchCustomers = async (businessId: string) => {
    const res = await apiFetch(`/api/customers?businessId=${businessId}`);
    const data = await res.json();
    setCustomers(data || []);
  };

  // SALES (🔥 cache + loading safe)
  const fetchSales = async (
    businessId: string,
    period: string = "today",
    start?: string,
    end?: string
  ) => {

    const STALE_TIME = 1000 * 60 * 5; // 5 minutes

    const isStale =
      !lastFetched[key] ||
      Date.now() - lastFetched[key] > STALE_TIME;
    
    // ✅ if data exists AND not stale → skip
    if (salesCache[key] && !isStale) return;
    
    const key = getKey(businessId, period, start, end);
  
    // // ✅ Already cached → skip
    // if (salesCache[key]) return;
  
    // ✅ Already fetching → reuse same promise
    if (inFlight.has(key)) {
      return inFlight.get(key);
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
        inFlight.delete(key);
      }
    })();
  
    inFlight.set(key, promise);
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
        fetchCustomers(businessId),
        fetchSales(businessId, "this_month"),
        fetchRevenueAnalytics(businessId, "this_month"),
        fetchRevenue(businessId),
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

  const refreshInventory = async (businessId: string) => {
    await fetchInventory(businessId);
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
        refreshCustomers,
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
