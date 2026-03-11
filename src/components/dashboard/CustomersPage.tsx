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

  if (loading) {
    return <p className="text-muted-foreground">Loading customers...</p>;
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center gap-2">
        <Users className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Customers</h1>
      </div>

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
                className="flex items-center justify-between py-4"
              >
                <div>
                  <p className="font-medium">{customer.customer_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Last purchase:{" "}
                    {new Date(customer.last_purchase).toLocaleDateString()}
                  </p>
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
