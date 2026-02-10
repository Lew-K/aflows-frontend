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
// import { recordSale } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ShoppingCart, Download, Check } from 'lucide-react';


const paymentMethods = [
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card Payment' },
];


export const SalesPage = () => {

  const [allSales, setAllSales] = useState<any[]>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<{
    totalSales: number;
    totalValue: number;
  }>({
    totalSales: 0,
    totalValue: 0,
  });

  const { token, user } = useAuth(); // move this above useEffect
  
  const fetchSales = async () => {
    if (!user?.businessId) return;

    try {
      const res = await fetch(
      `https://n8n.aflows.uk/webhook/get-sales?business_id=${user.businessId}`
      );
  
      const data = await res.json();
  
      console.log("RAW webhook response:", data);
  
        // Your webhook returns: [ { sales: [...] } ]
      const sales = Array.isArray(data?.sales?.sales) ? data.sales.sales : [];
  
      console.log("Extracted sales array:", sales, "count:", sales.length);

      setAllSales(sales); // ✅ ONLY responsibility
    } catch (err) {
      console.error("Failed to fetch sales:", err);
      setAllSales([]);
    }
  };
     

  
  
  
  useEffect(() => {

    if (!user?.businessId) return;
    fetchSales(); // initial load
    const interval = setInterval(fetchSales, 60000);
    
    return () => clearInterval(interval);
  }, [user?.businessId]);
  
    useEffect(() => {   
      if (!Array.isArray(allSales)) return;
  
      const lastFive = [...allSales]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      setRecentSales(lastFive);
    
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      startOfWeek.setHours(0, 0, 0, 0);
    
      const weeklySales = allSales.filter((sale) => new Date(sale.created_at) >= startOfWeek);
      const totalSales = weeklySales.length;
      const totalValue = weeklySales.reduce((sum, sale) => sum + Number(sale.amount || 0), 0);
    
      setWeeklySummary({
        totalSales: weeklySales.length,
        totalValue: weeklySales.reduce((sum, sale) => sum + Number(sale.amount || 0), 0), 
      });
    }, [allSales]);
    

    
  //   if (!Array.isArray(allSales)) return;
  
  //   const lastFive = [...allSales]
  //     .sort(
  //       (a, b) =>
  //         new Date(b.created_at).getTime() -
  //         new Date(a.created_at).getTime()
  //     )
  //     .slice(0, 5);
  
  //   setRecentSales(lastFive);
  //   const now = new Date();
  
  //   const startOfWeek = new Date(now);
  //   startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  //   startOfWeek.setHours(0, 0, 0, 0);
  
  //   const weeklySales = allSales.filter((sale) => {
  //     const saleDate = new Date(sale.created_at);
  //     return saleDate >= startOfWeek;
  //   });
  
  //   const totalSales = weeklySales.length;
  //   const totalValue = weeklySales.reduce(
  //     (sum, sale) => sum + Number(sale.amount || 0),
  //     0
  //   );
  
  //   setWeeklySummary({
  //     totalSales,
  //     totalValue,
  //   });
  // }, [allSales]);
  
   
    


  const [isLoading, setIsLoading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const businessId = user?.businessId; 

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
  
  const calculatedAmount =
    (Number(quantityWatch) || 0) * (Number(unitCostWatch) || 0);
  
  useEffect(() => {
    setValue('amount', calculatedAmount, {        
      shouldValidate: true,
      shouldDirty: true,
      });
  }, [calculatedAmount, setValue]);
  
  const onSubmit = async (data: SaleFormData) => {


    setAllSales((prev) => [
      {
        customer_name: data.customerName || 'Walk-in customer',
        item_sold: data.itemSold,
        amount: data.amount,
        payment_method: data.paymentMethod,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);

    
      
    setIsLoading(true);
    try {
      const amount = data.amount;
      
      console.log("FINAL SEND:", {
        quantity: data.quantity,
        unitCost: data.unitCost,
        amount: data.amount,
      });



    
      const response = await fetch(
        'https://n8n.aflows.uk/webhook/record-sales',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Authorization: `Bearer ${token}`,
          },
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

      // const result = await response.json();

      // let result = null;

      // const text = await response.text();
      // if (text) {
      //   result = JSON.parse(text);
      // }

      let result: any = {};
      const text = await response.text(); // read raw text
      if (text) {
        try {
          result = JSON.parse(text);
        } catch {
          console.warn("Response is not valid JSON, skipping parse", text);
        }
      }
      
      
      if (response.ok) {
        toast.success('Sale recorded successfully!');
        await fetchSales(); // 👈 THIS is what makes it dynamic

        if (response.receiptUrl) {
          setReceiptUrl(response.receiptUrl);
        }
        reset();
      } else {
        toast.error(result.message || 'Failed to record sale');
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong!');

    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sales Dashboard</h1>
        <p className="text-muted-foreground">  Track, record, and review your business sales in real time
        </p>
      </div>

    
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         <Card>
           <CardContent className="p-4">
             <p className="text-sm text-muted-foreground">Total Sales</p>
             <p className="text-2xl font-bold">
               {weeklySummary.totalSales === 0 ? "—" : weeklySummary.totalSales}
             </p>
             <p className="text-xs text-muted-foreground mt-1">
               This Week
             </p>
           </CardContent>
         </Card>
      
         <Card>
           <CardContent className="p-4">
             <p className="text-sm text-muted-foreground">Total Value</p>
             <p className="text-2xl font-bold text-primary">
               {weeklySummary.totalValue === 0
                  ? "KES —"
                  : `KES ${weeklySummary.totalValue.toLocaleString()}`}               
             </p>
             <p className="text-xs text-muted-foreground mt-1">
               This Week
             </p>
           </CardContent>
         </Card>
       </div>
    


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Quick Sales Entry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <input type="hidden" {...register("paymentMethod")} />
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    className="mt-2"
                    {...register('customerName')}
                  />
                  {errors.customerName && (
                    <p className="text-destructive text-sm mt-1">{errors.customerName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="itemSold">Item Sold / Service Rendered</Label>
                  <Input
                    id="itemSold"
                    placeholder="Describe the item or service"
                    className="mt-2"
                    {...register('itemSold')}
                  />
                  {errors.itemSold && (
                    <p className="text-destructive text-sm mt-1">{errors.itemSold.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Units / Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      placeholder="1"
                      className="mt-2"
                      {...register('quantity', { valueAsNumber: true })}
                    />
                    {errors.quantity && (
                      <p className="text-destructive text-sm mt-1">{errors.quantity.message}</p>
                    )}
                  </div>


                   <div>
                    <Label htmlFor="unitCost">Price per Unit / Rate</Label>
                    <Input
                      id="unitCost"
                      type="number"
                      min={0}
                      placeholder="0.00"
                      className="mt-2"
                      {...register('unitCost', { valueAsNumber: true })}
                    />
                    {errors.unitCost && (
                      <p className="text-destructive text-sm mt-1">{errors.unitCost.message}</p>
                    )}
                  </div>
                </div>
                        

                <div>
                  <Label htmlFor="amount">Amount (KES)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Calculated automatically"
                    className="mt-2 bg-muted/10 cursor-not-allowed"
                    readOnly
                    value={calculatedAmount}
                  />
                  <input type="hidden" {...register("amount", { valueAsNumber: true })} />
                  {errors.amount && (
                    <p className="text-destructive text-sm mt-1">{errors.amount.message}</p>
                  )}
                </div>

                <div>
                  <Label>Payment Method</Label>
                  <Select onValueChange={(value) => setValue('paymentMethod', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.paymentMethod && (
                    <p className="text-destructive text-sm mt-1">{errors.paymentMethod.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="paymentReference">Payment Reference</Label>
                  <Input
                    id="paymentReference"
                    placeholder="Paste M-Pesa or bank confirmation message here"
                    disabled={paymentMethod === "cash"}
                    className="mt-2"
                    {...register('paymentReference')}
                  />
                  {errors.paymentReference && (
                    <p className="text-destructive text-sm mt-1">{errors.paymentReference.message}</p>
                  )}
                </div>

                <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      Record Sale
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </Button>

                {receiptUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-success/10 rounded-lg border border-success/20"
                  >
                    <p className="text-success font-medium mb-2 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Receipt Generated!
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Receipt
                    </Button>
                  </motion.div>
                )}
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Sales */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
            </CardHeader>

            <CardContent>
              {allSales.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingCart className="w-10 h-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">
                    No sales yet
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                    Record your first sale to start tracking your business performance.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentSales.map((sale) => (
                    <div
                      key={`${sale.id ?? sale.created_at}`}
                      className="p-4 rounded-lg bg-secondary/50 border border-border"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">
                            {sale.customer_name || 'Walk-in customer'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {sale.item_sold}
                          </p>
                        </div>
                        <span className="font-bold text-primary">
                          KES {Number(sale.amount).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{sale.payment_method}</span>
                        <span>{new Date(sale.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

             
