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
          `https://n8n.aflows.uk/webhook/get-sales`
        );
        url.searchParams.append('business_id', businessId);
        url.searchParams.append('period', period);

        // Add custom dates if period === 'custom'
        if (period === 'custom' && start && end) {
          url.searchParams.append('start', start);
          url.searchParams.append('end', end);
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
        
        const data = await res.json();

        setSales(data?.sales?.sales || []);
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

