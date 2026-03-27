import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash } from "lucide-react";

export const AddProductModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();

  const [rows, setRows] = useState([
    { name: "", stock: "", threshold: 5, cost: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const updateRow = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, { name: "", stock: "", threshold: 5, cost: "" }]);
  };

  const removeRow = (index) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    rows.forEach((row, i) => {
      if (!row.name.trim()) {
        newErrors[i] = "Name required";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      for (const row of rows) {
        const res = await fetch("https://n8n.aflows.uk/webhook/add-product", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            businessId: user?.businessId,
            name: row.name.trim(),
            low_stock_threshold: Number(row.threshold),
            initial_stock: row.stock ? Number(row.stock) : 0, // safe addition
            cost_per_unit: row.cost ? Number(row.cost) : null, // ✅ NEW

          }),
        });

        if (!res.ok) throw new Error("Failed");
      }

      setRows([{ name: "", stock: "", threshold: 5, cost: "" }]);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error adding products");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-background border border-border rounded-xl w-full max-w-3xl p-4 sm:p-6 space-y-5 shadow-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Add Products
          </h2>
          <span className="text-xs text-muted-foreground">
            {rows.length} items
          </span>
        </div>

        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-12 gap-3 items-center px-1 text-xs font-medium text-muted-foreground">
          <div className="col-span-4">Product Name</div>
          <div className="col-span-2">Initial Stock</div>
          <div className="col-span-2">Cost per Unit</div>
          <div className="col-span-3">Threshold</div>
          <div className="col-span-1"></div>
        </div>

        {/* Rows */}
        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
          {rows.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
            >
              <div className="col-span-1 sm:col-span-4">
                <p className="text-xs text-muted-foreground mb-1 sm:hidden">Product Name</p>
                <Input
                  placeholder="Enter Product Name"
                  value={row.name}
                  onChange={(e) =>
                    updateRow(i, "name", e.target.value)
                  }
                />
                {errors[i] && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors[i]}
                  </p>
                )}
              </div>

              <div className="col-span-1 sm:col-span-2">
                <p className="text-xs text-muted-foreground mb-1 sm:hidden">Stock</p>
                <Input
                  type="number"
                  placeholder="0"
                  value={row.stock}
                  onChange={(e) =>
                    updateRow(i, "stock", e.target.value)
                  }
                />
              </div>

              <div className="col-span-1 sm:col-span-2">
                <p className="text-xs text-muted-foreground mb-1 sm:hidden">Cost (KES)</p>
                <Input
                  type="number"
                  placeholder="KES"
                  value={row.cost}
                  onChange={(e) =>
                    updateRow(i, "cost", e.target.value)
                  }
                />
              </div>

              <div className="col-span-1 sm:col-span-3">
                <p className="text-xs text-muted-foreground mb-1 sm:hidden">Threshold</p>
                <Input
                  type="number"
                  value={row.threshold}
                  onChange={(e) =>
                    updateRow(i, "threshold", e.target.value)
                  }
                />
              </div>

              <div className="col-span-1 sm:col-span-1 flex justify-end sm:justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRow(i)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Row */}
        <Button
          variant="outline"
          onClick={addRow}
          className="w-full flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Another Product
        </Button>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Add {rows.length} Products
          </Button>
        </div>
      </div>
    </div>
  );
};
