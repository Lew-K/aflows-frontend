import { FileSpreadsheet } from 'lucide-react';
import React, { useMemo, useState, useEffect } from "react";
import { useInventory } from "@/hooks/useInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import { AddProductModal } from "./modals/AddProductModal"; 
import { BulkStockModal } from "./modals/BulkStockModal";
import { ImportStockModal } from "./modals/ImportStockModal";



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
  const [importModalOpen, setImportModalOpen] = useState(false);
  const { user } = useAuth();
  const businessId = user?.businessId;
  const { items = [], loading, refresh } = useInventory(businessId || "");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(20);
  const [openAddProduct, setOpenAddProduct] = useState(false);

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
  
  useEffect(() => {
    setVisibleCount(20);
  }, [search, filter]);
  
  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = filteredItems.length > visibleCount;

  const getStatus = (item) => {
    if (item.stock <= 0) return { label: "Out of Stock", class: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" };
    if (item.stock <= (item.low_stock_threshold || 5)) return { label: "Low Stock", class: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" };
    return { label: "In Stock", class: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" };
  };

  if (!user || (items.length === 0 && loading)) {
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
    <div className="
    px-4
    py-4
    md:p-6
    space-y-6
    md:space-y-8
    ">
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

        <div
          className="
            flex
            flex-col
            sm:flex-row
            gap-3
            w-full
            md:w-auto
          "
          data-tour="inventory-actions"
        >
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
            <Boxes className="w-4 h-4 mr-2" /> Restock Inventory
          </Button>
          <Button
            variant="outline"
            className="shadow-sm"
            onClick={() => setImportModalOpen(true)}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Import Excel
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
        
        <Card className="shadow-sm border border-border bg-card" data-tour="low-stock-alert">
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
          <div className="flex flex-col sm:flex-row gap-4 bg-background p-1">

            <div className="relative flex-1">

              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

              <Input 

                placeholder="Search by product name..." 

                className="pl-10 h-11 bg-background border border-border focus-visible:ring-1" 

                value={search}

                onChange={(e) => setSearch(e.target.value)}

              />

            </div>

            <select 

              className="h-11 rounded-md border-none bg-muted/30 px-4 text-sm font-medium outline-none focus:ring-1 focus:ring-primary min-w-[160px]"
              value={filter}

              onChange={(e) => setFilter(e.target.value)}

            >

              <option value="all" className="bg-background text-foreground">All Inventory</option>

              <option value="low" className="bg-background text-foreground">Low Stock Warning</option>

              <option value="out" className="bg-background text-foreground">Out of Stock</option>

            </select>

          </div>

          {/* TABLE */}
          <Card className="border-none shadow-sm overflow-hidden" data-tour="inventory-table">
            {/* Desktop table — capped height, scrolls independently of the page */}
            <div className="hidden md:block max-h-[600px] overflow-y-auto">
              <table className="w-full text-sm table-fixed">
                <thead className="bg-muted/50 border-b">
                  <tr className="text-left font-semibold text-muted-foreground">
                    <th className="p-4 w-[40%]">Product Name</th>
                    <th className="p-4 w-[20%]">Stock</th>
                    <th className="p-4 w-[20%]">Value (KES)</th>
                    <th className="p-4 w-[20%] text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/50">
                  {visibleItems.map((item) => {
                    const status = getStatus(item);
                    return (
                      <tr key={item.id} className="hover:bg-muted/20 transition-colors group">
                        <td className="p-4 font-medium truncate">{item.name}</td>
                        <td className="p-4 font-mono">{item.stock}</td>
                        <td className="p-4">{(item.stock * (item.cost_price || 0)).toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.class}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {hasMore && (
                <div className="p-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setVisibleCount((prev) => prev + 20)}
                  >
                    Load More
                  </Button>
                </div>
              )}
            </div>
          
            {/* Mobile card list — page scrolls naturally, no height cap */}
            <div className="md:hidden divide-y">
              {visibleItems.map((item) => {
                const status = getStatus(item);
                return (
                  <div key={item.id} className="p-4 space-y-2.5">
                    <div className="flex justify-between items-start gap-3">
                      <p className="font-semibold text-sm leading-tight">{item.name}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${status.class}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Stock: <span className="font-mono text-foreground">{item.stock}</span></span>
                      <span>Value: <span className="text-foreground">KES {(item.stock * (item.cost_price || 0)).toLocaleString()}</span></span>
                    </div>
                  </div>
               );
              })}
            </div>
            {hasMore && (
              <div className="md:hidden p-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setVisibleCount((prev) => prev + 20)}
                >
                  Load More
                </Button>
              </div>
            )}
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

      {importModalOpen && (
        <ImportStockModal
          onClose={() => setImportModalOpen(false)}
          onSuccess={() => {
            setImportModalOpen(false);
            refresh();
          }}
        />
      )}
    </div>
  );
};
