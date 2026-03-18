import React, { useMemo, useState } from "react";
import { useInventory } from "@/hooks/useInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Added a basic Dialog/Modal import assumption from Shadcn
import { AddProductModal } from "./modals/AddProductModal"; 
import { AddStockModal } from "./modals/AddStockModal";
import { useAuth } from '@/contexts/AuthContext';


import {
  Package,
  AlertTriangle,
  Plus,
  Search,
} from "lucide-react";

export const InventoryPage = () => {
  const { user } = useAuth();
  const businessId = user?.businessId;
  const { items = [], loading, refresh } = useInventory(businessId); // Added refresh for business logic

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // MODAL STATES
  const [openAddProduct, setOpenAddProduct] = useState(false);
  const [selectedItemForStock, setSelectedItemForStock] = useState(null); // Track WHICH item to add stock to

  /* ---------------- LOADING STATE ---------------- */
  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-200 rounded" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  /* ---------------- KPI CALCULATIONS ---------------- */
  // Moved above Empty State so we can use them in the UI logic
  const totalProducts = items.length;
  const lowStockItems = items.filter(
    (item) => item.stock <= (item.low_stock_threshold || 5)
  );
  const inventoryValue = items.reduce(
    (sum, item) => sum + (Number(item.stock) * (Number(item.cost_price) || 0)),
    0
  );

  /* ---------------- FILTERING ---------------- */
  const filteredItems = useMemo(() => {
    let filtered = [...items];
    if (search) {
      filtered = filtered.filter((item) =>
        (item.name || "").toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filter === "low") {
      filtered = filtered.filter((item) => item.stock <= (item.low_stock_threshold || 5));
    }
    if (filter === "out") {
      filtered = filtered.filter((item) => item.stock <= 0);
    }
    return filtered;
  }, [items, search, filter]);

  const getStatus = (item) => {
    if (item.stock <= 0) return "Out of Stock";
    if (item.stock <= (item.low_stock_threshold || 5)) return "Low Stock";
    return "In Stock";
  };

  /* ---------------- EMPTY STATE ---------------- */
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-10 space-y-4">
            <Package className="mx-auto w-12 h-12 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold">No inventory yet</h2>
            <p className="text-sm text-muted-foreground">
              Your warehouse is empty. Start by adding your first product.
            </p>
            <Button onClick={() => setOpenAddProduct(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add First Product
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
            <p className="text-sm text-muted-foreground">Tracking {totalProducts} items across your store</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setOpenAddProduct(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        
          <Button 
            variant="secondary"
            onClick={() => setSelectedItemForStock({})} // empty = generic stock add
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Stock
          </Button>
        </div>
      </div>

      {/* KPI STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalProducts}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alert</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-orange-600">{lowStockItems.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Inventory Value</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">KES {inventoryValue.toLocaleString()}</p></CardContent>
        </Card>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name..." 
            className="pl-8" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Items</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {/* TABLE */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr className="text-left font-medium">
                  <th className="p-4">Product</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Value (KES)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredItems.map((item) => {
                  const status = getStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">{item.name}</td>
                      <td className="p-4">{item.stock}</td>
                      <td className="p-4">{(item.stock * (item.cost_price || 0)).toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          status === "In Stock" ? "bg-green-100 text-green-700" :
                          status === "Low Stock" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedItemForStock(item)}
                        >
                          Restock
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* MODALS */}

      {openAddProduct && (
        <AddProductModal
          isOpen={openAddProduct}
          onClose={() => setOpenAddProduct(false)}
          onSuccess={() => {
            setOpenAddProduct(false);
            refresh();
          }}
        />
      )}
      
      {selectedItemForStock !== null && (
        <AddStockModal
          item={selectedItemForStock}
          onClose={() => setSelectedItemForStock(null)}
          onSuccess={() => {
            setSelectedItemForStock(null);
            refresh();
          }}
        />
      )}
    </div>
  );
};
