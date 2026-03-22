import { apiFetch } from '@/lib/apiFetch';
import { useData } from '@/contexts/DataContext';
import { useInventory } from "@/hooks/useInventory";


import React, { useState, useEffect ,useMemo } from 'react';
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

  const { user, accessToken } = useAuth();
  const { getSales, fetchSales, isFetching } = useData();
  
  const [isLoading, setIsLoading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const businessId = user?.businessId;
  const period = "this_month"; 

  const allSales = getSales(businessId, period) || [];

  const isLoadingSales = isFetching(`${businessId}-${period}`);
  const { items: inventoryItems = [] } = useInventory(businessId || "");

  const [items, setItems] = useState([
    { 
      item: "", 
      quantity: 1, 
      unitCost: 0,
      inventory_id: null,
      affects_stock: false
    }
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
        (sum, sale) => sum + Number(sale.total_amount || 0),
        0
      ),
    };
  }, [allSales]);


  useEffect(() => {
    if (!businessId) return;
    fetchSales(businessId, period);
  }, [businessId, period]);

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
      customerName: "",
      items: [{ item: "", quantity: 1, unitCost: 0 }],
      paymentMethod: "cash",
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

    if (items.length === 0) {
      toast.error("Add at least one item.");
      return;
    }
  
    for (const item of items) {
      if (!item.item || item.quantity <= 0 || item.unitCost < 0) {
        toast.error("Please complete all item fields correctly.");
        return;
      }
    
      // 🚫 BLOCK OUT OF STOCK ITEMS
      if (item.affects_stock && item.inventory_id) {
        const inventoryMatch = inventoryItems.find(i => i.id === item.inventory_id);
    
        if (!inventoryMatch || Number(inventoryMatch.stock) <= 0) {
          toast.error(`${item.item} is out of stock`);
          return;
        }
    
        // 🚫 BLOCK OVER-SELLING
        if (item.quantity > Number(inventoryMatch.stock)) {
          toast.error(`Only ${inventoryMatch.stock} ${item.item}(s) left in stock`);
          return;
        }
      }
    }
    
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
            items: items.map(i => ({
              item: i.item,
              quantity: i.quantity,
              unitCost: i.unitCost,
              affects_stock: i.affects_stock,
              ...(i.inventory_id ? { inventory_id: i.inventory_id } : {})
            })),
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
        setItems([
          { 
            item: "", 
            quantity: 1, 
            unitCost: 0,
            inventory_id: null,
            affects_stock: false
          }
        ]);
        await fetchSales(businessId, period);
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
          <Card className="h-full flex flex-col border border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Quick Sales Entry
              </CardTitle>
              <CardDescription>Record a new transaction instantly.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-5">


              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Customer */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Customer
                  </Label>
                  <Input
                    placeholder="Customer name"
                    className="h-9"
                    {...register('customerName')}
                  />
                </div>
              
                {/* Items Section */}
                <div className="space-y-4 border border-border/40 rounded-xl p-3 md:p-4 bg-muted/20">
                  {/* Header - Hidden on mobile */}
                  <div className="hidden md:grid grid-cols-12 gap-3 text-[11px] uppercase tracking-wide font-bold text-muted-foreground px-2">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-5">Item / Service</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-2 text-center">Price</div>
                    <div className="col-span-2 text-right pr-8">Subtotal</div>
                  </div>
                
                  {/* Scrollable Rows */}
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                    <AnimatePresence>
                      {items.map((entry, index) => {
                        const subtotal = entry.quantity * entry.unitCost;
                
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative flex flex-col md:grid md:grid-cols-10 gap-4 bg-background border border-border/50 rounded-xl p-4 md:p-3 md:items-center hover:shadow-md transition-all"
                          >
                            {/* Mobile Row Header */}
                            <div className="md:col-span-1 flex justify-between items-center mb-2 md:mb-0">
                              <span className="md:w-full md:text-center text-xs font-bold bg-primary/10 text-primary rounded px-2 py-1">
                                #{index + 1}
                              </span>
                
                              {/* Mobile Delete */}
                              <div className="md:hidden">
                                {items.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() =>
                                      setItems(prev => prev.filter((_, i) => i !== index))
                                    }
                                  >
                                    ✕
                                  </Button>
                                )}
                              </div>
                            </div>
                
                            {/* Item Name */}
                            <div className="md:col-span-5">
                              <Label className="md:hidden text-[10px] uppercase mb-1 block">
                                Product Name
                              </Label>
                              <div className="space-y-1">
                                <Input
                                  placeholder="Product or service"
                                  value={entry.item}
                                  className="h-10"
                                  onChange={(e) => {
                                    const value = e.target.value;
                                
                                    setItems(prev => {
                                      const updated = [...prev];

                                      updated[index] = {
                                        ...updated[index],
                                        item: value,
                                        inventory_id: null,
                                        affects_stock: false
                                      };
                                                                      
                                      // const match = inventoryItems.find(
                                      //   (i) =>
                                      //     i.name.toLowerCase().includes(value.toLowerCase().trim()) ||
                                      //     value.toLowerCase().includes(i.name.toLowerCase().trim())
                                      // );
                                
                                      // if (match) {
                                      //   updated[index] = {
                                      //     ...updated[index],
                                      //     item: match.name,
                                      //     unitCost: Number(match.selling_price || match.cost_price || 0),
                                      //     inventory_id: match.id,
                                      //     affects_stock: true
                                      //   };
                                      // } else {
                                      //   updated[index] = {
                                      //     ...updated[index],
                                      //     item: value,
                                      //     inventory_id: null,
                                      //     affects_stock: false
                                      //   };
                                      // }
                                
                                      return updated;
                                    });
                                  }}
                                />
                              
                                {/* Suggestions dropdown */}
                                {entry.item && !entry.affects_stock && (
                                  <div className="border rounded-md bg-background shadow-sm max-h-40 overflow-y-auto text-sm">
                                    {inventoryItems
                                      .filter(i =>
                                        i.name.toLowerCase().includes(entry.item.toLowerCase())
                                      )
                                      .slice(0, 5)
                                      .map(i => {
                                        const isOutOfStock = Number(i.stock) <= 0;
                                      
                                        return (
                                          <div
                                            key={i.id}
                                            className={`px-3 py-2 flex justify-between items-center cursor-pointer ${
                                              isOutOfStock
                                                ? "opacity-50 cursor-not-allowed"
                                                : "hover:bg-muted"
                                            }`}
                                         onClick={() => {
                                            if (isOutOfStock) return; // 🚫 block click
                                    
                                            setItems(prev => {
                                              const updated = [...prev];
                                              updated[index] = {
                                                ...updated[index],
                                                item: i.name,
                                                unitCost: Number(i.selling_price || i.cost_price || 0),
                                                inventory_id: i.id,
                                                affects_stock: true
                                              };
                                              return updated;
                                            });
                                          }}
                                        >
                                          <span>{i.name}</span>
                                    
                                          <span className="text-xs text-muted-foreground">
                                            {isOutOfStock ? "Out of stock" : `${i.stock} left`}
                                          </span>
                                        </div>
                                      );
                                    })
                                  </div>
                                )}
                              
                                {/* Indicator */}
                                {entry.affects_stock ? (
                                  <span className="text-[10px] text-green-600">Tracked item</span>
                                ) : (
                                  entry.item && (
                                    <span className="text-[10px] text-muted-foreground">Custom item</span>
                                  )
                                )}
                              </div>
                            </div>
                
                            {/* Qty + Price */}
                            <div className="grid grid-cols-2 md:contents gap-3">
                              {/* Quantity */}
                              <div className="md:col-span-2">
                                <Label className="md:hidden text-[10px] uppercase mb-1 block">
                                  Qty
                                </Label>
                                <Input
                                  type="number"
                                  min="1"
                                  inputMode="numeric"
                                  value={entry.quantity}
                                  className="h-9 text-center"
                                  onChange={(e) => {
                                    const value = Math.max(
                                      1,
                                      Number(e.target.value) || 1
                                    );
                
                                    setItems(prev => {
                                      const updated = [...prev];
                                      updated[index] = { ...updated[index], quantity: value };
                                      return updated;
                                    });
                                  }}
                                />
                              </div>
                
                              {/* Unit Price */}
                              <div className="md:col-span-2">
                                <Label className="md:hidden text-[10px] uppercase mb-1 block">
                                  Unit Price
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  inputMode="numeric"
                                  value={entry.unitCost}
                                  className="h-9 text-center"
                                  onChange={(e) => {
                                    const value = Math.max(
                                      0,
                                      Number(e.target.value) || 0
                                    );
                
                                    setItems(prev => {
                                      const updated = [...prev];
                                      updated[index] = { ...updated[index], unitCost: value };
                                      return updated;
                                    });
                                  }}
                                />
                              </div>
                            </div>
                
                            {/* Subtotal + Desktop Delete */}
                            <div className="md:col-span-2 flex items-center justify-between md:justify-end mt-2 md:mt-0">
                              <div className="md:text-right">
                                <Label className="md:hidden text-[10px] uppercase block">
                                  Subtotal
                                </Label>
                                <span className="text-sm font-bold text-primary">
                                  {subtotal > 0
                                    ? `KES ${subtotal.toLocaleString()}`
                                    : "-"}
                                </span>
                              </div>
                
                              {/* Desktop Delete */}
                              <div className="hidden md:block ml-2">
                                {items.length > 1 && (
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() =>
                                      setItems(prev => prev.filter((_, i) => i !== index))
                                    }
                                  >
                                    ✕
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                
                  {/* Add Item Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full md:w-auto border-dashed border-primary/40 text-primary hover:bg-primary/5"
                    onClick={() =>
                      setItems(prev => [
                        ...prev,
                        { item: "", quantity: 1, unitCost: 0, inventory_id: null, affects_stock: false }
                      ])
                    }
                  >
                    + Add Another Item
                  </Button>
                </div>
              
                {/* Total */}
                <div className="rounded-xl bg-primary/5 border border-primary/20 px-5 py-4 flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    Total Amount
                  </span>
                  <span className="text-2xl font-bold text-primary tracking-tight">
                    KES {calculatedAmount.toLocaleString()}
                  </span>
                </div>
              
                {/* Payment Section */}
                <div className="space-y-4 pt-2 border-t border-border/40">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        Payment Method
                      </Label>
                      <Select
                        value={paymentMethod}
                        onValueChange={(v) => setValue('paymentMethod', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map(m => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
              
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        Payment Reference
                      </Label>
                      <Input
                        placeholder={
                          paymentMethod === 'cash'
                            ? "Not required for cash payments"
                            : "Transaction code or reference ID"
                        }
                        disabled={paymentMethod === 'cash'}
                        {...register('paymentReference')}
                      />
                    </div>
              
                  </div>
                </div>
              
                {/* Submit */}
                <Button
                  type="submit"
                  variant="hero"
                  className="w-full h-11 rounded-xl text-sm font-semibold shadow-sm"
                  disabled={isLoading}
                >
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
                <CardDescription>Your latest activities.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-auto">
              <div className="">
                {isLoadingSales ? (
                  <div className="py-10 text-center text-muted-foreground">
                    Loading sales...
                  </div>
                ) : allSales.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-20 opacity-50">
                    <Info className="w-8 h-8 mb-2" />
                    <p>No sales activity found</p>
                  </div>
                ) : (
                  [...allSales]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 7)
                    .map((sale) => (
                      <div key={sale.id ?? sale.created_at} className="p-3 rounded-lg border bg-card/50 flex items-center justify-between group hover:border-primary/50 transition-all">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate">{sale.customer_name || 'Walk-in'}</p>
                          <p className="text-xs text-muted-foreground truncate">{sale.item_sold || sale.item}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 uppercase">{sale.payment_method} • {new Date(sale.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <p className="text-sm font-bold whitespace-nowrap">KES {Number(sale.total_amount || 0).toLocaleString()}</p>

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
