import { useEffect } from "react";
import { useData } from "@/contexts/DataContext";

export const useRevenueAnalytics = (
  businessId: string,
  period: string,
  customStart?: string,
  customEnd?: string
) => {
  const {
    getRevenueAnalytics,
    fetchRevenueAnalytics,
    isFetching,
  } = useData();

  const key = `${businessId}-${period}-${customStart || ""}-${customEnd || ""}`;

  const data = getRevenueAnalytics(
    businessId,
    period,
    customStart,
    customEnd
  );

  useEffect(() => {
    if (!businessId) return;
    if (period === "custom" && (!customStart || !customEnd)) return;

    fetchRevenueAnalytics(
      businessId,
      period,
      customStart,
      customEnd
    );
  }, [businessId, period, customStart, customEnd]);

  return {
    ...data,
    loading: isFetching(key),
  };
};
