import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  item?: any; // optional (for restock)
  items?: any[]; // for dropdown
  onClose: () => void;
  onSuccess: () => void;
}

export const AddStockModal = ({ item, items = [], onClose, onSuccess }) => {
  const [selectedItem, setSelectedItem] = useState(item || null);
  const [search, setSearch] = useState("");
  const [quantity, setQuantity] = useState("");
  const [cost, setCost] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!selectedItem || !quantity || !cost) {
      alert("Select product + fill all fields");
      return;
    }

    setLoading(true);

    await fetch("https://n8n.aflows.uk/webhook/add-stock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        item_id: selectedItem.id,
        quantity: Number(quantity),
        unit_price: Number(cost),
      }),
    });

    setLoading(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">

        <h2 className="text-lg font-semibold">Add Stock</h2>

        {/* PRODUCT SEARCH */}
        {!item && (
          <>
            <input
              placeholder="Search product..."
              className="w-full border p-2 rounded"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="max-h-40 overflow-y-auto border rounded">
              {filteredItems.map((i) => (
                <div
                  key={i.id}
                  className={`p-2 cursor-pointer hover:bg-gray-100 ${
                    selectedItem?.id === i.id ? "bg-gray-200" : ""
                  }`}
                  onClick={() => setSelectedItem(i)}
                >
                  {i.name} ({i.stock} in stock)
                </div>
              ))}
            </div>
          </>
        )}

        {/* SELECTED PRODUCT */}
        {selectedItem && (
          <div className="text-sm text-muted-foreground">
            Selected: <span className="font-medium">{selectedItem.name}</span>
          </div>
        )}

        {/* QUANTITY */}
        <input
          type="number"
          placeholder="Quantity"
          className="w-full border p-2 rounded"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        {/* COST */}
        <input
          type="number"
          placeholder="Cost per unit"
          className="w-full border p-2 rounded"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
        />

        {/* ACTIONS */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded"
          >
            {loading ? "Saving..." : "Add Stock"}
          </button>
        </div>
      </div>
    </div>
  );
};
