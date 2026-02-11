export const useSales = (businessId: string, period: string) => {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) return;

    const fetchSales = async () => {
      setLoading(true);
      const res = await fetch(
        `https://n8n.aflows.uk/webhook/get-sales?business_id=${businessId}&period=${period}`
      );
      const data = await res.json();
      setSales(data);
      setLoading(false);
    };

    fetchSales();
  }, [businessId, period]);

  return { sales, loading };
};
