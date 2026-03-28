import React, { useMemo, useState } from "react";
import { useInventory } from "@/hooks/useInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import { AddProductModal } from "./modals/AddProductModal"; 
import { AddStockModal } from "./modals/AddStockModal";
import { BulkStockModal } from "./modals/BulkStockModal";

import {
  Package,
  AlertTriangle,
  Plus,
  Search,
  TrendingUp,
  Boxes,
  ArrowRightLeft
} from "lucide-react";

export const InventoryPage = () => {
  const [bulkRestockOpen, setBulkRestockOpen] = useState(false);
  const { user } = useAuth();
  const businessId = user?.businessId;
  const { items = [], loading, refresh } = useInventory(businessId || "");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [openAddProduct, setOpenAddProduct] = useState(false);
  const [selectedItemForStock, setSelectedItemForStock] = useState(null);

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
    if (item.stock <= 0) return { label: "Out of Stock", class: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" };
    if (item.stock <= (item.low_stock_threshold || 5)) return { label: "Low Stock", class: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" };
    return { label: "In Stock", class: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" };
  };

  if (!user || loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-muted rounded-xl" />)}
        </div>
        <div className="h-96 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground">Monitor stock levels and product performance</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* <Button variant="outline" className="shadow-sm" onClick={() => setSelectedItemForStock(null)}>
            <ArrowRightLeft className="w-4 h-4 mr-2" /> Quick Restock
          </Button> */}
          <Button className="shadow-md" onClick={() => setOpenAddProduct(true)}>
            <Plus className="w-4 h-4 mr-2" /> New Product
          </Button>
          <Button 
            variant="outline" 
            className="shadow-sm"
            onClick={() => setBulkRestockOpen(true)}
          >
            <Boxes className="w-4 h-4 mr-2" /> Bulk Restock
          </Button>
        </div>
      </div>

      {/* KPI STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            <Boxes className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alert</CardTitle>
            <AlertTriangle className={`w-4 h-4 ${stats.lowStockCount > 0 ? "text-amber-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${stats.lowStockCount > 0 ? "text-amber-600" : ""}`}>
              {stats.lowStockCount}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Value</CardTitle>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">KES {stats.value.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {items.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center border-dashed">
          <div className="p-4 bg-muted rounded-full mb-4">
            <Package className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <div className="max-w-[300px] space-y-2">
            <h2 className="text-xl font-semibold">No products yet</h2>
            <p className="text-muted-foreground">Your inventory is empty. Add your first product to start tracking stock.</p>
          </div>
          <Button onClick={() => setOpenAddProduct(true)} className="mt-8" variant="default">
            Add Your First Product
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* SEARCH & FILTERS */}
          <div className="flex flex-col sm:flex-row gap-3 bg-background p-1">
            {/* SEARCH: flex-1 makes this take up all available remaining width */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by product name..." 
                className="pl-10 h-11 bg-background border border-border focus-visible:ring-1" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="relative">
              <select 
                className="h-11 w-full sm:w-[180px] rounded-lg border border-input bg-background pl-4 pr-10 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Inventory</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>

              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
          </div>

          {/* TABLE */}
          <Card className="border-none shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr className="text-left font-semibold text-muted-foreground">
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Current Stock</th>
                    <th className="p-4">Value (KES)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/50">
                  {filteredItems.map((item) => {
                    const status = getStatus(item);
                    return (
                      <tr key={item.id} className="hover:bg-muted/20 transition-colors group">
                        <td className="p-4 font-medium text-foreground">{item.name}</td>
                        <td className="p-4 font-mono text-slate-600">{item.stock}</td>
                        <td className="p-4 font-medium">{(item.stock * (item.cost_price || 0)).toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.class}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Button 
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 opacity-90 hover:opacity-100"
                            onClick={() => setSelectedItemForStock(item)}
                          >
                            <ArrowRightLeft className="w-3 h-3" />
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
        </div>
      )}

      {/* MODALS */}
      <AddProductModal
        isOpen={openAddProduct}
        onClose={() => setOpenAddProduct(false)}
        onSuccess={() => {
          setOpenAddProduct(false);
          refresh();
        }}
      />

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

      {bulkRestockOpen && (
        <BulkStockModal
          items={items}
          onClose={() => setBulkRestockOpen(false)}
          onSuccess={() => {
            setBulkRestockOpen(false);
            refresh();
          }}
        />
      )}
    </div>
  );
};
