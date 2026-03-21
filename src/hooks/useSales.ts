import { useEffect, useState } from "react";
import { useData } from "@/contexts/DataContext";

type Sale = {
  id: string;
  amount: number;
  created_at: string;
  receipt_id?: string | null;
  receipt_number?: string | null;
};

export const useSales = (
  businessId: string,
  period: string,
  start?: string,
  end?: string
) => {
  const { getSales, fetchSales, isFetching } = useData();

  const [sales, setSales] = useState<Sale[]>([]);

  const key = `${businessId}-${period}-${start || ""}-${end || ""}`;

  useEffect(() => {
    if (!businessId) return;
    if (period === "custom" && (!start || !end)) return;

    const run = async () => {
      await fetchSales(businessId, period, start, end);

      const data = getSales(businessId, period, start, end);
      setSales(data);
    };

    run();
  }, [businessId, period, start, end]);

  return {
    sales,
    loading: isFetching(key),
  };
};
