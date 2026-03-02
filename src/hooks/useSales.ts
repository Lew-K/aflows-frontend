import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';

type Sale = {
  id: string;
  amount: number; // we keep this internally
  created_at: string;
  receipt_id?: string | null;
  receipt_number?: string | null;
};

export const useSales = (
  businessId: string,
  period: string,
  start?: string,
  end?: string,
  fetchKey?: number
) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) return;

    const fetchSales = async () => {
      try {
        setLoading(true);

        const url = new URL(
          `https://n8n.aflows.uk/webhook/get-sales`
        );

        url.searchParams.append('business_id', businessId);
        url.searchParams.append('period', period);

        if (period === 'custom' && start && end) {
          url.searchParams.append('start', start);
          url.searchParams.append('end', end);
        }

        const res = await apiFetch(url.toString());
        const data = await res.json();

        const rawSales = data?.sales?.sales || [];

        // 🔥 Map total_amount → amount safely
        const mappedSales: Sale[] = rawSales.map((sale: any) => ({
          ...sale,
          amount: Number(sale.total_amount ?? sale.amount ?? 0),
        }));

        setSales(mappedSales);

      } catch (err) {
        console.error('Sales fetch error:', err);
        setSales([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [businessId, period, start, end, fetchKey]);

  return { sales, loading };
};
