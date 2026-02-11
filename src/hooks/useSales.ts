import { useEffect, useState } from 'react';

type Sale = {
  id: string;
  amount: number;
  created_at: string;
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
          'https://n8n.aflows.uk/webhook/get-sales'
        );

        url.searchParams.append('business_id', businessId);
        url.searchParams.append('period', period);

        if (period === 'custom' && start && end) {
          url.searchParams.append('start', start);
          url.searchParams.append('end', end);
        }

        const res = await fetch(url.toString());

        if (!res.ok) throw new Error('Failed to fetch sales');

        const data = await res.json();

        setSales(Array.isArray(data) ? data : data.sales ?? []);
      } catch (err) {
        console.error('Sales fetch error:', err);
        setSales([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch for custom when Apply is clicked
    if (period === 'custom' && !fetchKey) return;

    fetchSales();
  }, [businessId, period, start, end, fetchKey]);

  return { sales, loading };
};
