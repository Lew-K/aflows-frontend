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
import { ShoppingCart, Download, Check, TrendingUp, Clock, User, Package, CreditCard, Calendar } from 'lucide-react';

const paymentMethods = [
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card Payment' },
];

export const SalesPage = () => {
  const [allSales, setAllSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { user, accessToken } = useAuth();
  
  // LOGIC: Fetch Sales
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
    fetchSales();
    const interval = setInterval(fetchSales, 60000);
    return () => clearInterval(interval);
  }, [user?.businessId, accessToken]);

  const weeklySummary = React.useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const weeklySales = allSales.filter(s => new Date(s.created_at) >= startOfWeek);
    return {
      count: weeklySales.length,
      total: weeklySales.reduce((sum, s) => sum + Number(s.amount || 0), 0)
    };
  }, [allSales]);

  // LOGIC: Restored Receipt Download
  const handleDownload = async (id: string, ref?: string) => {
    try {
      const res = await fetch(`https://n8n.aflows.uk/webhook/download-receipt?receipt_id=${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${ref || id}.pdf`;
      a.click();
    } catch (err) {
      toast.error("Download failed");
    }
  };

  // NEW LOGIC: Bulk Export
  const handleBulkExport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsExporting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch(`https://n8n.aflows.uk/webhook/export-sales?business_id=${user?.businessId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          start_date: formData.get('startDate'),
          end_date: formData.get('endDate')
        })
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sales-report-${formData.get('startDate')}-to-${formData.get('endDate')}.pdf`;
      a.click();
      toast.success("Report generated");
    } catch (err) {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const { register, handleSubmit, setValue, reset, watch } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: { quantity: 1, unitCost: 0, amount: 0 },
  });

  const calculatedAmount = (Number(watch("quantity")) || 0) * (Number(watch("unitCost")) || 0);
  useEffect(() => { setValue('amount', calculatedAmount); }, [calculatedAmount, setValue]);

  const onSubmit = async (data: SaleFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch('https://n8n.aflows.uk/webhook/record-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, business_id: user?.businessId }),
      });
      if (res.ok) { toast.success('Sale recorded'); reset(); fetchSales(); }
    } catch (error) { toast.error('Error recording sale'); } finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-10">
      {/* Balanced Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Sales Dashboard</h1>
        <p className="text-muted-foreground text-sm">Track, record, and review your business sales in real time.</p>
      </div>

      {/* Consistent Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-card/40 border-white/5">
          <CardContent className="p-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Sales (This Week)</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-bold text-white">{weeklySummary.count}</p>
              <span className="text-primary text-xs font-bold">Transactions</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-white/5">
          <CardContent className="p-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Revenue (This Week)</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-bold text-white">KES {weeklySummary.total.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-white/10 border-dashed">
          <CardContent className="p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Export Sales Records</p>
            <form onSubmit={handleBulkExport} className="flex gap-2">
              <Input name="startDate" type="date" className="h-8 text-[10px] bg-white/5 border-white/10" required />
              <Input name="endDate" type="date" className="h-8 text-[10px] bg-white/5 border-white/10" required />
              <Button type="submit" size="sm" className="h-8 px-2 text-[10px]" disabled={isExporting}>
                {isExporting ? <LoadingSpinner size="xs" /> : <Download size={12} />}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Sales Entry */}
        <Card className="xl:col-span-8 bg-card border-white/5 shadow-xl rounded-2xl">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-lg flex items-center gap-2 text-white/80">
              <ShoppingCart size={18} className="text-primary" /> Quick Sales Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Customer Name</Label>
                  <Input {...register('customerName')} placeholder="e.g. Joyce K" className="bg-white/5 border-white/10 h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Item Sold / Service Rendered</Label>
                  <Input {...register('itemSold')} placeholder="e.g. iPhone 13" className="bg-white/5 border-white/10 h-11" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Units / Quantity</Label>
                  <Input type="number" {...register('quantity', { valueAsNumber: true })} className="bg-white/5 border-white/10 h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Price per Unit</Label>
                  <Input type="number" {...register('unitCost', { valueAsNumber: true })} className="bg-white/5 border-white/10 h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Amount (KES)</Label>
                  <div className="h-11 flex items-center px-4 bg-primary/10 border border-primary/20 rounded-md text-primary font-bold">
                    {calculatedAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Payment Method</Label>
                  <Select onValueChange={(v) => setValue('paymentMethod', v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-11">
                      <SelectValue placeholder="Select Method" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/10">
                      {paymentMethods.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Payment Reference</Label>
                  <Input {...register('paymentReference')} placeholder="M-Pesa ID / Ref" className="bg-white/5 border-white/10 h-11" />
                </div>
              </div>

              <Button type="submit" variant="hero" className="w-full h-12 text-black font-bold uppercase tracking-wider" disabled={isLoading}>
                {isLoading ? <LoadingSpinner size="sm" /> : "Record Sale"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Sales List */}
        <Card className="xl:col-span-4 bg-card/40 border-white/5 rounded-2xl flex flex-col">
          <CardHeader className="p-6 border-b border-white/5 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock size={16} className="text-primary" /> Recent Sales
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex-grow">
            <div className="space-y-3">
              {allSales.slice(0, 6).map((sale, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex justify-between items-start group">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">{sale.customer_name || 'Walk-in'}</p>
                    <p className="text-xs text-primary font-medium">{sale.item_sold}</p>
                    <div className="flex gap-2 items-center text-[10px] text-muted-foreground">
                      <span className="capitalize">{sale.payment_method}</span>
                      <span>•</span>
                      <span>{new Date(sale.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="text-sm font-bold text-white">KES {Number(sale.amount).toLocaleString()}</p>
                    {sale.receipt_id && (
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-primary hover:bg-primary/10" onClick={() => handleDownload(sale.receipt_id, sale.receipt_number)}>
                        <Download size={12} />
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
