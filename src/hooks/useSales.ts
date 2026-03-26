import { useEffect } from "react";
import { useData } from "@/contexts/DataContext";

export const useSales = (
  businessId: string,
  period: string,
  start?: string,
  end?: string
) => {
  const { getSales, fetchSales, isFetching } = useData();

  const key = `${businessId}-${period}-${start || ""}-${end || ""}`;

  const sales = getSales(businessId, period, start, end);

  useEffect(() => {
    if (!businessId) return;
    if (period === "custom" && (!start || !end)) return;

    fetchSales(businessId, period, start, end); // no await needed
  }, [businessId, period, start, end]);

  return {
    sales,
    loading: isFetching(key),
  };
};
