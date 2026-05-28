import { useEffect } from "react";
import { useData } from "@/contexts/DataContext";

export const useInventory = (businessId: string) => {
  const { inventory, isFetching, fetchInventory, refreshInventory } = useData();

  useEffect(() => {
    if (!businessId) return;
    fetchInventory(businessId);
  }, [businessId]);

  const key = `${businessId}-inventory`;

  return {
    items: inventory,
    loading: isFetching(key),
    refresh: () => refreshInventory(businessId),
  };
};
