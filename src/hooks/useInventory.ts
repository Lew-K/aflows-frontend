import { useEffect, useState } from "react";

export const useInventory = (businessId: string) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    setLoading(true);

    const res = await fetch(`/api/inventory?businessId=${businessId}`);
    const data = await res.json();

    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    if (businessId) fetchInventory();
  }, [businessId]);

  return { items, loading, refresh: fetchInventory };
};
