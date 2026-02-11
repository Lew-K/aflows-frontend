import { useEffect, useState } from 'react';
  
  type Sale = {
    id: string;
    amount: number;
    created_at: string;
  };

  export const useSales = (businessId: string, period: string = 'week') => {

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
          throw new Error('Failed to fetch sales');
        }
    
        const data = await res.json();
        setSales(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching sales:', error);
        setSales([]);
      } finally {
        setLoading(false);
      }
    };

      fetchSales();
    }, [businessId, period]);
  
    return { sales, loading };
  };


//     const fetchSales = async () => {
//       setLoading(true);
//       const res = await fetch(
//         `https://n8n.aflows.uk/webhook/get-sales?business_id=${businessId}&period=${period}`
//       );
//       const data = await res.json();
//       setSales(data);
//       setLoading(false);
//     };

//     fetchSales();
//   }, [businessId, period]);

//   return { sales, loading };
// };
