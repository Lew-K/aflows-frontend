import { apiFetch } from '@/lib/apiFetch';

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
import { ShoppingCart, Download, Check, ReceiptText, History, Info } from 'lucide-react';

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

  const [items, setItems] = useState([
    { item: "", quantity: 1, unitCost: 0 }
  ]);


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
      const res = await apiFetch(
        `https://n8n.aflows.uk/webhook/get-sales?business_id=${user.businessId}`
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
      paymentMethod: "cash",
      customerName: "",
      itemSold: "",
      paymentReference: "",
    },
  });

  const paymentMethod = watch("paymentMethod");
  const calculatedAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0
  );

  

  const handleDownload = async (sale: any) => {
    try {
      if (!accessToken) {
        toast.error("Session expired.");
        return;
      }

      const receiptId =
        sale.receipt_id ||
        sale.receipt_number ||
        sale.id;
  
      if (!receiptId) {
        toast.error("Receipt not available");
        return;
      }

      const res = await apiFetch(
        `https://n8n.aflows.uk/webhook/download-receipt?receipt_id=${receiptId}`
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

  const onSubmit = async (data: SaleFormData) => {
    setIsLoading(true);
    try {
      const response = await apiFetch(
        'https://n8n.aflows.uk/webhook/record-sales',
        {
          method: 'POST',
          // headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_id: businessId,
            customer_name: data.customerName || null,
            items: items,
            total_amount: calculatedAmount,
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
        setItems([{ item: "", quantity: 1, unitCost: 0 }]);
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
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Sales Dashboard</h1>
        <p className="text-muted-foreground text-lg">Manage transactions and monitor performance.</p>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-primary/5 border-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase">Weekly Sales</p>
                <h3 className="text-3xl font-bold">{weeklySummary.totalSales}</h3>
              </div>
              <ReceiptText className="w-8 h-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase">Weekly Revenue</p>
                <h3 className="text-3xl font-bold text-primary">
                  KES {weeklySummary.totalValue.toLocaleString()}
                </h3>
              </div>
              <ShoppingCart className="w-8 h-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equal Height Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Entry Form */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Quick Sales Entry
              </CardTitle>
              <CardDescription>Record a new transaction instantly.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Customer Name</Label>
                    <Input placeholder="Enter customer name" {...register('customerName')} />
                  </div>
                  {/* Items Section */}
                  <div className="space-y-3">
                  
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
                      <div className="col-span-5">Item / Service</div>
                      <div className="col-span-2 text-center">Qty</div>
                      <div className="col-span-2 text-center">Price</div>
                      <div className="col-span-2 text-right">Subtotal</div>
                      <div className="col-span-1"></div>
                    </div>
                  
                    {/* Scrollable Items */}
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {items.map((entry, index) => {
                        const subtotal = entry.quantity * entry.unitCost;
                  
                        return (
                          <div
                            key={index}
                            className="grid grid-cols-12 gap-2 items-center bg-muted/30 rounded-md p-2"
                          >
                            <div className="col-span-5">
                              <Input
                                placeholder="e.g. 13kg Refill or Cleaning"
                                value={entry.item}
                                className="h-8"
                                onChange={(e) => {
                                  const updated = [...items];
                                  updated[index].item = e.target.value;
                                  setItems(updated);
                                }}
                              />
                            </div>
                  
                            <div className="col-span-2">
                              <Input
                                type="number"
                                min="1"
                                value={entry.quantity}
                                className="h-8 text-center"
                                onChange={(e) => {
                                  const updated = [...items];
                                  updated[index].quantity = Number(e.target.value);
                                  setItems(updated);
                                }}
                              />
                            </div>
                  
                            <div className="col-span-2">
                              <Input
                                type="number"
                                min="0"
                                value={entry.unitCost}
                                className="h-8 text-center"
                                onChange={(e) => {
                                  const updated = [...items];
                                  updated[index].unitCost = Number(e.target.value);
                                  setItems(updated);
                                }}
                              />
                            </div>
                  
                            <div className="col-span-2 text-right text-sm font-semibold">
                              {subtotal > 0 ? `KES ${subtotal.toLocaleString()}` : "-"}
                            </div>
                  
                            <div className="col-span-1 text-right">
                              {items.length > 1 && (
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() =>
                                    setItems(items.filter((_, i) => i !== index))
                                  }
                                >
                                  ✕
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  
                    {/* Add Item Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-sm text-primary"
                      onClick={() =>
                        setItems([...items, { item: "", quantity: 1, unitCost: 0 }])
                      }
                    >
                      + Add Item
                    </Button>
                  </div>


                  
                  <div className="flex justify-between items-center border-t pt-3 mt-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Total
                    </span>
                    <span className="text-lg font-bold text-primary">
                      KES {calculatedAmount.toLocaleString()}
                    </span>
                  </div>

                  
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={(v) => setValue('paymentMethod', v)}
                    >
                      <SelectTrigger><SelectValue placeholder="Method" /></SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Reference</Label>
                    <Input
                      placeholder={
                        paymentMethod === 'cash'
                          ? "Not required for cash payments"
                          : "e.g. MPESA code, bank ref, transaction ID"
                      }
                      disabled={paymentMethod === 'cash'}
                      {...register('paymentReference')}
                    />                  </div>
                </div>
                <Button type="submit" variant="hero" className="w-full mt-2" disabled={isLoading}>
                  {isLoading ? <LoadingSpinner size="sm" /> : "Record Sale"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Sales - Equal Height */}
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="h-full flex flex-col overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Recent Sales
                </CardTitle>
                <CardDescription>Your latest 5 activities.</CardDescription>
              </div>
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
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 5)
                    .map((sale) => (
                      <div key={sale.id ?? sale.created_at} className="p-3 rounded-lg border bg-card/50 flex items-center justify-between group hover:border-primary/50 transition-all">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate">{sale.customer_name || 'Walk-in'}</p>
                          <p className="text-xs text-muted-foreground truncate">{sale.item_sold || sale.item}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 uppercase">{sale.payment_method} • {new Date(sale.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <p className="text-sm font-bold whitespace-nowrap">KES {Number(sale.amount).toLocaleString()}</p>

                          {(sale.receipt_id || sale.receipt_number) && (
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
