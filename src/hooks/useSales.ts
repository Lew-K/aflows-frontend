import { useEffect, useState } from 'react';

export const useSales = (
  businessId: string,
  period: string,
  start?: string,
  end?: string
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

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
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
  }, [businessId, period, start, end, fetchKey]); // added fetchKey

  return { sales, loading };
};

  
 //  type Sale = {
 //    id: string;
 //    amount: number;
 //    created_at: string;
 //  };

 // export const useSales = (businessId: string, period: string) => {
  
 //   const [sales, setSales] = useState<Sale[]>([]);
      
 //   const [loading, setLoading] = useState(true);

 //   useEffect(() => {
 //     if (!businessId) return;

 //      const fetchSales = async () => {
 //        try {
 //          setLoading(true);
      
 //          const res = await fetch(
 //            `https://n8n.aflows.uk/webhook/get-sales?business_id=${businessId}&period=${period}`
 //          );
        
 //          if (!res.ok) {
 //            throw new Error(`HTTP error ${res.status}`);
 //          }
  
 //          const data = await res.json();

 //          setSales(data?.sales?.sales || []);
  
 //        } catch (err) {
 //          console.error('Sales fetch error:', err);
 //          setSales([]);
 //        } finally {
 //          setLoading(false);
 //        }
 //      };
  
 //      fetchSales();
 //    }, [businessId, period]);
  
 //    return { sales, loading };
 //  };
