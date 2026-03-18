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

  // NEW: modal state (safe, not used yet if you haven’t built modals)
  const [openAddProduct, setOpenAddProduct] = useState(false);
  const [openAddStock, setOpenAddStock] = useState(false);

  /* ---------------- LOADING STATE (IMPROVED) ---------------- */

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-24 bg-gray-200 rounded" />
          <div className="h-24 bg-gray-200 rounded" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  /* ---------------- EMPTY STATE (NEW) ---------------- */

  if (!loading && items.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-10 space-y-4">
          <Package className="mx-auto w-10 h-10 text-muted-foreground" />

          <h2 className="text-lg font-semibold">
            No inventory yet
          </h2>

          <p className="text-sm text-muted-foreground">
            Start by adding products manually or uploading a file
          </p>

          <div className="flex justify-center gap-2">
            <Button onClick={() => setOpenAddProduct(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>

            <Button
              variant="secondary"
              onClick={() => setOpenAddStock(true)}
              disabled
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Stock
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  /* ---------------- KPI CALCULATIONS ---------------- */

  const totalProducts = items.length;

  const lowStockItems = items.filter(
    (item) => item.stock <= item.low_stock_threshold
  );

  const inventoryValue = items.reduce(
    (sum, item) => sum + item.stock * (item.cost_price || 0),
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

      {/* HEADER */}

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
          <Button onClick={() => setOpenAddProduct(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>

          <Button
            variant="secondary"
            onClick={() => setOpenAddStock(true)}
            disabled={items.length === 0}
          >
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
              <div key={item.id} className="flex justify-between text-sm">
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

      {/* TABLE */}

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
                  <th>Actions</th> {/* NEW */}
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

                      <td>KES {item.cost_price || 0}</td>

                      <td>
                        KES {(item.stock * (item.cost_price || 0)).toLocaleString()}
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

                      {/* NEW ACTION BUTTON */}
                      <td>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setOpenAddStock(true)}
                        >
                          Add Stock
                        </Button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          )}

        </CardContent>
      </Card>

      {/* MODALS PLACEHOLDER (SAFE) */}
      {/* You can plug your modals here later */}
      {/* {openAddProduct && <AddProductModal ... />} */}
      {/* {openAddStock && <AddStockModal ... />} */}

    </div>
  );
};
