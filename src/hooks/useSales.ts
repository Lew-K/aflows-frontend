import { useEffect, useState } from 'react';
  
  type Sale = {
    id: string;
    amount: number;
    created_at: string;
  };

 export const useSales = (businessId: string, period: string) => {
  
   const [sales, setSales] = useState<Sale[]>([]);
      
   const [loading, setLoading] = useState(true);

   useEffect(() => {
     if (!businessId) return;

      const fetchSales = async () => {
        try {
          setLoading(true);
      
          const res = await fetch(
            `https://n8n.aflows.uk/webhook/get-sales?business_id=${businessId}&period=${period}`
          );
        
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
    }, [businessId, period]);
  
    return { sales, loading };
  };
