import React from "react";
import { useCustomers } from "@/hooks/useCustomers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export const CustomersPage = () => {
  const { customers, loading } = useCustomers();

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
                No customers yet
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
                    KES {Number(customer.total_spent).toLocaleString()}
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
