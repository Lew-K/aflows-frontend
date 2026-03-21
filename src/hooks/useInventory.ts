import { useEffect, useState } from "react";

export const useInventory = (businessId: string) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    setLoading(true);
  
    try {
      const res = await fetch(
        `https://n8n.aflows.uk/webhook/inventory?businessId=${businessId}`
      );
  
      const data = await res.json();
  
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      setItems([]);
    } finally {
      setLoading(false); // 🚨 ensures no infinite loading
    }
  };

  useEffect(() => {
    if (businessId) fetchInventory();
  }, [businessId]);

  return { items, loading, refresh: fetchInventory };
};
