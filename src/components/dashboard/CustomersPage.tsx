import React, { useMemo, useState } from "react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input"; // Use UI components for consistency
import { Users, Search, TrendingUp, Calendar, ArrowUpDown, UserMinus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const CustomersPage = () => {
  const { user } = useAuth();
  const { getSales, fetchSales, isFetching } = useData();

  const businessId = user?.businessId || "";
  
  useEffect(() => {
    if (businessId) {
      fetchSales(businessId, "all");
    }
  }, [businessId]);
  
  const sales = getSales(businessId, "all");
  const loading = isFetching(`${businessId}-all--`);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("total_spent");
  const [visibleCount, setVisibleCount] = useState(20);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  /* ---------------- DATA AGGREGATION ---------------- */
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

  /* ---------------- KPI CALCULATIONS ---------------- */
  const totalCustomers = customers.length;
  const now = new Date();
  
  const activeThisMonth = useMemo(() => {
    return customers.filter((c) => {
      const d = new Date(c.last_purchase);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [customers]);

  const topCustomers = useMemo(() => {
    return [...customers]
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, 3);
  }, [customers]);

  /* ---------------- SEARCH & SORT ---------------- */
  const processedCustomers = useMemo(() => {
    let filtered = customers.filter((c) =>
      c.customer_name.toLowerCase().includes(search.toLowerCase())
    );

    if (sortBy === "transactions") {
      filtered.sort((a, b) => b.transactions - a.transactions);
    } else if (sortBy === "last_purchase") {
      filtered.sort((a, b) => new Date(b.last_purchase).getTime() - new Date(a.last_purchase).getTime());
    } else {
      filtered.sort((a, b) => b.total_spent - a.total_spent);
    }

    return filtered;
  }, [customers, search, sortBy]);

  const paginatedCustomers = processedCustomers.slice(0, visibleCount);

  /* ---------------- RENDER LOADING ---------------- */
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div className="flex items-center gap-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">Monitor customer loyalty and spending habits.</p>
        </div>
      </div>

      {/* KPI STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Customers" value={totalCustomers} icon={<Users className="w-4 h-4" />} />
        <KPICard title="Active This Month" value={activeThisMonth} icon={<Calendar className="w-4 h-4" />} />
        <KPICard title="Top Customer" value={topCustomers[0]?.customer_name || "-"} icon={<TrendingUp className="w-4 h-4" />} isText />
        <KPICard title="Revenue From Top" value={`KES ${topCustomers[0]?.total_spent?.toLocaleString() || "0"}`} icon={<ArrowUpDown className="w-4 h-4" />} isText />
      </div>

      {/* TOP CUSTOMERS SECTION */}
      {topCustomers.length > 0 && !search && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Leading Clients</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {topCustomers.map((c, index) => (
              <Card key={c.customer_name} className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-background to-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-sm">
                      {getInitials(c.customer_name)}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold truncate">{c.customer_name}</p>
                      <Badge variant="secondary" className="text-[10px] h-5">
                        RANK #{index + 1}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Total Spent</p>
                      <p className="text-lg font-bold">KES {c.total_spent.toLocaleString()}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.transactions} transactions</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* SEARCH + SORT CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Find a customer..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
           <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Sort by:</span>
           <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-background border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="total_spent">High Spending</option>
            <option value="transactions">Frequency</option>
            <option value="last_purchase">Recent Activity</option>
          </select>
        </div>
      </div>

      {/* CUSTOMER LIST */}
      <Card>
        <CardContent className="p-0">
          {processedCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserMinus className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
              <p className="text-lg font-medium">No customers found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="divide-y">
              {paginatedCustomers.map((customer) => (
                <div key={customer.customer_name} className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-semibold group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      {getInitials(customer.customer_name)}
                    </div>
                    <div>
                      <p className="font-semibold">{customer.customer_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Last seen {new Date(customer.last_purchase).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">KES {customer.total_spent.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground font-medium">{customer.transactions} Transactions</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* LOAD MORE */}
      {visibleCount < processedCustomers.length && (
        <div className="flex flex-col items-center gap-2 pb-10">
          <p className="text-xs text-muted-foreground">
            Showing {paginatedCustomers.length} of {processedCustomers.length}
          </p>
          <Button variant="outline" onClick={() => setVisibleCount(v => v + 20)}>
            Load More Customers
          </Button>
        </div>
      )}
    </div>
  );
};

// Reusable KPI Component for cleaner code
const KPICard = ({ title, value, icon, isText = false }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
        <span className="text-primary opacity-60">{icon}</span>
      </div>
      <p className={`${isText ? "text-base" : "text-2xl"} font-bold truncate`}>{value}</p>
    </CardContent>
  </Card>
);
