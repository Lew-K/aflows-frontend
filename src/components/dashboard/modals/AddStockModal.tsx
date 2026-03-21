import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

interface Props {
  item?: any; // optional (for restock)
  items?: any[]; // for dropdown
  onClose: () => void;
  onSuccess: () => void;
}

export const AddStockModal = ({ item, items = [], onClose, onSuccess }: Props) => {
  const { user } = useAuth();

  const [selectedItemId, setSelectedItemId] = useState(item?.id || "");
  const [quantity, setQuantity] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item?.id) {
      setSelectedItemId(item.id);
    }
  }, [item]);

  const handleSubmit = async () => {
    if (!selectedItemId) {
      alert("Select a product");
      return;
    }

   if (quantity <= 0 || unitPrice < 0) {
     alert("Enter valid quantity and cost");
     return;
   }

    setLoading(true);

    try {
      const res = await fetch("https://n8n.aflows.uk/webhook/add-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId: user?.businessId,
          item_id: selectedItemId,
          quantity: Number(quantity),
          unit_price: Number(unitPrice),
          type: "PURCHASE",
          movement_type: "PURCHASE",
          source: "MANUAL",
        }),
      });

      if (!res.ok) throw new Error("Failed to add stock");

      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Error adding stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-background text-foreground rounded-lg w-full max-w-md p-6 space-y-4 shadow-lg border">

        <h2 className="text-lg font-semibold">
          {item ? `Restock ${item.name}` : "Add Stock"}
        </h2>

        {/* PRODUCT SELECT (only if not pre-selected) */}
        {!item && (
          <div className="space-y-1">
            <label className="text-sm font-medium">Product</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
            >
              <option value="">Select product</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* TITY */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Quantity</label>
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 0) setQuantity(value);
            }}
          />
        </div>

        {/* UNIT PRICE */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Cost per Unit (KES)</label>
          <Input
            type="number"
            min="0"
            value={unitPrice}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 0) setUnitPrice(value);
            }}
          />
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Add Stock"}
          </Button>
        </div>

      </div>
    </div>
  );
};
