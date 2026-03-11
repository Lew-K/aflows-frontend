import { useEffect, useState } from "react";

export const useCustomers = (businessId: string) => {

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {

    const res = await fetch(`/api/customers?businessId=${businessId}`);
    const data = await res.json();

    setCustomers(data);
    setLoading(false);
  };

  useEffect(() => {
    if (businessId) fetchCustomers();
  }, [businessId]);

  return { customers, loading };

};
