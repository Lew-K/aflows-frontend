import React, { useState } from 'react';
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
import { recordSale } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ShoppingCart, Download, Check } from 'lucide-react';


const paymentMethods = [
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card Payment' },
];

// Mock recent sales for display 
// const recentSales = [
//   { id: 1, customer: 'John Kamau', item: 'Laptop', amount: 75000, method: 'M-Pesa', date: '2024-01-20' },
//   { id: 2, customer: 'Mary Wanjiku', item: 'Phone Case', amount: 2500, method: 'Cash', date: '2024-01-20' },
//   { id: 3, customer: 'Peter Ochieng', item: 'Headphones', amount: 8500, method: 'Card', date: '2024-01-19' },
// ];


// 1. Remove the static const recentSales = [...]

export const SalesPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [salesList, setSalesList] = useState<any[]>([]); // Add this for dynamic data
  const { token, user } = useAuth();
  const businessId = user?.businessId;

  // 2. Add fetch function to get the last 5 sales
  const fetchRecentSales = async () => {
    try {
      const response = await fetch(`https://n8n.aflows.uk/webhook/get-recent-sales?business_id=${businessId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setSalesList(data.slice(0, 5)); // Take only the last 5
    } catch (error) {
      console.error("Failed to fetch sales", error);
    }
  };

  // 3. Load data on mount
  useEffect(() => {
    if (businessId) fetchRecentSales();
  }, [businessId]);


// export const SalesPage = () => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
//   const { token, user } = useAuth();
//   const businessId = user?.businessId; 

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     reset,
//     watch,
//     formState: { errors },
//   } = useForm<SaleFormData>({
//     resolver: zodResolver(saleSchema),
//     defaultValues: {
//       paymentMethod: undefined,
//     },
//   });
  
  const paymentMethod = watch("paymentMethod");

  
  // const onSubmit = async (data: SaleFormData) => {
      
  //   setIsLoading(true);
  //   try {
    
  //     const response = await fetch(
  //       'https://n8n.aflows.uk/webhook/record-sales',
  //       {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify({
  //           business_id: businessId,
  //           customer_name: data.customerName || null,
  //           item_sold: data.itemSold,
  //           amount: data.amount || null,
  //           payment_method: data.paymentMethod || null,
  //           payment_reference: data.paymentReference,
  //         }),
  //       }
  //     );

  //     if (response.ok) {
  //       toast.success('Sale recorded successfully!');
  //       if (response.receiptUrl) {
  //         setReceiptUrl(response.receiptUrl);
  //       }
  //       reset();
  //     } else {
  //       toast.error(result.message || 'Failed to record sale');
  //     }
  //   } catch (error) {
  //     // For demo, show success anyway
  //     toast.success('Sale recorded successfully!');
  //     setReceiptUrl('#demo-receipt');
  //     reset();
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };


  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        'https://n8n.aflows.uk/webhook/record-sales',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            business_id: businessId,
            customer_name: data.customerName,
            item_sold: data.itemSold,
            quantity: data.quantity,      // Added
            unit_price: data.unitPrice,   // Changed from amount
            total_amount: data.quantity * data.unitPrice, // Calculated
            payment_method: data.paymentMethod,
            payment_reference: data.paymentReference,
          }),
        }
      );
  
      if (response.ok) {
        toast.success('Sale recorded successfully!');
        fetchRecentSales(); // Refresh the list immediately
        reset();
      }
    } catch (error) {
      toast.error('Failed to record sale');
    } finally {
      setIsLoading(false);
    }
  };

  const result = await response.json();

  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sales Recording</h1>
        <p className="text-muted-foreground">Record new sales and generate receipts</p>
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

                {/* <div>
                  <Label htmlFor="itemSold">Item Sold</Label>
                  <Input
                    id="itemSold"
                    placeholder="Describe the item or service"
                    className="mt-2"
                    {...register('itemSold')}
                  />
                  {errors.itemSold && (
                    <p className="text-destructive text-sm mt-1">{errors.itemSold.message}</p>
                //   )}
                // </div> */}

                <div>
                  <Label htmlFor="itemSold">Item/Service</Label>
                  <Input
                    id="itemSold"
                    placeholder="Describe the item or service"
                    className="mt-2"
                    {...register('itemSold')}
                  />
                </div>

                {/* <div>
                  <Label htmlFor="amount">Amount (KES)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    className="mt-2"
                    {...register('amount', { valueAsNumber: true })}
                  />
                  {errors.amount && (
                    <p className="text-destructive text-sm mt-1">{errors.amount.message}</p>
                  )}
                </div> */}
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    defaultValue="1"
                    className="mt-2"
                    {...register('quantity', { valueAsNumber: true })}
                  />
                </div>


                <div>
                  <Label htmlFor="unitPrice">Unit Price (KES)</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    placeholder="0.00"
                    className="mt-2"
                    {...register('unitPrice', { valueAsNumber: true })}
                  />
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
                    disabled= {paymentMethod === "cash"}
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
            {/* <CardContent>
              <div className="space-y-4">
                {recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="p-4 rounded-lg bg-secondary/50 border border-border"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-foreground">{sale.customer}</p>
                        <p className="text-sm text-muted-foreground">{sale.item}</p>
                      </div>
                      <span className="text-lg font-bold text-primary">
                        KES {sale.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{sale.method}</span>
                      <span>{sale.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent> */}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
