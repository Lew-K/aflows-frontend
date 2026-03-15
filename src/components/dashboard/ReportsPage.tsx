import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Table as TableIcon, 
  Calendar, 
  Filter, 
  TrendingUp, 
  Users, 
  Package, 
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const reportCategories = [
  {
    title: "Financials",
    description: "Revenue, tax summaries, and profit margins.",
    icon: CreditCard,
    color: "text-blue-500",
    reports: ["Profit & Loss", "Tax Summary (GST/VAT)", "Expenses Log"]
  },
  {
    title: "Sales & Orders",
    description: "Transaction history and channel performance.",
    icon: TrendingUp,
    color: "text-green-500",
    reports: ["Daily Sales", "Product Performance", "Discount Usage"]
  },
  {
    title: "Inventory",
    description: "Stock levels, valuations, and waste tracking.",
    icon: Package,
    color: "text-orange-500",
    reports: ["Current Stock Value", "Low Stock Alert History", "Supplier Orders"]
  },
  {
    title: "Customers",
    description: "CRM data and purchasing behavior.",
    icon: Users,
    color: "text-purple-500",
    reports: ["Customer Lifetime Value", "New vs Returning", "Email List Export"]
  }
];

export const ReportsPage = () => {
  const [dateRange, setDateRange] = useState('last-30');
  const [exportFormat, setExportFormat] = useState('csv');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Exports</h1>
          <p className="text-muted-foreground">Download and analyze your business data.</p>
        </div>
        
        {/* Global Time Filter */}
        <div className="flex items-center gap-2 bg-card p-2 rounded-lg border shadow-sm">
          <Calendar className="w-4 h-4 text-muted-foreground ml-2" />
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px] border-none focus:ring-0 shadow-none">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="last-7">Last 7 Days</SelectItem>
              <SelectItem value="last-30">Last 30 Days</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="year-to-date">Year to Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Export Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="text-primary w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Quick Full Business Snapshot</h3>
            <p className="text-sm text-muted-foreground">Download a comprehensive PDF summary of all departments.</p>
          </div>
        </div>
        <Button className="w-full md:w-auto gap-2">
          <Download className="w-4 h-4" />
          Generate Snapshot
        </Button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {reportCategories.map((category) => (
          <Card key={category.title} className="hover:shadow-md transition-shadow flex flex-col">
            <CardHeader>
              <div className={cn("w-10 h-10 rounded-lg bg-background border flex items-center justify-center mb-2", category.color)}>
                <category.icon className="w-6 h-6" />
              </div>
              <CardTitle>{category.title}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {category.reports.map((report) => (
                  <li key={report} className="group flex items-center justify-between text-sm py-2 px-3 rounded-md hover:bg-muted cursor-pointer transition-colors">
                    <span className="font-medium">{report}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <div className="flex w-full gap-2">
                <Select defaultValue="csv">
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="xlsx">Excel</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1">
                  <Download className="w-3 h-3" /> Export
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Export History - Mobile Scrollable Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Exports</h2>
        <div className="rounded-md border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 font-medium">Report Name</th>
                  <th className="px-6 py-3 font-medium">Date Range</th>
                  <th className="px-6 py-3 font-medium">Format</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[1, 2].map((i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">Monthly_Sales_Revenue</td>
                    <td className="px-6 py-4 text-muted-foreground">Feb 1 - Feb 28</td>
                    <td className="px-6 py-4"><span className="uppercase text-[10px] bg-secondary px-2 py-1 rounded">CSV</span></td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-green-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                        Ready
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm">Download</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
