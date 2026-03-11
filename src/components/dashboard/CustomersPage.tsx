import React, { useMemo, useState } from "react";
import { useSales } from "@/hooks/useSales";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

export const CustomersPage = () => {
  const { user } = useAuth();

  const { sales, loading } = useSales(
    user?.businessId || "",
    "all"
  );

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("total_spent");
  const [visibleCount, setVisibleCount] = useState(20);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  /*
  =============================
  EXISTING CUSTOMER AGGREGATION
  =============================
  (Not modified)
  */

  const customers = useMemo(() => {
    const map = new Map();

    sales.forEach((sale: any) => {
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

    return Array.from(map.values()).sort(
      (a, b) => b.total_spent - a.total_spent
    );
  }, [sales]);

  /*
  =============================
  KPI CALCULATIONS
  =============================
  */

  const totalCustomers = customers.length;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const activeThisMonth = customers.filter((c) => {
    const d = new Date(c.last_purchase);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const topCustomer = customers[0];
  const topCustomers = customers.slice(0, 3);

  /*
  =============================
  SEARCH FILTER
  =============================
  */

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) =>
      c.customer_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [customers, search]);

  /*
  =============================
  SORTING
  =============================
  */

  const sortedCustomers = useMemo(() => {
    const sorted = [...filteredCustomers];

    if (sortBy === "transactions") {
      sorted.sort((a, b) => b.transactions - a.transactions);
    }

    if (sortBy === "last_purchase") {
      sorted.sort(
        (a, b) =>
          new Date(b.last_purchase).getTime() -
          new Date(a.last_purchase).getTime()
      );
    }

    if (sortBy === "total_spent") {
      sorted.sort((a, b) => b.total_spent - a.total_spent);
    }

    return sorted;
  }, [filteredCustomers, sortBy]);

  /*
  =============================
  PAGINATION
  =============================
  */

  const paginatedCustomers = sortedCustomers.slice(0, visibleCount);

  /*
  =============================
  SKELETON LOADING
  =============================
  */

  if (loading) {
    return (
      <div className="space-y-6">

        <Skeleton className="h-8 w-40" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-20 w-full"/>
          <Skeleton className="h-20 w-full"/>
          <Skeleton className="h-20 w-full"/>
          <Skeleton className="h-20 w-full"/>
        </div>

        <Skeleton className="h-10 w-full"/>

        <div className="space-y-3">
          {[...Array(6)].map((_,i)=>(
            <Skeleton key={i} className="h-16 w-full"/>
          ))}
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* PAGE HEADER */}

      <div className="flex items-center gap-2">
        <Users className="w-6 h-6 text-primary"/>
        <h1 className="text-2xl font-bold">Customers</h1>
      </div>

      {/* KPI STRIP */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Total Customers
            </p>
            <p className="text-2xl font-bold">
              {totalCustomers}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Active This Month
            </p>
            <p className="text-2xl font-bold">
              {activeThisMonth}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Top Customer
            </p>
            <p className="text-lg font-semibold">
              {topCustomer?.customer_name || "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Revenue From Top
            </p>
            <p className="text-lg font-semibold">
              KES {topCustomer?.total_spent?.toLocaleString() || "0"}
            </p>
          </CardContent>
        </Card>

      </div>

      {/* TOP CUSTOMERS */}

      {topCustomers.length > 0 && (
        <div>

          <h2 className="text-lg font-semibold mb-3">
            Top Customers
          </h2>

          <div className="grid md:grid-cols-3 gap-4">

            {topCustomers.map((c) => (

              <Card key={c.customer_name}>
                <CardContent className="p-4">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                      {getInitials(c.customer_name)}
                    </div>

                    <div>
                      <p className="font-medium">
                        {c.customer_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.transactions} purchases
                      </p>
                    </div>

                  </div>

                  <p className="mt-3 text-lg font-bold">
                    KES {c.total_spent.toLocaleString()}
                  </p>

                </CardContent>
              </Card>

            ))}

          </div>

        </div>
      )}

      {/* SEARCH + SORT */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm w-full md:w-72"
        />

        <select
          value={sortBy}
          onChange={(e)=>setSortBy(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="total_spent">Sort by Total Spent</option>
          <option value="transactions">Sort by Transactions</option>
          <option value="last_purchase">Sort by Last Purchase</option>
        </select>

      </div>

      {/* RESULT COUNTER */}

      <p className="text-xs text-muted-foreground">
        Showing {paginatedCustomers.length} of {sortedCustomers.length} customers
      </p>

      {/* CUSTOMER LIST */}

      <Card>

        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>

        <CardContent>

          <div className="divide-y">

            {paginatedCustomers.map((customer)=>(
              
              <div
                key={customer.customer_name}
                className="flex items-center justify-between py-4 px-3 hover:bg-muted/30 rounded-lg transition"
              >

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                    {getInitials(customer.customer_name)}
                  </div>

                  <div>
                    <p className="font-medium">
                      {customer.customer_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last purchase{" "}
                      {new Date(customer.last_purchase).toLocaleDateString()}
                    </p>
                  </div>

                </div>

                <div className="text-right">

                  <p className="font-semibold">
                    KES {customer.total_spent.toLocaleString()}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {customer.transactions} purchases
                  </p>

                </div>

              </div>

            ))}

          </div>

          {/* LOAD MORE */}

          {visibleCount < sortedCustomers.length && (

            <div className="flex justify-center pt-6">

              <button
                onClick={()=>setVisibleCount(prev=>prev+20)}
                className="px-4 py-2 text-sm rounded-md border hover:bg-muted transition"
              >
                Load More
              </button>

            </div>

          )}

        </CardContent>

      </Card>

    </div>
  );
};
