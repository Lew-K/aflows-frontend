import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { saleSchema, type SaleFormData } from '@/lib/validation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ShoppingCart, Download, Check, ReceiptText, History, Info, Plus, Trash2 } from 'lucide-react';

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
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize form with an 'items' array
  const { register, control, handleSubmit, setValue, reset, watch } = useForm<any>({
    defaultValues: {
      customerName: '',
      paymentMethod: '',
      paymentReference: '',
      items: [{ itemSold: '', quantity: 1, unitCost: 0 }]
    },
  });

  // useFieldArray handles the "Add Another Item" logic
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchItems = watch("items");
  const paymentMethod = watch("paymentMethod");

  // Dynamic Grand Total calculation
  const grandTotal = watchItems.reduce((acc: number, curr: any) => {
    return acc + (Number(curr.quantity || 0) * Number(curr.unitCost || 0));
  }, 0);

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
    if (user?.businessId) {
      fetchSales();
      const interval = setInterval(fetchSales, 60000);
      return () => clearInterval(interval);
    }
  }, [user?.businessId, accessToken]);

  const handleDownload = async (sale: any) => {
    try {
      const res = await fetch(`https://n8n.aflows.uk/webhook/download-receipt?receipt_id=${sale.receipt_id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
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

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://n8n.aflows.uk/webhook/record-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...data, 
          business_id: businessId,
          total_amount: grandTotal // Sending the calculated sum to your backend
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        toast.success('Sale recorded successfully!');
        reset({
          customerName: '',
          paymentMethod: '',
          paymentReference: '',
          items: [{ itemSold: '', quantity: 1, unitCost: 0 }]
        });
        fetchSales();
        setTimeout(() => {
          setIsSuccess(false);
          firstInputRef.current?.focus();
        }, 2000);
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
        <p className="text-muted-foreground text-lg">Manage multi-item transactions.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Entry Form */}
        <Card className="h-full flex flex-col border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Quick Sales Entry
              </CardTitle>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="text-xs h-8 gap-1 border-primary/20 text-primary hover:bg-primary/5"
              onClick={() => append({ itemSold: '', quantity: 1, unitCost: 0 })}
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </Button>
          </CardHeader>
          
          <CardContent className="flex-grow space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input 
                  placeholder="Optional" 
                  {...register('customerName')}
                  ref={(e) => {
                    register('customerName').ref(e);
                    firstInputRef.current = e;
                  }}
                />
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {fields.map((field, index) => (
                    <motion.div 
                      key={field.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 rounded-lg border bg-secondary/5 relative space-y-3 overflow-hidden"
                    >
                      <div className="flex justify-between items-center pr-8">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Item #{index + 1}</Label>
                        {fields.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => remove(index)}
                            className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <Input placeholder="Item name" {...register(`items.${index}.itemSold`)} />
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-[10px]">Qty</Label>
                          <Input type="number" {...register(`items.${index}.quantity`, { valueAsNumber: true })} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px]">Price</Label>
                          <Input type="number" {...register(`items.${index}.unitCost`, { valueAsNumber: true })} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] text-right block">Subtotal</Label>
                          <div className="h-10 flex items-center justify-end font-bold text-sm">
                            {(watchItems[index]?.quantity * watchItems[index]?.unitCost || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select onValueChange={(v) => setValue('paymentMethod', v)}>
                    <SelectTrigger><SelectValue placeholder="Method" /></SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reference</Label>
                  <Input disabled={paymentMethod === 'cash'} {...register('paymentReference')} />
                </div>
              </div>

              <div className="pt-4 border-t border-dashed">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-muted-foreground">Total Sale Amount</span>
                  <span className="text-xl font-bold text-primary">KES {grandTotal.toLocaleString()}</span>
                </div>
                <Button 
                  type="submit" 
                  variant={isSuccess ? "outline" : "hero"} 
                  className={`w-full py-6 transition-all ${isSuccess ? 'border-green-500 text-green-600' : ''}`}
                  disabled={isLoading || isSuccess}
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : isSuccess ? <><Check className="mr-2 h-5 w-5" /> Recorded</> : "Record Sale"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Recent Sales History */}
        <Card className="h-full flex flex-col border-border/60 shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><History className="w-5 h-5 text-primary" />Recent Sales</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-auto p-6 pt-0">
            <div className="space-y-3">
              {allSales.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-20 opacity-50">
                  <Info className="w-10 h-10 mb-2" />
                  <p>No activity yet</p>
                </div>
              ) : (
                [...allSales]
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 5)
                  .map((sale) => (
                    <div key={sale.id ?? sale.created_at} className="p-4 rounded-xl border bg-card/50 flex items-center justify-between group hover:border-primary/40 transition-all">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold truncate">{sale.customer_name || 'Walk-in'}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase">{sale.payment_method} • {new Date(sale.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <p className="text-sm font-black text-primary">KES {Number(sale.amount).toLocaleString()}</p>
                        {sale.receipt_id && (
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => handleDownload(sale)}>
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
