import React, { useMemo, useState } from "react";
import { useInventory } from "@/hooks/useInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Package,
  AlertTriangle,
  Plus,
  Search,
} from "lucide-react";

export const InventoryPage = () => {
  const { items, loading } = useInventory();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  if (loading) {
    return <p className="text-muted-foreground">Loading inventory...</p>;
  }

  /* ---------------- KPI CALCULATIONS ---------------- */

  const totalProducts = items.length;

  const lowStockItems = items.filter(
    (item) => item.stock <= item.low_stock_threshold
  );

  const inventoryValue = items.reduce(
    (sum, item) => sum + item.stock * item.cost_price,
    0
  );

  /* ---------------- FILTERING ---------------- */

  const filteredItems = useMemo(() => {
    let filtered = [...items];

    if (search) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filter === "low") {
      filtered = filtered.filter(
        (item) => item.stock <= item.low_stock_threshold
      );
    }

    if (filter === "out") {
      filtered = filtered.filter((item) => item.stock === 0);
    }

    return filtered;
  }, [items, search, filter]);

  /* ---------------- STATUS FUNCTION ---------------- */

  const getStatus = (item) => {
    if (item.stock === 0) return "Out of Stock";
    if (item.stock <= item.low_stock_threshold) return "Low Stock";
    return "In Stock";
  };

  /* ---------------- PAGE ---------------- */

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Inventory</h1>
            <p className="text-sm text-muted-foreground">
              Manage your products and stock levels
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>

          <Button variant="secondary">
            <Plus className="w-4 h-4 mr-2" />
            Add Stock
          </Button>
        </div>
      </div>

      {/* KPI STRIP */}

      <div className="grid grid-cols-3 gap-4">

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Products</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-bold">{totalProducts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Low Stock Items</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {lowStockItems.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Inventory Value</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-bold">
              KES {inventoryValue.toLocaleString()}
            </p>
          </CardContent>
        </Card>

      </div>

      {/* LOW STOCK ALERTS */}

      {lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="w-5 h-5" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-sm"
              >
                <span>{item.name}</span>
                <span className="font-semibold">
                  {item.stock} left
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* SEARCH + FILTERS */}

      <div className="flex items-center gap-3">

        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />

          <Input
            placeholder="Search products"
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="border rounded-md px-3 py-2 text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>

      </div>

      {/* INVENTORY TABLE */}

      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
        </CardHeader>

        <CardContent>

          {filteredItems.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No inventory items found
            </p>
          )}

          {filteredItems.length > 0 && (
            <table className="w-full text-sm">

              <thead className="border-b">
                <tr className="text-left">
                  <th className="py-2">Product</th>
                  <th>Stock</th>
                  <th>Cost Price</th>
                  <th>Inventory Value</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((item) => {
                  const status = getStatus(item);

                  return (
                    <tr key={item.id} className="border-b">

                      <td className="py-3 font-medium">
                        {item.name}
                      </td>

                      <td>{item.stock}</td>

                      <td>KES {item.cost_price}</td>

                      <td>
                        KES {(item.stock * item.cost_price).toLocaleString()}
                      </td>

                      <td>
                        {status === "Low Stock" && (
                          <span className="text-yellow-600 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            Low Stock
                          </span>
                        )}

                        {status === "Out of Stock" && (
                          <span className="text-red-600">
                            Out of Stock
                          </span>
                        )}

                        {status === "In Stock" && (
                          <span className="text-green-600">
                            In Stock
                          </span>
                        )}
                      </td>

                      <td>
                        {item.last_movement
                          ? new Date(item.last_movement).toLocaleDateString()
                          : "—"}
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          )}

        </CardContent>
      </Card>
    </div>
  );
};
