import React, { useMemo, useState } from "react";
import { useInventory } from "@/hooks/useInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import { AddProductModal } from "./modals/AddProductModal"; 
import { AddStockModal } from "./modals/AddStockModal"; // Uncomment when ready

import {
  Package,
  AlertTriangle,
  Plus,
  Search,
  Loader2
} from "lucide-react";

export const InventoryPage = () => {
  const { user } = useAuth();
  const businessId = user?.businessId;
  const { items = [], loading, refresh } = useInventory(businessId || "");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [openAddProduct, setOpenAddProduct] = useState(false);
  const [selectedItemForStock, setSelectedItemForStock] = useState(null);

  /* ---------------- CALCULATIONS ---------------- */
  const stats = useMemo(() => {
    const total = items.length;
    const lowStock = items.filter(item => item.stock <= (item.low_stock_threshold || 5));
    const value = items.reduce((sum, item) => sum + (Number(item.stock) * (Number(item.cost_price) || 0)), 0);
    return { total, lowStockCount: lowStock.length, value };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = (item.name || "").toLowerCase().includes(search.toLowerCase());
      const isLow = item.stock <= (item.low_stock_threshold || 5);
      const isOut = item.stock <= 0;

      if (filter === "low") return matchesSearch && isLow;
      if (filter === "out") return matchesSearch && isOut;
      return matchesSearch;
    });
  }, [items, search, filter]);

  const getStatus = (item) => {
    if (item.stock <= 0) return { label: "Out of Stock", class: "bg-red-100 text-red-700" };
    if (item.stock <= (item.low_stock_threshold || 5)) return { label: "Low Stock", class: "bg-orange-100 text-orange-700" };
    return { label: "In Stock", class: "bg-green-100 text-green-700" };
  };

  /* ---------------- RENDER LOGIC ---------------- */
  if (!user || loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-muted rounded" />)}
        </div>
        <div className="h-64 bg-muted rounded" />
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
            <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
            <p className="text-sm text-muted-foreground">Manage your stock and products</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setOpenAddProduct(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
          <Button variant="outline" onClick={() => setSelectedItemForStock({})}>
            <Plus className="w-4 h-4 mr-2" /> Add Stock
          </Button>
        </div>
      </div>

      {/* KPI STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.total}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alert</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-orange-600">{stats.lowStockCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Inventory Value</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">KES {stats.value.toLocaleString()}</p></CardContent>
        </Card>
      </div>

      {items.length === 0 ? (
        /* EMPTY STATE */
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-lg font-semibold">No products found</h2>
          <p className="text-muted-foreground mb-6">Start by adding your first product to the system.</p>
          <Button onClick={() => setOpenAddProduct(true)} variant="secondary">
            Create Product
          </Button>
        </Card>
      ) : (
        <>
          {/* SEARCH & FILTERS */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                className="pl-8" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select 
              className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none"
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
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.class}`}>
                            {status.label}
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
          </Card>
        </>
      )}

      {/* MODALS - Rendered at bottom to ensure availability in all states */}
      <AddProductModal
        isOpen={openAddProduct}
        onClose={() => setOpenAddProduct(false)}
        onSuccess={() => {
          setOpenAddProduct(false);
          refresh();
        }}
      />

      {/* Uncomment when AddStockModal is ready */}
        {selectedItemForStock && (
          <AddStockModal
            item={selectedItemForStock}
            items={items}
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
