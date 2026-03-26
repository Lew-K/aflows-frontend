import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const BulkStockModal = ({ items, onClose, onSuccess }) => {
  const [updates, setUpdates] = useState({});

  const handleChange = (id, value) => {
    setUpdates((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async () => {
    const payload = Object.entries(updates)
      .filter(([_, qty]) => Number(qty) > 0)
      .map(([id, qty]) => ({
        item_id: id,
        quantity: Number(qty),
      }));

    if (payload.length === 0) return;

    try {
      await fetch("/api/bulk-restock", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-xl w-full max-w-3xl p-6 space-y-4">
        <h2 className="text-lg font-bold">Bulk Restock</h2>

        <div className="max-h-[400px] overflow-y-auto space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="flex-1">{item.name}</div>

              <Input
                type="number"
                placeholder="Qty"
                className="w-24"
                onChange={(e) =>
                  handleChange(item.id, e.target.value)
                }
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Apply Changes</Button>
        </div>
      </div>
    </div>
  );
};
