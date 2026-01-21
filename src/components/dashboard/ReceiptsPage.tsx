import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt, Download, Eye, Calendar, DollarSign } from 'lucide-react';

// Mock receipts data
const receipts = [
  {
    id: 'RC-2024-0842',
    customer: 'John Kamau',
    amount: 75000,
    date: '2024-01-20',
    items: 'Laptop - HP ProBook',
    status: 'completed',
  },
  {
    id: 'RC-2024-0841',
    customer: 'Mary Wanjiku',
    amount: 2500,
    date: '2024-01-20',
    items: 'Phone Case, Screen Protector',
    status: 'completed',
  },
  {
    id: 'RC-2024-0840',
    customer: 'Peter Ochieng',
    amount: 8500,
    date: '2024-01-19',
    items: 'Wireless Headphones',
    status: 'completed',
  },
  {
    id: 'RC-2024-0839',
    customer: 'Grace Muthoni',
    amount: 45000,
    date: '2024-01-19',
    items: 'Office Chair, Desk Lamp',
    status: 'completed',
  },
  {
    id: 'RC-2024-0838',
    customer: 'David Kiprono',
    amount: 12000,
    date: '2024-01-18',
    items: 'Keyboard, Mouse Set',
    status: 'completed',
  },
];

export const ReceiptsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Receipts</h1>
          <p className="text-muted-foreground">View and download generated receipts</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Total: {receipts.length} receipts</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{receipts.length}</p>
                  <p className="text-sm text-muted-foreground">Total Receipts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    KES {receipts.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">This Week</p>
                  <p className="text-sm text-muted-foreground">Period</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Receipts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>All Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Receipt ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Items</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((receipt, index) => (
                    <motion.tr
                      key={receipt.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm font-medium text-primary">{receipt.id}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-foreground">{receipt.customer}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-muted-foreground">{receipt.items}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-foreground">KES {receipt.amount.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-muted-foreground">{receipt.date}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
