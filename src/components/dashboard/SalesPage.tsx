import React, { useState, useEffect, useRef } from 'react';
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
import { ShoppingCart, Download, Check, ReceiptText, History, Info, ArrowLeft } from 'lucide-react';

const paymentMethods = [
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card Payment' },
];

export const SalesPage = () => {
  const [allSales, setAllSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user, accessToken } = useAuth();
  const businessId = user?.businessId;
  
  // Ref for auto-focusing the first input
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  const weeklySummary = React.useMemo(() => {
    if (!Array.isArray(allSales)) return { totalSales: 0, totalValue: 0 };
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklySales = allSales.filter(sale => new Date(sale.created_at) >= startOfWeek);
    return {
      totalSales: weeklySales.length,
      totalValue: weeklySales.reduce((sum, sale) => sum + Number(sale.amount || 0), 0),
    };
  }, [allSales]);

  const fetchSales = async () => {
    if (!user?.businessId || !accessToken) return;
    try {
      const res = await fetch(`https://n8n.aflows.uk/webhook/get-sales?business_id=${user.businessId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setAllSales(Array.isArray(data?.sales?.sales) ? data.sales.sales : []);
    } catch (err) {
      setAllSales([]);
    }
  };

  useEffect(() => {
    if (!user?.businessId) return;
    fetchSales();
    const interval = setInterval(fetchSales, 60000);
    return () => clearInterval(interval);
  }, [user?.businessId, accessToken]);

  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: { quantity: 1, unitCost: 0, amount: 0 },
  });

  const { ref, ...customerNameRest } = register('customerName');
  const paymentMethod = watch("paymentMethod");
  const quantityWatch = watch("quantity");
  const unitCostWatch = watch("unitCost");
  const calculatedAmount = (Number(quantityWatch) || 0) * (Number(unitCostWatch) || 0);

  useEffect(() => {
    setValue('amount', calculatedAmount, { shouldValidate: true });
  }, [calculatedAmount, setValue]);

  const handleDownload = async (sale: any) => {
    try {
      const res = await fetch(`https://n8n.aflows.uk/webhook/download-receipt?receipt_id=${sale.receipt_id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${sale.receipt_number || 'receipt'}.pdf`;
      link.click();
    } catch (err) {
      toast.error("Download failed");
    }
  };

  const onSubmit = async (data: SaleFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://n8n.aflows.uk/webhook/record-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, business_id: businessId }),
      });

      if (response.ok) {
        setIsSuccess(true);
        toast.success('Sale recorded!');
        reset();
        fetchSales();
        // Reset focus to the first input after a short delay
        setTimeout(() => {
          setIsSuccess(false);
          firstInputRef.current?.focus();
        }, 2000);
      }
    } catch (error) {
      toast.error('Error saving sale');
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-primary/5 border-none shadow-none"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Transactions</p><h3 className="text-3xl font-bold">{weeklySummary.totalSales}</h3></div><ReceiptText className="w-8 h-8 text-primary opacity-20" /></div></CardContent></Card>
        <Card className="bg-primary/5 border-none shadow-none"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Revenue (Weekly)</p><h3 className="text-3xl font-bold text-primary">KES {weeklySummary.totalValue.toLocaleString()}</h3></div><ShoppingCart className="w-8 h-8 text-primary opacity-20" /></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <Card className="h-full flex flex-col shadow-sm border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><ShoppingCart className="w-5 h-5 text-primary" />Quick Entry</CardTitle>
            <CardDescription>Enter transaction details below.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input 
                    placeholder="e.g. Jane Doe" 
                    {...customerNameRest} 
                    ref={(e) => { ref(e); firstInputRef.current = e; }} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Item Sold</Label>
                  <Input placeholder="Service or Item" {...register('itemSold')} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Qty</Label><Input type="number" {...register('quantity', { valueAsNumber: true })} /></div>
                <div className="space-y-2"><Label>Price</Label><Input type="number" {...register('unitCost', { valueAsNumber: true })} /></div>
                <div className="space-y-2"><Label>Total</Label><div className="h-10 px-3 flex items-center rounded-md bg-muted font-bold text-primary">KES {calculatedAmount.toLocaleString()}</div></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select onValueChange={(v) => setValue('paymentMethod', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{paymentMethods.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reference Code</Label>
                  <Input placeholder="M-Pesa Ref / Check #" disabled={paymentMethod === 'cash'} {...register('paymentReference')} />
                </div>
              </div>
              <Button 
                type="submit" 
                variant={isSuccess ? "outline" : "hero"} 
                className={`w-full py-6 transition-all duration-300 ${isSuccess ? 'border-green-500 text-green-600' : ''}`} 
                disabled={isLoading || isSuccess}
              >
                {isLoading ? <LoadingSpinner size="sm" /> : isSuccess ? <><Check className="mr-2 h-5 w-5" /> Saved Successfully</> : "Record Sale"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="h-full flex flex-col overflow-hidden shadow-sm border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-xl"><History className="w-5 h-5 text-primary" />Recent History</CardTitle>
            <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded">Latest 5</span>
          </CardHeader>
          <CardContent className="flex-grow overflow-auto p-6 pt-2">
            <div className="space-y-3">
              {allSales.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-24 text-center">
                  <div className="relative mb-4">
                    <div className="absolute -right-8 -top-4 animate-bounce text-primary"><ArrowLeft className="w-6 h-6" /></div>
                    <Info className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                  <p className="font-medium text-muted-foreground">No sales recorded yet.</p>
                  <p className="text-xs text-muted-foreground/60 max-w-[200px] mt-1">Start by adding your first transaction on the left.</p>
                </div>
              ) : (
                [...allSales].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5).map((sale) => (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} key={sale.id ?? sale.created_at} className="p-4 rounded-xl border bg-card/50 flex items-center justify-between group hover:shadow-md transition-all">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold truncate">{sale.customer_name || 'Walk-in'}</p>
                      <p className="text-xs text-muted-foreground truncate">{sale.item_sold || sale.item}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">{sale.payment_method}</span>
                        <span className="text-[10px] text-muted-foreground/70">{new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <p className="text-sm font-black text-primary">KES {Number(sale.amount).toLocaleString()}</p>
                      {sale.receipt_id && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary/10 rounded-full" onClick={() => handleDownload(sale)}>
                          <Download className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
