import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { saleSchema, type SaleFormData } from '@/lib/validation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ShoppingCart, Download, ReceiptText, History, Info } from 'lucide-react';

const paymentMethods = [
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card Payment' },
];

export const SalesPage = () => {
  const [allSales, setAllSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [extraItems, setExtraItems] = useState<
    { itemSold: string; quantity: number; unitCost: number }[]
  >([]);

  const { user, accessToken } = useAuth();
  const businessId = user?.businessId;

  /* ================= WEEKLY SUMMARY ================= */
  const weeklySummary = React.useMemo(() => {
    if (!Array.isArray(allSales)) {
      return { totalSales: 0, totalValue: 0 };
    }

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklySales = allSales.filter(
      (sale) => new Date(sale.created_at) >= startOfWeek
    );

    return {
      totalSales: weeklySales.length,
      totalValue: weeklySales.reduce(
        (sum, sale) => sum + Number(sale.amount || 0),
        0
      ),
    };
  }, [allSales]);

  /* ================= FETCH SALES ================= */
  const fetchSales = async () => {
    if (!user?.businessId || !accessToken) return;

    try {
      const res = await fetch(
        `https://n8n.aflows.uk/webhook/get-sales?business_id=${user.businessId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await res.json();
      const sales = Array.isArray(data?.sales?.sales)
        ? data.sales.sales
        : [];

      setAllSales(sales);
    } catch (err) {
      console.error("Failed to fetch sales:", err);
      setAllSales([]);
    }
  };

  useEffect(() => {
    if (!user?.businessId) return;
    fetchSales();
    const interval = setInterval(fetchSales, 60000);
    return () => clearInterval(interval);
  }, [user?.businessId, accessToken]);

  /* ================= FORM ================= */
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      quantity: 1,
      unitCost: 0,
      amount: 0,
      paymentMethod: undefined,
    },
  });

  const quantityWatch = watch("quantity");
  const unitCostWatch = watch("unitCost");
  const paymentMethod = watch("paymentMethod");

  const baseTotal =
    (Number(quantityWatch) || 0) * (Number(unitCostWatch) || 0);

  const extraTotal = extraItems.reduce(
    (sum, item) =>
      sum +
      (Number(item.quantity || 0) * Number(item.unitCost || 0)),
    0
  );

  const grandTotal = baseTotal + extraTotal;

  useEffect(() => {
    setValue("amount", grandTotal, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [grandTotal, setValue]);

  /* ================= SUBMIT ================= */
  const onSubmit = async (data: SaleFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        'https://n8n.aflows.uk/webhook/record-sales',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_id: businessId,
            customer_name: data.customerName || null,
            item_sold:
              extraItems.length > 0
                ? "Multiple Items"
                : data.itemSold,
            quantity: data.quantity,
            unit_cost: data.unitCost,
            amount: grandTotal,
            payment_method: data.paymentMethod || null,
            payment_reference: data.paymentReference || null,
          }),
        }
      );

      if (response.ok) {
        toast.success("Sale recorded successfully!");
        reset();
        setExtraItems([]);
        fetchSales();
      } else {
        toast.error("Failed to record sale");
      }
    } catch (err) {
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6">
      <header>
        <h1 className="text-3xl font-extrabold">Sales Dashboard</h1>
        <p className="text-muted-foreground">
          Manage transactions and monitor performance.
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-primary/5 border-none">
          <CardContent className="pt-6">
            <p className="text-sm uppercase">Weekly Sales</p>
            <h3 className="text-3xl font-bold">
              {weeklySummary.totalSales}
            </h3>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-none">
          <CardContent className="pt-6">
            <p className="text-sm uppercase">Weekly Revenue</p>
            <h3 className="text-3xl font-bold text-primary">
              KES {weeklySummary.totalValue.toLocaleString()}
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[75vh]">

        {/* FORM */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Quick Sales Entry</CardTitle>
            <CardDescription>Record a transaction.</CardDescription>
          </CardHeader>

          <CardContent className="flex-grow overflow-y-auto space-y-6">

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              <div>
                <Label>Customer Name</Label>
                <Input {...register("customerName")} />
              </div>

              <div>
                <Label>Item Sold</Label>
                <Input {...register("itemSold")} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Qty</Label>
                  <Input
                    type="number"
                    {...register("quantity", { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <Label>Unit Price</Label>
                  <Input
                    type="number"
                    {...register("unitCost", { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <Label>Total</Label>
                  <Input readOnly value={baseTotal} />
                </div>
              </div>

              {/* EXTRA ITEMS */}
              {extraItems.map((item, index) => {
                const lineTotal =
                  (Number(item.quantity) || 0) *
                  (Number(item.unitCost) || 0);

                return (
                  <div key={index} className="border p-3 rounded-lg space-y-3">
                    <Input
                      placeholder="Item"
                      value={item.itemSold}
                      onChange={(e) => {
                        const updated = [...extraItems];
                        updated[index].itemSold = e.target.value;
                        setExtraItems(updated);
                      }}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...extraItems];
                          updated[index].quantity =
                            Number(e.target.value);
                          setExtraItems(updated);
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Unit Price"
                        value={item.unitCost}
                        onChange={(e) => {
                          const updated = [...extraItems];
                          updated[index].unitCost =
                            Number(e.target.value);
                          setExtraItems(updated);
                        }}
                      />
                      <Input readOnly value={lineTotal} />
                    </div>
                  </div>
                );
              })}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setExtraItems([
                    ...extraItems,
                    { itemSold: "", quantity: 1, unitCost: 0 },
                  ])
                }
              >
                + Add Another Item
              </Button>

              <div className="flex justify-between border-t pt-4">
                <p>Grand Total</p>
                <p className="font-bold text-primary">
                  KES {grandTotal.toLocaleString()}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner size="sm" /> : "Record Sale"}
              </Button>

            </form>
          </CardContent>
        </Card>

        {/* RECENT SALES */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>

          <CardContent className="flex-grow overflow-y-auto">
            {allSales.length === 0 ? (
              <div className="text-center py-10 opacity-50">
                <Info className="mx-auto mb-2" />
                No sales activity found
              </div>
            ) : (
              [...allSales]
                .sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                )
                .slice(0, 5)
                .map((sale) => (
                  <div
                    key={sale.id ?? sale.created_at}
                    className="border p-3 rounded-lg mb-3 flex justify-between"
                  >
                    <div>
                      <p className="font-semibold">
                        {sale.customer_name || "Walk-in"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sale.item_sold}
                      </p>
                    </div>
                    <p className="font-bold">
                      KES {Number(sale.amount).toLocaleString()}
                    </p>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};
