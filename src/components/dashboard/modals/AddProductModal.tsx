import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export const BulkStockModal = ({ items, onClose, onSuccess }) => {
  const [updates, setUpdates] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("add"); // add | set

  const handleChange = (id, value) => {
    if (Number(value) < 0) return;
    setUpdates((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const computedUpdates = useMemo(() => {
    return Object.entries(updates).map(([id, qty]) => {
      const item = items.find((i) => i.id === id);
      const current = item?.stock ?? 0;
      const value = Number(qty);

      let next = current;
      if (mode === "add") next = current + value;
      if (mode === "set") next = value;

      return { id, current, next, value };
    });
  }, [updates, items, mode]);

  const totalItemsChanged = computedUpdates.length;
  const totalUnitsAdded = computedUpdates.reduce(
    (sum, u) => sum + (u.next - u.current),
    0
  );

  const handleSubmit = async () => {
    const payload = computedUpdates.map((u) => ({
      item_id: u.id,
      quantity: u.value,
      mode, // backend can ignore for now
    }));

    if (payload.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch("/api/bulk-restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-background border border-border text-foreground rounded-xl w-full max-w-4xl p-6 shadow-2xl space-y-5">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Bulk Stock Update</h2>
          <span className="text-xs text-muted-foreground">
            {items.length} items
          </span>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />

          <div className="flex gap-1 border border-border rounded-md p-1">
            <Button
              size="sm"
              variant={mode === "add" ? "default" : "ghost"}
              onClick={() => setMode("add")}
            >
              Add
            </Button>
            <Button
              size="sm"
              variant={mode === "set" ? "default" : "ghost"}
              onClick={() => setMode("set")}
            >
              Set
            </Button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setUpdates({})}
          >
            Clear
          </Button>
        </div>

        {/* List */}
        <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
          {filteredItems.map((item) => {
            const value = updates[item.id];
            const current = item.stock ?? 0;

            let next = current;
            if (value !== undefined) {
              const v = Number(value);
              next = mode === "add" ? current + v : v;
            }

            const isChanged = value !== undefined;

            return (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-3 rounded-lg border transition ${
                  isChanged
                    ? "bg-primary/5 border-primary/20"
                    : "border-transparent hover:bg-muted/50"
                }`}
              >
                <div className="flex-1 font-medium">{item.name}</div>

                <div className="text-sm text-muted-foreground w-32 text-right">
                  {current} {isChanged && "→"}{" "}
                  {isChanged && <span className="text-foreground">{next}</span>}
                </div>

                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-24"
                  value={value || ""}
                  onChange={(e) =>
                    handleChange(item.id, e.target.value)
                  }
                />
              </div>
            );
          })}
        </div>

        {/* Summary */}
        {totalItemsChanged > 0 && (
          <div className="text-sm text-muted-foreground border-t pt-3">
            Updating <span className="font-medium">{totalItemsChanged}</span> items •{" "}
            Net change:{" "}
            <span className="font-medium">{totalUnitsAdded}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading || totalItemsChanged === 0}
          >
            {loading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Apply Changes ({totalItemsChanged})
          </Button>
        </div>
      </div>
    </div>
  );
};
