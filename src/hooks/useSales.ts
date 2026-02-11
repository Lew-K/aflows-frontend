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
            'https://n8n.aflows.uk/webhook/get-sales'
          );
  
          url.searchParams.append('business_id', businessId);
          url.searchParams.append('period', period);
  
          if (start) url.searchParams.append('start', start);
          if (end) url.searchParams.append('end', end);
  
          const res = await fetch(url.toString());
  
          if (!res.ok) {
            throw new Error(`HTTP error ${res.status}`);
          }
  
          const data = await res.json();
  
          setSales(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error('Sales fetch error:', err);
          setSales([]);
        } finally {
          setLoading(false);
        }
      };
  
      fetchSales();
    }, [businessId, period, start, end]);
  
    return { sales, loading };
  };
          
          
          
          
      //     const res = await fetch(
      //       `https://n8n.aflows.uk/webhook/get-sales?business_id=${businessId}&period=${period}`
      //     );
      
      //     if (!res.ok) {
      //       throw new Error('Failed to fetch sales');
      //     }
      
      //     const text = await res.text();
      
      //     try {
      //       const data = JSON.parse(text);
      //       setSales(Array.isArray(data) ? data : []);
      //     } catch {
      //       console.error('Invalid JSON returned:', text);
      //       setSales([]);
      //     }
      
      //   } catch (err) {
      //     console.error('Sales fetch error:', err);
      //     setSales([]);
      //   } finally {
      //     setLoading(false);
      //   }
      // };
        

  //       setLoading(true);
  //       try {
  //         const url = new URL('https://n8n.aflows.uk/webhook/get-sales');
  //         url.searchParams.append('business_id', businessId);
  //         url.searchParams.append('period', period);
  //         if (start) url.searchParams.append('start', start);
  //         if (end) url.searchParams.append('end', end);
  
  //         const res = await fetch(url.toString());
  //         const text = await res.text();
  //         let data = [];
  //         try {
  //           data = JSON.parse(text);
  //         } catch {
  //           console.error('Invalid JSON response:', text);
  //         }
  
  //         setSales(data.sales ?? data ?? []);
  //       } catch (err) {
  //         console.error('Failed to fetch sales:', err);
  //         setSales([]);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };
  
  //     fetchSales();
  //   }, [businessId, period, start, end]);
  
  //   return { sales, loading };
  // };

        
  //       try {
  //         setLoading(true);
      
  //         const res = await fetch(
  //           `https://n8n.aflows.uk/webhook/get-sales?business_id=${businessId}&period=${period}`
  //         );
      
  //         if (!res.ok) {
  //           throw new Error('Failed to fetch sales');
  //         }
      
  //         const data = await res.json();
  //         setSales(Array.isArray(data) ? data : []);
  //       } catch (error) {
  //         console.error('Error fetching sales:', error);
  //         setSales([]);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     fetchSales();
  //   }, [businessId, period]);
  
  //   return { sales, loading };
  // };


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
