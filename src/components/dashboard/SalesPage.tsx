import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { ShoppingCart, Download, Check, TrendingUp, Activity, User, Package, CreditCard, Sparkles } from 'lucide-react';

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

  // LOGIC: Fetch Sales
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

  // LOGIC: Weekly Summary
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

  // LOGIC: Receipt Download
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

  // LOGIC: Form Handling
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

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-10">
      {/* Refined Modern Header */}
      <div className="flex flex-col gap-2 border-b border-white/5 pb-8">
        <div className="flex items-center gap-2">
           <Sparkles className="text-primary w-5 h-5" />
           <span className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Transaction Management</span>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">Sales Command</h1>
        <p className="text-muted-foreground text-base max-w-xl">
          Complete, track, and audit your business transactions with real-time accuracy.
        </p>
      </div>

      {/* Stats Overview - Now 3 Columns for better centering */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/40 border-white/5 overflow-hidden relative group">
          <CardContent className="p-8">
            <p className="text-xs font-bold text-primary uppercase tracking-widest">Weekly Volume</p>
            <p className="text-4xl font-bold text-white mt-2">
              {weeklySummary.totalSales || "0"}
            </p>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
               Live stream active
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-white/5 md:col-span-2 overflow-hidden relative group">
          <CardContent className="p-8 flex flex-col justify-between h-full">
            <div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest">Gross Revenue (7D)</p>
                <p className="text-4xl font-bold text-white mt-2">
                  KES {weeklySummary.totalValue.toLocaleString()}
                </p>
            </div>
            <div className="w-full bg-white/5 h-1 rounded-full mt-6 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2 }} className="h-full bg-primary/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Expanded Sales Entry Form */}
        <motion.div className="xl:col-span-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card border-white/5 shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/[0.01] p-10">
              <CardTitle className="text-2xl flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    <ShoppingCart size={24} />
                </div>
                Record Transaction
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">Client Identity</Label>
                    <div className="relative">
                        <User className="absolute left-4 top-4 w-4 h-4 text-white/20" />
                        <Input {...register('customerName')} placeholder="e.g. Walk-in Customer" className="pl-12 bg-white/[0.03] border-white/10 h-14 focus:border-primary transition-all rounded-2xl" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">Service or Product</Label>
                    <div className="relative">
                        <Package className="absolute left-4 top-4 w-4 h-4 text-white/20" />
                        <Input {...register('itemSold')} placeholder="Specify item" className="pl-12 bg-white/[0.03] border-white/10 h-14 focus:border-primary transition-all rounded-2xl" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <Label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">Quantity</Label>
                    <Input type="number" {...register('quantity', { valueAsNumber: true })} className="bg-white/[0.03] border-white/10 h-14 focus:border-primary rounded-2xl" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">Unit Value</Label>
                    <Input type="number" {...register('unitCost', { valueAsNumber: true })} className="bg-white/[0.03] border-white/10 h-14 focus:border-primary rounded-2xl text-primary font-bold" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">Gross Total (KES)</Label>
                    <div className="h-14 flex items-center px-6 bg-primary/5 border border-primary/20 rounded-2xl font-black text-primary text-lg">
                        {calculatedAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">Method of Payment</Label>
                    <Select onValueChange={(value) => setValue('paymentMethod', value)}>
                      <SelectTrigger className="h-14 bg-white/[0.03] border-white/10 rounded-2xl">
                        <SelectValue placeholder="Select Method" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0A0A0A] border-white/10">
                        {paymentMethods.map((m) => (
                          <SelectItem key={m.value} value={m.value} className="focus:bg-primary/20">{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-1">Transaction Reference</Label>
                    <Input disabled={paymentMethod === "cash"} {...register('paymentReference')} placeholder="Ref Code" className="bg-white/[0.03] border-white/10 h-14 focus:border-primary rounded-2xl" />
                  </div>
                </div>

                <Button type="submit" variant="hero" className="w-full h-16 rounded-2xl text-black font-black text-xl shadow-2xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]" disabled={isLoading}>
                  {isLoading ? <LoadingSpinner size="sm" /> : <span className="flex items-center gap-3 tracking-tight">Finalize Transaction <Check size={22} strokeWidth={3} /></span>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Live Audit Trail List */}
        <div className="xl:col-span-4 space-y-6">
          <Card className="bg-card/40 border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col h-full">
            <CardHeader className="p-8 border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-3">
                <Activity size={20} className="text-primary" />
                Live Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-grow">
              {allSales.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
                   <Activity size={48} className="mb-4" />
                   <p className="text-sm font-bold uppercase tracking-widest text-center">Awaiting Data...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {[...allSales]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 7)
                    .map((sale, i) => (
                      <motion.div
                        key={sale.id || i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.05] transition-all"
                      >
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black text-white/40">
                                {sale.payment_method?.substring(0, 2).toUpperCase() || 'TX'}
                           </div>
                           <div className="max-w-[120px]">
                              <p className="font-bold text-sm text-white truncate">{sale.customer_name || 'Walk-in'}</p>
                              <p className="text-[10px] text-white/30 uppercase tracking-tighter">{new Date(sale.created_at).toLocaleTimeString()}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="font-black text-sm text-primary">KES {Number(sale.amount).toLocaleString()}</p>
                            </div>
                            {sale.receipt_id && (
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-9 w-9 rounded-xl bg-white/5 text-primary hover:bg-primary/20"
                                    onClick={() => handleDownloadReceipt(sale.receipt_id, sale.receipt_number)}
                                >
                                    <Download size={14} />
                                </Button>
                            )}
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
