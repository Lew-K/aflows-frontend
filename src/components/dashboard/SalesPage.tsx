import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ShoppingCart, Download, Check, TrendingUp, History, User, Package, CreditCard, Receipt } from 'lucide-react';

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

  // --- LOGIC: FETCH SALES ---
  const fetchSales = async () => {
    if (!user?.businessId || !accessToken) return;
    try {
      const res = await fetch(`https://n8n.aflows.uk/webhook/get-sales?business_id=${user.businessId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
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

  // --- LOGIC: WEEKLY SUMMARY ---
  const weeklySummary = React.useMemo(() => {
    if (!Array.isArray(allSales)) return { totalSales: 0, totalValue: 0 };
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    startOfWeek.setHours(0, 0, 0, 0);
    const weeklySales = allSales.filter((sale) => new Date(sale.created_at) >= startOfWeek);
    return {
      totalSales: weeklySales.length,
      totalValue: weeklySales.reduce((sum, sale) => sum + Number(sale.amount || 0), 0),
    };
  }, [allSales]);

  // --- LOGIC: FORM HANDLING ---
  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: { quantity: 1, unitCost: 0, amount: 0, paymentMethod: undefined },
  });

  const paymentMethod = watch("paymentMethod");
  const quantityWatch = watch("quantity");
  const unitCostWatch = watch("unitCost");
  const calculatedAmount = (Number(quantityWatch) || 0) * (Number(unitCostWatch) || 0);

  useEffect(() => {
    setValue('amount', calculatedAmount, { shouldValidate: true, shouldDirty: true });
  }, [calculatedAmount, setValue]);

  const onSubmit = async (data: SaleFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://n8n.aflows.uk/webhook/record-sales', {
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
      });
      if (response.ok) {
        toast.success('Sale recorded successfully!');
        reset();
        fetchSales();
      } else {
        toast.error('Failed to record sale');
      }
    } catch (error) {
      toast.error('Something went wrong!');
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIC: DOWNLOAD RECEIPT (Restored) ---
  const handleDownloadReceipt = async (receiptId: string, receiptNumber?: string) => {
    try {
      if (!accessToken) {
        toast.error("Session expired.");
        return;
      }
      const res = await fetch(
        `https://n8n.aflows.uk/webhook/download-receipt?receipt_id=${receiptId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${receiptNumber || 'receipt'}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to download receipt");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      {/* Centered Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/40 border-white/5">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest">Weekly Sales</p>
              <p className="text-3xl font-bold text-white mt-1">
                {weeklySummary.totalSales || "0"}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl text-primary"><TrendingUp size={24} /></div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-white/5 md:col-span-2">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest">Total Revenue (Weekly)</p>
              <p className="text-3xl font-bold text-white mt-1">
                KES {weeklySummary.totalValue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl text-primary"><CreditCard size={24} /></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sale Entry Form */}
        <Card className="lg:col-span-7 bg-card border-white/5 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-white/[0.02] border-b border-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Quick Sales Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-white/50 ml-1">Customer Name</Label>
                  <Input {...register('customerName')} placeholder="Optional" className="bg-white/5 border-white/10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-white/50 ml-1">Item Sold</Label>
                  <Input {...register('itemSold')} placeholder="e.g. Consulting" className="bg-white/5 border-white/10 rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-white/50 ml-1">Quantity</Label>
                  <Input type="number" {...register('quantity', { valueAsNumber: true })} className="bg-white/5 border-white/10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-white/50 ml-1">Unit Price</Label>
                  <Input type="number" {...register('unitCost', { valueAsNumber: true })} className="bg-white/5 border-white/10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-white/50 ml-1">Amount</Label>
                  <div className="h-10 flex items-center px-3 bg-primary/10 border border-primary/20 rounded-xl text-primary font-bold">
                    {calculatedAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-white/50 ml-1">Payment Method</Label>
                  <Select onValueChange={(value) => setValue('paymentMethod', value)}>
                    <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                      <SelectValue placeholder="Select Method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-white/50 ml-1">Reference Code</Label>
                  <Input disabled={paymentMethod === 'cash'} {...register('paymentReference')} placeholder="Ref ID" className="bg-white/5 border-white/10 rounded-xl" />
                </div>
              </div>

              <Button type="submit" variant="hero" className="w-full h-12 rounded-xl text-black font-bold" disabled={isLoading}>
                {isLoading ? <LoadingSpinner size="sm" /> : <span className="flex items-center gap-2">Record Sale <Check size={16} /></span>}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* History List */}
        <Card className="lg:col-span-5 bg-card/40 border-white/5 rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2"><History size={18} className="text-primary" /> History</CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchSales} className="text-[10px] uppercase text-primary/60">Refresh</Button>
          </CardHeader>
          <CardContent className="p-4">
            {allSales.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">No sales yet.</div>
            ) : (
              <div className="space-y-2">
                {[...allSales].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5).map((sale, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{sale.customer_name || 'Walk-in Customer'}</p>
                      <p className="text-[11px] text-white/40 truncate">{sale.item_sold}</p>
                    </div>
                    <div className="text-right mx-4">
                      <p className="text-sm font-bold text-primary">KES {Number(sale.amount).toLocaleString()}</p>
                      <p className="text-[10px] text-white/30">{new Date(sale.created_at).toLocaleTimeString()}</p>
                    </div>
                    {sale.receipt_id ? (
                      <Button 
                        size="icon" variant="ghost" 
                        onClick={() => handleDownloadReceipt(sale.receipt_id, sale.receipt_number)}
                        className="text-primary hover:bg-primary/20"
                      >
                        <Download size={14} />
                      </Button>
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center"><LoadingSpinner size="xs" /></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
