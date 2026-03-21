import React, { createContext, useContext, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";

interface DataContextType {
  inventory: any[];
  customers: any[];
  sales: any[];
  revenue: any;

  loading: boolean;

  prefetchAll: (businessId: string) => Promise<void>;
  refreshInventory: (businessId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: any) => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  const fetchInventory = async (businessId: string) => {
    const res = await apiFetch(
      `https://n8n.aflows.uk/webhook/inventory?businessId=${businessId}`
    );
    const data = await res.json();
    setInventory(data?.items || []);
  };

  const fetchCustomers = async (businessId: string) => {
    const res = await apiFetch(`/api/customers?businessId=${businessId}`);
    const data = await res.json();
    setCustomers(data || []);
  };

  const fetchSales = async (businessId: string) => {
    const url = new URL(`https://n8n.aflows.uk/webhook/get-sales`);
    url.searchParams.append("business_id", businessId);
    url.searchParams.append("period", "today");

    const res = await apiFetch(url.toString());
    const data = await res.json();

    const mapped = (data?.sales?.sales || []).map((s: any) => ({
      ...s,
      amount: Number(s.total_amount ?? 0),
    }));

    setSales(mapped);
  };

  const fetchRevenue = async (businessId: string) => {
    const url = new URL(`https://n8n.aflows.uk/webhook/revenue`);
    url.searchParams.append("businessId", businessId);
    url.searchParams.append("period", "today");

    const res = await apiFetch(url.toString());
    const data = await res.json();

    setRevenue(Array.isArray(data) ? data[0] : data);
  };

  // 🚀 MAIN PREFETCH FUNCTION
  const prefetchAll = async (businessId: string) => {
    setLoading(true);

    try {
      await Promise.all([
        fetchInventory(businessId),
        fetchCustomers(businessId),
        fetchSales(businessId),
        fetchRevenue(businessId),
      ]);
    } catch (err) {
      console.error("Prefetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshInventory = async (businessId: string) => {
    await fetchInventory(businessId);
  };

  return (
    <DataContext.Provider
      value={{
        inventory,
        customers,
        sales,
        revenue,
        loading,
        prefetchAll,
        refreshInventory,
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
