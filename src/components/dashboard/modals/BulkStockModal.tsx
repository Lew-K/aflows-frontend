import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react"; // Nice for UX

export const BulkStockModal = ({ items, onClose, onSuccess }) => {
  const [updates, setUpdates] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (id, value) => {
    setUpdates((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async () => {
    const payload = Object.entries(updates)
      .filter(([_, qty]) => qty !== "" && Number(qty) > 0)
      .map(([id, qty]) => ({
        item_id: id,
        quantity: Number(qty),
      }));

    if (payload.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch("/api/bulk-restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // Crucial fix
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Restock failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      {/* Updated colors for Dark/Light mode support */}
      <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl w-full max-w-3xl p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-tight">Bulk Restock</h2>
          <span className="text-xs text-muted-foreground uppercase font-semibold">
            {items.length} Items Available
          </span>
        </div>

        <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center gap-4 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex-1 font-medium">{item.name}</div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Current: {item.stock ?? 0}</span>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-24 bg-transparent"
                  value={updates[item.id] || ""}
                  onChange={(e) => handleChange(item.id, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || Object.keys(updates).length === 0}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Apply Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
