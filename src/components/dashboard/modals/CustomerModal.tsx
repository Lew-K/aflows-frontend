import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export const CustomerModal = ({ customer, sales, onClose }) => {
  if (!customer) return null;

  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(undefined, { dateStyle: "medium" });

  const avgOrderValue =
    customer.transactions > 0
      ? Math.round(customer.total_spent / customer.transactions)
      : 0;

  // SAFELY PARSE ITEMS
  const getItems = (sale) => {
    if (!sale.items) return [];

    if (typeof sale.items === "string") {
      try {
        return JSON.parse(sale.items);
      } catch {
        return [];
      }
    }

    return sale.items;
  };

  return (
    <div
      className="
        h-full w-full max-w-md
        bg-background border-l shadow-lg
        flex flex-col
        animate-in slide-in-from-right duration-300
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
            {getInitials(customer.customer_name)}
          </div>
          <div>
            <h2 className="font-bold text-lg leading-none">
              {customer.customer_name}
            </h2>
            <p className="text-xs text-muted-foreground">
              {customer.transactions} transactions
            </p>
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* SUMMARY */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Spent</p>
              <p className="text-lg font-bold">
                KES {customer.total_spent.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Avg Order</p>
              <p className="text-lg font-bold">
                KES {avgOrderValue.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* LAST PURCHASE */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Last Purchase</p>
            <p className="text-sm font-medium">
              {formatDate(customer.last_purchase)}
            </p>
          </CardContent>
        </Card>

        {/* RECENT PURCHASES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wide">
              Recent Purchases
            </h3>
            <Badge variant="secondary" className="text-xs">
              Last {sales.length}
            </Badge>
          </div>

          {sales.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No transactions found
            </div>
          ) : (
            <div className="divide-y rounded-lg border overflow-hidden">
              {sales.map((sale) => {
                const items = getItems(sale);

                return (
                  <div
                    key={sale.id}
                    className="p-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {formatDate(sale.created_at)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {items.length} items
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">
                          KES {Number(sale.amount).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* ITEM LIST */}
                    {items.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground space-y-1">
                        {items.slice(0, 2).map((item, i) => (
                          <div key={i}>
                            {item.name || "Item"} x{item.quantity || 1}
                          </div>
                        ))}
                        {items.length > 2 && (
                          <div>+{items.length - 2} more</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t">
        <Button variant="outline" className="w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};
