import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddProductModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [threshold, setThreshold] = useState(5);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Product name is required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://n8n.aflows.uk/webhook/add-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId: user?.businessId,
          name: name.trim(),
          low_stock_threshold: Number(threshold),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add product");
      }

      // reset form
      setName("");
      setThreshold(5);

      onSuccess(); // refresh inventory
    } catch (err) {
      console.error(err);
      alert("Error adding product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg w-full max-w-md p-6 space-y-4 shadow-lg">

        <h2 className="text-foreground text-lg font-semibold">Add Product</h2>

        {/* Product Name */}
        <div className="space-y-1">
          <label className="text-muted-foreground text-sm font-medium">Product Name</label>
          <Input
            placeholder="e.g. Cooking Gas 6kg"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Low Stock Threshold */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Low Stock Threshold</label>
          <Input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Adding..." : "Add Product"}
          </Button>
        </div>

      </div>
    </div>
  );
};
