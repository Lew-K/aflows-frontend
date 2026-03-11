import React from "react";
import { useInventory } from "@/hooks/useInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle } from "lucide-react";

export const InventoryPage = () => {
  const { items, loading } = useInventory();

  if (loading) {
    return <p className="text-muted-foreground">Loading inventory...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Package className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Inventory</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Levels</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="divide-y">

            {items.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No inventory items yet
              </p>
            )}

            {items.map((item) => {
              const isLow = item.stock <= item.low_stock_threshold;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-4"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Last movement:{" "}
                      {item.last_movement
                        ? new Date(item.last_movement).toLocaleDateString()
                        : "Never"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">

                    <span className="font-semibold">{item.stock}</span>

                    {isLow ? (
                      <span className="flex items-center gap-1 text-yellow-600 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        Low
                      </span>
                    ) : (
                      <span className="text-green-600 text-sm">OK</span>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
