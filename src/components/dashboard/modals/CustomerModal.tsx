import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Receipt, ShoppingBag, TrendingUp } from "lucide-react"; // Added icons for flair

export const CustomerModal = ({ customer, sales = [], onClose }) => {
  if (!customer) return null;

  const getInitials = (name = "Guest") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "Invalid Date" : d.toLocaleDateString(undefined, { dateStyle: "medium" });
  };

  const totalSpent = customer.total_spent || 0;
  const avgOrderValue = customer.transactions > 0 ? Math.round(totalSpent / customer.transactions) : 0;

  const getItems = (sale) => {
    if (!sale.items) return [];
    if (typeof sale.items === "string") {
      try { return JSON.parse(sale.items); } catch { return []; }
    }
    return sale.items;
  };

  return (
    <div className="h-full w-full max-w-md bg-background border-l shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 ease-out">
      
      {/* HEADER: More compact with a subtle gradient */}
      <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20">
            {getInitials(customer.customer_name)}
          </div>
          <div>
            <h2 className="font-semibold text-lg tracking-tight">
              {customer.customer_name}
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 h-4">
                {customer.transactions} Orders
              </Badge>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* QUICK STATS: Reduced Card bulk */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3 h-3" /> Lifetime Value
            </p>
            <p className="text-lg font-bold tabular-nums">
              KES {totalSpent.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5 mb-1">
              <ShoppingBag className="w-3 h-3" /> Avg. Order
            </p>
            <p className="text-lg font-bold tabular-nums">
              KES {avgOrderValue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Receipt className="w-4 h-4 text-muted-foreground" />
              Order History
            </h3>
            <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Showing {sales.length}
            </span>
          </div>

          {sales.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground text-sm">
              No history found for this client.
            </div>
          ) : (
            <div className="space-y-3">
              {sales.map((sale) => {
                const items = getItems(sale);
                return (
                  <div key={sale.id} className="group p-4 rounded-xl border bg-card hover:border-primary/50 transition-all shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-semibold">{formatDate(sale.created_at)}</p>
                        <p className="text-[11px] text-muted-foreground">Order #{sale.id.toString().slice(-5)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold tabular-nums">KES {Number(sale.amount).toLocaleString()}</p>
                        <Badge variant="secondary" className="text-[9px] h-4">Paid</Badge>
                      </div>
                    </div>

                    {/* ITEM CHIPS */}
                    {items.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {items.slice(0, 3).map((item, i) => (
                          <span key={i} className="text-[10px] bg-muted px-2 py-0.5 rounded-md border text-muted-foreground">
                            {item.name} <span className="text-primary font-medium">x{item.quantity}</span>
                          </span>
                        ))}
                        {items.length > 3 && (
                          <span className="text-[10px] text-muted-foreground self-center">+{items.length - 3} more</span>
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
      <div className="p-5 border-t bg-muted/20">
        <Button variant="outline" className="w-full shadow-sm" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
};
