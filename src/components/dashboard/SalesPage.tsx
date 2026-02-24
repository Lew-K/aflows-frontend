import React, { useState, useEffect } from 'react';
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
import { ShoppingCart, Download, Clock, CreditCard, Tag } from 'lucide-react';

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

  // --- LOGIC: FETCH SALES (Original logic preserved) ---
  const fetchSales = async () => {
    if (!businessId || !accessToken) return;
    try {
      const res = await fetch(`https://n8n.aflows.uk/webhook/get-sales?business_id=${businessId}`, {
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
    fetchSales();
    const interval = setInterval(fetchSales, 60000);
    return () => clearInterval(interval);
  }, [businessId, accessToken]);

  // --- LOGIC: WEEKLY SUMMARY ---
  const weeklySummary = React.useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0,0,0,0);
    const weeklySales = allSales.filter(s => new Date(s.created_at) >= startOfWeek);
    return {
      count: weeklySales.length,
      total: weeklySales.reduce((sum, s) => sum + Number(s.amount || 0), 0)
    };
  }, [allSales]);

  // --- LOGIC: FORM HANDLING ---
  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: { quantity: 1, unitCost: 0, amount: 0 },
  });

  const quantityWatch = watch("quantity");
  const unitCostWatch = watch("unitCost");
  const calculatedAmount = (Number(quantityWatch) || 0) * (Number(unitCostWatch) || 0);

  useEffect(() => {
    setValue('amount', calculatedAmount);
  }, [calculatedAmount, setValue]);

  const onSubmit = async (data: SaleFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://n8n.aflows.uk/webhook/record-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, business_id: businessId }),
      });
      if (response.ok) {
        toast.success('Sale recorded successfully!');
        reset();
        fetchSales();
      }
    } catch (error) {
      toast.error('Failed to record sale');
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIC: DOWNLOAD RECEIPT ---
  const handleDownload = async (receiptId: string, receiptNumber?: string) => {
    try {
      const res = await fetch(`https://n8n.aflows.uk/webhook/download-receipt?receipt_id=${receiptId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt-${receiptNumber || receiptId}.pdf`;
      link.click();
    } catch (err) {
      toast.error("Download failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10 px-4">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-white">Sales Dashboard</h1>
        <p className="text-muted-foreground text-sm">Track, record, and review your business sales in real time.</p>
      </div>

      {/* Stats Cards - Unified and Consistent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/40 border-white/10">
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Sales (This Week)</p>
            <p className="text-4xl font-bold text-white mt-2">{weeklySummary.count}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-white/10">
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Value (This Week)</p>
            <p className="text-4xl font-bold text-white mt-2">KES {weeklySummary.total.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Sales Entry */}
        <Card className="lg:col-span-8 bg-card border-white/5 rounded-xl">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingCart size={18} className="text-primary" /> Quick Sales Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input {...register('customerName')} placeholder="Joyce K" className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Item Sold / Service Rendered</Label>
                  <Input {...register('itemSold')} placeholder="iPhone 13" className="bg-white/5 border-white/10" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Units / Quantity</Label>
                  <Input type="number" {...register('quantity', { valueAsNumber: true })} className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Price per Unit</Label>
                  <Input type="number" {...register('unitCost', { valueAsNumber: true })} className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Amount (KES)</Label>
                  <div className="h-10 flex items-center px-3 bg-primary/10 border border-primary/20 rounded-md text-primary font-bold">
                    {calculatedAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select onValueChange={(v) => setValue('paymentMethod', v)}>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Select Method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Payment Reference</Label>
                  <Input {...register('paymentReference')} placeholder="M-Pesa Ref" className="bg-white/5 border-white/10" />
                </div>
              </div>

              <Button type="submit" variant="hero" className="w-full h-11 text-black font-bold" disabled={isLoading}>
                {isLoading ? <LoadingSpinner size="sm" /> : "Record Sale"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card className="lg:col-span-4 bg-card/40 border-white/5 rounded-xl">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock size={16} className="text-primary" /> Recent Sales
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {allSales.slice(0, 5).map((sale, i) => (
                <div key={i} className="flex justify-between items-start border-b border-white/5 pb-4 last:border-0">
                  <div className="space-y-1">
                    {/* Fixed Logic: Explicitly using sale.customer_name from n8n response */}
                    <p className="text-sm font-bold text-white leading-none">
                      {sale.customer_name || 'Walk-in Customer'}
                    </p>
                    <p className="text-xs text-primary flex items-center gap-1">
                      <Tag size={10} /> {sale.item_sold}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      {sale.payment_method} • {new Date(sale.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="text-sm font-bold text-white">KES {Number(sale.amount).toLocaleString()}</p>
                    {sale.receipt_id && (
                      <Button 
                        size="icon" variant="ghost" className="h-7 w-7 text-primary hover:bg-primary/10" 
                        onClick={() => handleDownload(sale.receipt_id, sale.receipt_number)}
                      >
                        <Download size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

