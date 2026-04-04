// CUSTOMERS PAGE WITH INLINE SIDE PANEL (PREMIUM UX)
import React, { useEffect, useMemo, useState } from "react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Users, Search, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerModal } from "./modals/CustomerModal"; // ← USE PANEL (NOT MODAL)

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

  const segmentStats = useMemo(() => {
    const stats = {
      vip: { count: 0, revenue: 0 },
      regular: { count: 0, revenue: 0 },
      at_risk: { count: 0, revenue: 0 },
    };

    segmentedCustomers.forEach((c) => {
      stats[c.segment].count++;
      stats[c.segment].revenue += c.total_spent;
    });

    return stats;
  }, [segmentedCustomers]);

  /* ---------------- TOP + AT RISK ---------------- */
  const topCustomers = [...segmentedCustomers]
    .sort((a, b) => b.total_spent - a.total_spent)
    .slice(0, 3);

  const atRiskCustomers = segmentedCustomers
    .filter((c) => c.segment === "at_risk")
    .slice(0, 5);

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
    <div className="flex h-full min-h-screen bg-background/50 gap-0">
      {/* LEFT SIDE (MAIN PAGE) */}
      <div
        className={`
          transition-all duration-500 ease-in-out p-6
          ${selectedCustomer ? "w-full lg:w-[60%] opacity-90 scale-[0.99] origin-left" : "w-full"}
        `}
      >
        <div className="max-w-6xl mx-auto space-y-8">
          {/* HEADER - Increased spacing and better typography */}
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Customers</h1>
              <p className="text-muted-foreground mt-1">
                {repeatCustomers.length} repeat customers driving {Math.round((repeatCustomers.reduce((s, c) => s + c.total_spent, 0) / (totalRevenue || 1)) * 100)}% of revenue.
              </p>
            </div>
          </div>

          {/* KPIs - Grid refinement */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
             {/* Using a custom variant for KPICards for more 'pop' */}
            <KPICard title="Total Customers" value={customers.length} icon={<Users className="w-4 h-4 text-blue-500" />} />
            <KPICard title="Active Month" value={activeThisMonth} icon={<Calendar className="w-4 h-4 text-green-500" />} />
            <KPICard title="Avg Spend" value={`KES ${Math.round(avgSpend).toLocaleString()}`} icon={<TrendingUp className="w-4 h-4 text-orange-500" />} />
            <KPICard title="Repeat Rate" value={`${Math.round(repeatRate)}%`} icon={<Users className="w-4 h-4 text-purple-500" />} />
          </div>

          {/* LIST SECTION - Better Search Bar styling */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-card p-2 rounded-lg border shadow-sm">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  className="pl-9 border-none bg-transparent focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Filter by:</span>
                <select 
                  value={segmentFilter} 
                  onChange={(e) => setSegmentFilter(e.target.value)}
                  className="bg-muted border-none text-sm rounded-md px-3 py-1.5 focus:ring-1 focus:ring-primary"
                >
                  <option value="all">All Segments</option>
                  <option value="vip">VIP</option>
                  <option value="regular">Regular</option>
                  <option value="at_risk">At Risk</option>
                </select>
              </div>
            </div>

            <Card className="border-none shadow-md overflow-hidden">
              <CardContent className="p-0 divide-y">
                {paginatedCustomers.map((c, i) => (
                  <div
                    key={c.customer_name}
                    onClick={() => setSelectedCustomer(c)}
                    className={`
                      p-5 flex justify-between items-center cursor-pointer transition-all
                      hover:bg-primary/5 group
                      ${selectedCustomer?.customer_name === c.customer_name ? "bg-primary/10 border-l-4 border-primary" : "border-l-4 border-transparent"}
                    `}
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                        {c.customer_name.substring(0,2).toUpperCase()}
                       </div>
                       <div>
                        <p className="font-semibold text-sm">{c.customer_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.transactions} orders <span className="mx-1">•</span> Last {new Date(c.last_purchase).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">KES {c.total_spent.toLocaleString()}</p>
                      <Badge variant="outline" className="text-[9px] uppercase">{c.segment}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE PANEL - Fixed positioning and height */}
      {selectedCustomer && (
        <div className="hidden lg:block w-[40%] max-w-[480px] sticky top-0 h-screen border-l bg-card shadow-2xl">
          <CustomerModal
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
