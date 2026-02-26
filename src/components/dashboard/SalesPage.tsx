import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { saleSchema } from '@/lib/validation';
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
  const { user, accessToken } = useAuth();
  const businessId = user?.businessId;

  /* ================================
     WEEKLY SUMMARY (UNCHANGED)
  ================================= */
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

  /* ================================
     FETCH SALES (UNCHANGED)
  ================================= */
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

  /* ================================
     FORM SETUP (UPDATED FOR ITEMS)
  ================================= */
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customerName: "",
      paymentMethod: undefined,
      paymentReference: "",
      amount: 0,
      items: [
        {
          itemSold: "",
          quantity: 1,
          unitCost: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const paymentMethod = watch("paymentMethod");
  const itemsWatch = watch("items");

  /* ================================
     GRAND TOTAL CALCULATION
  ================================= */
  const grandTotal = (itemsWatch || []).reduce(
    (sum: number, item: any) =>
      sum +
      (Number(item?.quantity || 0) *
        Number(item?.unitCost || 0)),
    0
  );

  useEffect(() => {
    setValue("amount", grandTotal, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [grandTotal, setValue]);

  /* ================================
     DOWNLOAD RECEIPT (UNCHANGED)
  ================================= */
  const handleDownload = async (sale: any) => {
    try {
      if (!accessToken) {
        toast.error("Session expired.");
        return;
      }

      const res = await fetch(
        `https://n8n.aflows.uk/webhook/download-receipt?receipt_id=${sale.receipt_id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!res.ok) throw new Error();

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${sale.receipt_number || 'receipt'}.pdf`;
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to download receipt");
    }
  };

  /* ================================
     SUBMIT (ONLY GRAND TOTAL SENT)
  ================================= */
  const onSubmit = async (data: any) => {
    setIsLoading(true);

    try {
      const primaryItem = data.items?.[0];

      const response = await fetch(
        'https://n8n.aflows.uk/webhook/record-sales',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_id: businessId,
            customer_name: data.customerName || null,
            item_sold:
              data.items.length > 1
                ? "Multiple Items"
                : primaryItem?.itemSold,
            quantity: primaryItem?.quantity,
            unit_cost: primaryItem?.unitCost,
            amount: grandTotal,
            payment_method: data.paymentMethod || null,
            payment_reference: data.paymentReference || null,
          }),
        }
      );

      let result: any = {};
      const text = await response.text();

      if (text) {
        try {
          result = JSON.parse(text);
        } catch {
          console.warn("Not valid JSON", text);
        }
      }

      if (response.ok) {
        toast.success('Sale recorded successfully!');
        reset();
        fetchSales();
      } else {
        toast.error(result.message || 'Failed to record sale');
      }
    } catch (error) {
      toast.error('Something went wrong!');
    } finally {
      setIsLoading(false);
    }
  };

  /* ================================
     UI
  ================================= */
  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Sales Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Manage transactions and monitor performance.
        </p>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-primary/5 border-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase">
                  Weekly Sales
                </p>
                <h3 className="text-3xl font-bold">
                  {weeklySummary.totalSales}
                </h3>
              </div>
              <ReceiptText className="w-8 h-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase">
                  Weekly Revenue
                </p>
                <h3 className="text-3xl font-bold text-primary">
                  KES {weeklySummary.totalValue.toLocaleString()}
                </h3>
              </div>
              <ShoppingCart className="w-8 h-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* ENTRY FORM */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Quick Sales Entry
              </CardTitle>
              <CardDescription>
                Record a new transaction instantly.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-grow">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Customer */}
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input placeholder="Optional" {...register('customerName')} />
                </div>

                {/* MULTI ITEM SECTION */}
                <div className="space-y-4">
                  {fields.map((field, index) => {
                    const quantity = Number(itemsWatch?.[index]?.quantity || 0);
                    const unitCost = Number(itemsWatch?.[index]?.unitCost || 0);
                    const lineTotal = quantity * unitCost;

                    return (
                      <div key={field.id} className="p-4 border rounded-lg space-y-4 bg-muted/20">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-semibold">
                            Item {index + 1}
                          </p>
                          {index > 0 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => remove(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Item Sold</Label>
                          <Input
                            {...register(`items.${index}.itemSold`)}
                            placeholder="Item name"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Qty</Label>
                            <Input
                              type="number"
                              {...register(`items.${index}.quantity`, {
                                valueAsNumber: true,
                              })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Unit Price</Label>
                            <Input
                              type="number"
                              {...register(`items.${index}.unitCost`, {
                                valueAsNumber: true,
                              })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Total</Label>
                            <Input
                              readOnly
                              className="bg-muted"
                              value={lineTotal}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      append({
                        itemSold: "",
                        quantity: 1,
                        unitCost: 0,
                      })
                    }
                  >
                    + Add Another Item
                  </Button>
                </div>

                {/* GRAND TOTAL */}
                <div className="flex justify-between items-center border-t pt-4">
                  <p className="text-sm font-medium">Grand Total</p>
                  <p className="text-xl font-bold text-primary">
                    KES {grandTotal.toLocaleString()}
                  </p>
                </div>

                {/* Payment Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select
                      onValueChange={(v) => setValue('paymentMethod', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Reference</Label>
                    <Input
                      disabled={paymentMethod === 'cash'}
                      {...register('paymentReference')}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : "Record Sale"}
                </Button>

              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* RECENT SALES (UNCHANGED) */}
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="h-full flex flex-col overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Recent Sales
              </CardTitle>
              <CardDescription>
                Your latest 5 activities.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-grow overflow-auto">
              <div className="space-y-3">
                {allSales.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-20 opacity-50">
                    <Info className="w-8 h-8 mb-2" />
                    <p>No sales activity found</p>
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
                        className="p-3 rounded-lg border bg-card/50 flex items-center justify-between group hover:border-primary/50 transition-all"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate">
                            {sale.customer_name || 'Walk-in'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {sale.item_sold}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1 uppercase">
                            {sale.payment_method} •{' '}
                            {new Date(sale.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 ml-4">
                          <p className="text-sm font-bold whitespace-nowrap">
                            KES {Number(sale.amount).toLocaleString()}
                          </p>

                          {sale.receipt_id && (
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-full"
                              onClick={() => handleDownload(sale)}
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
