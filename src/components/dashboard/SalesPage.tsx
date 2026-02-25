import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { ShoppingCart, Download, Check, ReceiptText, TrendingUp, History } from 'lucide-react';

const paymentMethods = [
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card Payment' },
];

export const SalesPage = () => {
  const [allSales, setAllSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const { user, accessToken } = useAuth();
  const businessId = user?.businessId;

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
      const sales = Array.isArray(data?.sales?.sales) ? data.sales.sales : [];
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

  const paymentMethod = watch("paymentMethod");
  const quantityWatch = watch("quantity");
  const unitCostWatch = watch("unitCost");
  const calculatedAmount = (Number(quantityWatch) || 0) * (Number(unitCostWatch) || 0);

  useEffect(() => {
    setValue('amount', calculatedAmount, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [calculatedAmount, setValue]);

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
            item_sold: data.itemSold,
            quantity: data.quantity,
            unit_cost: data.unitCost,
            amount: data.amount,
            payment_method: data.paymentMethod || null,
            payment_reference: data.paymentReference || null,
          }),
        }
      );

      let result: any = {};
      const text = await response.text();
      if (text) {
        try { result = JSON.parse(text); } catch { console.warn("Not valid JSON", text); }
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

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-6">
      {/* Header Section */}
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Sales Dashboard</h1>
        <p className="text-muted-foreground">Track, record, and review your business sales in real time.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="relative overflow-hidden border-none bg-primary/5 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Sales</p>
                <p className="text-3xl font-bold mt-1">
                  {weeklySummary.totalSales === 0 ? "0" : weeklySummary.totalSales}
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <ReceiptText className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-muted-foreground">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <TrendingUp className="w-3 h-3" /> Active
              </span>
              <span className="ml-2">Current Week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none bg-primary/5 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Value</p>
                <p className="text-3xl font-bold mt-1 text-primary">
                  {weeklySummary.totalValue === 0
                    ? "KES 0"
                    : `KES ${weeklySummary.totalValue.toLocaleString()}`}
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              Across {weeklySummary.totalSales} transactions this week
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form Column */}
        <motion.div 
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-md border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Quick Sales Entry
              </CardTitle>
              <CardDescription>Enter details of the new transaction below.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input id="customerName" placeholder="e.g. John Doe" {...register('customerName')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="itemSold">Item / Service</Label>
                    <Input id="itemSold" placeholder="What was sold?" {...register('itemSold')} />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input id="quantity" type="number" {...register('quantity', { valueAsNumber: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitCost">Unit Price</Label>
                    <Input id="unitCost" type="number" {...register('unitCost', { valueAsNumber: true })} />
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label htmlFor="amount">Total (KES)</Label>
                    <Input id="amount" className="bg-muted font-bold" readOnly value={calculatedAmount.toLocaleString()} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select onValueChange={(value) => setValue('paymentMethod', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((m) => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentReference">Reference Code</Label>
                    <Input 
                      id="paymentReference" 
                      placeholder="Ref number" 
                      disabled={paymentMethod === "cash"} 
                      {...register('paymentReference')} 
                    />
                  </div>
                </div>

                <Button type="submit" variant="hero" className="w-full py-6 text-lg shadow-lg shadow-primary/20" disabled={isLoading}>
                  {isLoading ? <LoadingSpinner size="sm" /> : <><Check className="w-5 h-5 mr-2" /> Record Sale</>}
                </Button>

                <AnimatePresence>
                  {receiptUrl && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
                          <Check className="w-4 h-4" /> Receipt Ready
                        </div>
                        <Button variant="outline" size="sm" className="bg-white">
                          <Download className="w-4 h-4 mr-2" /> Download
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* List Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              Recent Activity
            </h2>
            <span className="text-xs text-muted-foreground">Last 5 sales</span>
          </div>

          <div className="space-y-3">
            {allSales.length === 0 ? (
              <Card className="border-dashed py-12">
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <div className="p-3 bg-muted rounded-full mb-4">
                    <ShoppingCart className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">No sales recorded yet</p>
                </CardContent>
              </Card>
            ) : (
              [...allSales]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5)
                .map((sale) => (
                  <motion.div
                    key={sale.id ?? sale.created_at}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors flex items-center justify-between shadow-sm"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-sm leading-none">
                        {sale.customer_name || 'Walk-in Customer'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {sale.item_sold || sale.item}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground uppercase">
                          {sale.payment_method}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(sale.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <p className="text-sm font-bold text-primary">
                        KES {Number(sale.amount).toLocaleString()}
                      </p>
                      {sale.receipt_id && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {/* logic kept internal as per original */}}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
