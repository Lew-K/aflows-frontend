import React, { useMemo } from "react";
import { useSales } from "@/hooks/useSales";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export const CustomersPage = () => {
  const { user } = useAuth();

  const { sales, loading } = useSales(
    user?.businessId || "",
    "all"
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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

  const topCustomers = customers.slice(0, 3);

  const totalCustomers = customers.length;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const activeThisMonth = customers.filter((c) => {
    const d = new Date(c.last_purchase);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const topCustomer = customers[0];

  if (loading) {
    return <p className="text-muted-foreground">Loading customers...</p>;
  }

  return (
    <div className="space-y-8">

      {/* Page Title */}
      <div className="flex items-center gap-2">
        <Users className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Customers</h1>
      </div>

      {/* KPI STRIP */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Customers</p>
            <p className="text-2xl font-bold">{totalCustomers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active This Month</p>
            <p className="text-2xl font-bold">{activeThisMonth}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Top Customer</p>
            <p className="text-lg font-semibold">
              {topCustomer?.customer_name || "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Revenue From Top</p>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

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

      {/* CUSTOMER LIST */}

      <Card>

        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>

        <CardContent>

          <div className="divide-y">

            {customers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No customers recorded yet
              </p>
            )}

            {customers.map((customer) => (

              <div
                key={customer.customer_name}
                className="flex items-center justify-between py-4 hover:bg-muted/30 px-3 rounded-lg transition"
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

        </CardContent>

      </Card>

    </div>
  );
};
