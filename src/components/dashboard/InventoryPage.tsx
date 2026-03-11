import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";

export const InventoryPage = ({ businessId }) => {

  const { items, loading } = useInventory(businessId);

  return (
    <div className="space-y-6 p-6">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory</h1>

        <button className="bg-primary text-white px-4 py-2 rounded-xl">
          + Add Item
        </button>
      </div>

      <Card>

        <CardHeader>
          <CardTitle>Stock Levels</CardTitle>
        </CardHeader>

        <CardContent>

          {loading ? (
            <p>Loading...</p>
          ) : (

            <table className="w-full text-sm">

              <thead className="text-muted-foreground">
                <tr>
                  <th className="text-left">Item</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Last Restock</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>

                {items.map(item => {

                  const lowStock = item.stock <= item.low_stock_threshold;

                  return (
                    <tr key={item.id} className="border-t">

                      <td>{item.name}</td>

                      <td className="text-center">{item.stock}</td>

                      <td className="text-center">

                        {lowStock ? (
                          <span className="text-destructive flex items-center gap-1 justify-center">
                            <AlertTriangle size={14}/>
                            LOW
                          </span>
                        ) : (
                          <span className="text-success">
                            OK
                          </span>
                        )}

                      </td>

                      <td className="text-center">
                        {item.last_restocked
                          ? new Date(item.last_restocked).toLocaleDateString()
                          : "-"
                        }
                      </td>

                      <td>
                        <button className="text-primary text-sm">
                          Edit
                        </button>
                      </td>

                    </tr>
                  );

                })}

              </tbody>

            </table>

          )}

        </CardContent>

      </Card>

    </div>
  );
};
