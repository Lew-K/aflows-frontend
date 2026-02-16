import { useEffect, useState } from "react";

interface RevenueSummary {
  totalRevenue: number;
  previousRevenue: number;
  percentageChange: number;
  trend: "up" | "down" | "neutral";
}

interface DailyRevenue {
  date: string;
  revenue: number;
}

interface TopSellingItem {
  item: string;
  metrics: {
    quantity: number;
    revenue: number;
  };
}

interface PaymentMethod {
  method: string;
  metrics: {
    revenue: number;
    transactionCount: number;
  };
  percentageOfRevenue: number;
  percentageOfTransactions: number;
}

export const useRevenueAnalytics = (
  businessId: string,
  period: string,
  customStart?: string,
  customEnd?: string,
  fetchKey?: number
) => {
  const [revenueSummary, setRevenueSummary] =
    useState<RevenueSummary | null>(null);
  const [dailyRevenue, setDailyRevenue] =
    useState<DailyRevenue[]>([]);
  const [topSellingItems, setTopSellingItems] =
    useState<TopSellingItem[]>([]);
  const [paymentMethods, setPaymentMethods] =
    useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!businessId) return;
    if (period === "custom" && (!customStart || !customEnd)) return;
  
    const fetchRevenue = async () => {
      setLoading(true);
  
      try {
        const url = new URL(
          "https://n8n.aflows.uk/webhook/revenue"
        );
  
        url.searchParams.append("businessId", businessId);
  
        if (period === "custom") {
          url.searchParams.append("start", customStart!);
          url.searchParams.append("end", customEnd!);
        } else {
          url.searchParams.append("period", period);
        }
  
        const accessToken = localStorage.getItem("access_token");

        const res = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

  
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
  
        const json = await res.json();
  
        // If n8n returns an array with one item
        const data = Array.isArray(json) ? json[0] : json;
  
        setRevenueSummary(data?.revenueSummary ?? null);
        setDailyRevenue(data?.dailyRevenue ?? []);
        setTopSellingItems(data?.topSellingItems ?? []);
        setPaymentMethods(data?.paymentMethods ?? []);
  
      } catch (err) {
        console.error("Revenue fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchRevenue();
  }, [businessId, period, customStart, customEnd, fetchKey]);


  

  // useEffect(() => {
  //   if (!businessId) return;

  //   // prevent firing incomplete custom
  //   if (period === "custom" && (!customStart || !customEnd)) {
  //     return;
  //   }

  //   const fetchRevenue = async () => {
  //     setLoading(true);

  //     try {
  //       const url = new URL(
  //         "https://n8n.aflows.uk/webhook/revenue"
  //       );

  //       url.searchParams.append("businessId", businessId);

  //       if (period === "custom") {
  //         url.searchParams.append("start", customStart!);
  //         url.searchParams.append("end", customEnd!);
  //       } else {
  //         url.searchParams.append("period", period);
  //       }

  //       const res = await fetch(url.toString());
  //       const json = await res.json();

  //       const data = json?.[0];

  //       setRevenueSummary(data?.revenueSummary ?? null);
  //       setDailyRevenue(data?.dailyRevenue ?? []);
  //       setTopSellingItems(data?.topSellingItems ?? []);
  //       setPaymentMethods(data?.paymentMethods ?? []);
  //     } catch (err) {
  //       console.error("Revenue fetch error:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchRevenue();
  // }, [businessId, period, customStart, customEnd, fetchKey]);

  return {
    revenueSummary,
    dailyRevenue,
    topSellingItems,
    paymentMethods,
    loading,
  };
};
