import { useEffect, useState } from "react";
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

  const [data, setData] = useState({
    revenueSummary: null,
    dailyRevenue: [],
    topSellingItems: [],
    paymentMethods: [],
  });

  const key = `${businessId}-${period}-${customStart || ""}-${customEnd || ""}`;

  useEffect(() => {
    if (!businessId) return;
    if (period === "custom" && (!customStart || !customEnd)) return;

    const run = async () => {
      await fetchRevenueAnalytics(
        businessId,
        period,
        customStart,
        customEnd
      );

      const res = getRevenueAnalytics(
        businessId,
        period,
        customStart,
        customEnd
      );

      setData(res);
    };

    run();
  }, [businessId, period, customStart, customEnd]);

  return {
    ...data,
    loading: isFetching(key),
  };
};
