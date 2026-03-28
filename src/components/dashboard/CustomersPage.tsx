// CUSTOMERS PAGE WITH INLINE SIDE PANEL (PREMIUM UX)
import React, { useEffect, useMemo, useState } from "react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Users, Search, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerModal } from "../modals/CustomerModal"; // ← USE PANEL (NOT MODAL)

export const CustomersPage = () => {
  const { user } = useAuth();
  const { getSales, fetchSales, isFetching } = useData();

  const businessId = user?.businessId || "";

  useEffect(() => {
    if (!businessId) return;
    fetchSales(businessId, "all");
  }, [businessId]);

  const sales = getSales(businessId, "all");

  const getKey = (businessId, period) => `${businessId}-${period}`;
  const loading = isFetching(getKey(businessId, "all"));

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("total_spent");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(20);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const now = useMemo(() => new Date(), []);

  /* ---------------- AGGREGATION ---------------- */
  const customers = useMemo(() => {
    const map = new Map();

    sales.forEach((sale) => {
      if (!sale.customer_name) return;

      if (!map.has(sale.customer_name)) {
        map.set(sale.customer_name, {
          customer_name: sale.customer_name,
          total_spent: 0,
          transactions: 0,
          last_purchase: sale.created_at,
        });
      }

      const c = map.get(sale.customer_name);
      c.total_spent += Number(sale.amount);
      c.transactions += 1;

      if (new Date(sale.created_at) > new Date(c.last_purchase)) {
        c.last_purchase = sale.created_at;
      }
    });

    return Array.from(map.values());
  }, [sales]);

  /* ---------------- METRICS ---------------- */
  const totalRevenue = useMemo(
    () => sales.reduce((sum, s) => sum + Number(s.amount || 0), 0),
    [sales]
  );

  const repeatCustomers = customers.filter((c) => c.transactions > 1);
  const avgSpend = totalRevenue / (customers.length || 1);
  const repeatRate = (repeatCustomers.length / (customers.length || 1)) * 100;

  const activeThisMonth = customers.filter((c) => {
    const d = new Date(c.last_purchase);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  /* ---------------- SEGMENTATION ---------------- */
  const SEGMENT_DAYS = 30;
  const VIP_THRESHOLD = avgSpend * 2;

  const segmentedCustomers = customers.map((c) => {
    const last = new Date(c.last_purchase);
    const diffDays = (now - last) / (1000 * 60 * 60 * 24);

    let segment = "regular";

    if (c.total_spent >= VIP_THRESHOLD) segment = "vip";
    else if (diffDays > SEGMENT_DAYS) segment = "at_risk";

    return { ...c, segment };
  });

  /* ---------------- FILTER ---------------- */
  const processedCustomers = useMemo(() => {
    let filtered = segmentedCustomers.filter((c) =>
      c.customer_name.toLowerCase().includes(search.toLowerCase())
    );

    if (segmentFilter !== "all") {
      filtered = filtered.filter((c) => c.segment === segmentFilter);
    }

    if (sortBy === "transactions") {
      filtered.sort((a, b) => b.transactions - a.transactions);
    } else if (sortBy === "last_purchase") {
      filtered.sort((a, b) => new Date(b.last_purchase) - new Date(a.last_purchase));
    } else {
      filtered.sort((a, b) => b.total_spent - a.total_spent);
    }

    return filtered;
  }, [segmentedCustomers, search, sortBy, segmentFilter]);

  const paginatedCustomers = processedCustomers.slice(0, visibleCount);

  /* ---------------- CUSTOMER SALES ---------------- */
  const customerSales = useMemo(() => {
    if (!selectedCustomer) return [];

    return sales
      .filter((s) => s.customer_name === selectedCustomer.customer_name)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);
  }, [selectedCustomer, sales]);

  if (loading) {
    return <Skeleton className="h-40 w-full" />;
  }

  return (
    <div className="flex gap-6">
      {/* LEFT SIDE (MAIN PAGE) */}
      <div
        className={`
          transition-all duration-300 ease-in-out
          ${selectedCustomer ? "w-full lg:w-2/3" : "w-full"}
        `}
      >
        <div className="space-y-8">
          {/* HEADER */}
          <div>
            <h1 className="text-2xl font-bold">Customers</h1>
            <p className="text-sm text-muted-foreground">
              Monitor customer loyalty and spending habits.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {repeatCustomers.length} repeat customers generating {Math.round((repeatCustomers.reduce((s, c) => s + c.total_spent, 0) / (totalRevenue || 1)) * 100)}% of revenue
            </p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Total Customers" value={customers.length} icon={<Users />} />
            <KPICard title="Active This Month" value={activeThisMonth} icon={<Calendar />} />
            <KPICard title="Avg Spend" value={`KES ${Math.round(avgSpend).toLocaleString()}`} icon={<TrendingUp />} />
            <KPICard title="Repeat Rate" value={`${Math.round(repeatRate)}%`} icon={<TrendingUp />} />
          </div>

          {/* SEARCH */}
          <div className="sticky top-0 bg-background/80 backdrop-blur p-3 rounded-xl flex gap-3">
            <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {/* LIST */}
          <Card>
            <CardContent className="p-0">
              {paginatedCustomers.map((c, i) => (
                <div
                  key={c.customer_name}
                  onClick={() => setSelectedCustomer(c)}
                  className={`
                    p-4 flex justify-between cursor-pointer transition-colors
                    hover:bg-muted/40
                    ${selectedCustomer?.customer_name === c.customer_name ? "bg-muted" : ""}
                  `}
                >
                  <div>
                    <p className="font-semibold">#{i + 1} {c.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.transactions} orders • Last {new Date(c.last_purchase).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">KES {c.total_spent.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* LOAD MORE */}
          {visibleCount < processedCustomers.length && (
            <Button onClick={() => setVisibleCount((v) => v + 20)}>
              Load More
            </Button>
          )}
        </div>
      </div>

      {/* RIGHT SIDE PANEL */}
      {selectedCustomer && (
        <div className="hidden lg:block w-1/3 max-w-[420px]">
          <CustomerPanel
            customer={selectedCustomer}
            sales={customerSales}
            onClose={() => setSelectedCustomer(null)}
          />
        </div>
      )}
    </div>
  );
};

const KPICard = ({ title, value, icon }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex justify-between text-xs text-muted-foreground">
        {title} {icon}
      </div>
      <p className="text-xl font-bold">{value}</p>
    </CardContent>
  </Card>
);
