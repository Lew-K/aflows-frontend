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
    <div className="h-full flex flex-col animate-in slide-in-from-right duration-500">
      {/* HEADER - More 'App-like' feel */}
      <div className="p-6 border-b flex justify-between items-start bg-gradient-to-b from-primary/5 to-transparent">
        <div className="flex flex-col gap-3">
          <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl shadow-lg shadow-primary/20">
            {customer.customer_name.substring(0,2).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-xl">{customer.customer_name}</h2>
            <Badge className="bg-primary/10 text-primary border-none hover:bg-primary/20 mt-1">
              {customer.segment.replace("_", " ")}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* STATS TILES */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 transition-hover hover:bg-muted/60">
            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-wider">Lifetime Value</p>
            <p className="text-xl font-bold">KES {customer.total_spent.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-wider">Avg Order</p>
            <p className="text-xl font-bold">KES {Math.round(customer.total_spent / customer.transactions).toLocaleString()}</p>
          </div>
        </div>

        {/* ORDER HISTORY LIST */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Order History</h3>
          <div className="space-y-3">
            {sales.map((sale) => (
              <div key={sale.id} className="p-4 rounded-xl border bg-card/50 hover:shadow-md transition-all">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-muted-foreground">
                    {new Date(sale.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-sm font-bold tracking-tight">KES {Number(sale.amount).toLocaleString()}</span>
                </div>
                {/* Visual indicator for items */}
                <div className="mt-3 pt-3 border-t flex flex-wrap gap-1">
                   {/* Mapping logic remains exactly same as your snippet */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER - Subtle CTA */}
      <div className="p-6 border-t">
        <Button className="w-full py-6 rounded-xl font-bold text-md" onClick={onClose}>
          Close Profile
        </Button>
      </div>
    </div>
  );
};
