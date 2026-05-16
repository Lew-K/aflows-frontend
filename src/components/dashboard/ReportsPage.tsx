import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Package,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const reportCategories = [
  {
    title: 'Financial Health Summary',
    subtitle: 'Where is my money?',
    description: 'Understand your real profit after costs and expenses.',
    icon: CreditCard,
    color: 'text-blue-500',
    metric: { label: 'Net Profit (Last 30 days)', value: '—' },
    reports: [
      'Cash In vs Cash Out',
      'Net Profit Margin',
      'Expenses Breakdown',
    ],
  },
  {
    title: 'Smart Stock List',
    subtitle: 'What do I need to buy?',
    description: 'Automatic restock list based on stock levels and sales velocity.',
    icon: Package,
    color: 'text-orange-500',
    metric: { label: 'Items low on stock', value: '—' },
    reports: [
      'Low Stock Alerts',
      'Inventory Velocity',
      'Restock Shopping List',
    ],
  },
  {
    title: 'Customer Loyalty Insights',
    subtitle: 'Who is my best customer?',
    description: 'Turn gut feeling about regulars into a data-driven strategy.',
    icon: Users,
    color: 'text-purple-500',
    metric: { label: 'VIP customers lapsed 30+ days', value: '—' },
    reports: [
      'Top 10% Spenders',
      'Lapsed Customers (30+ days)',
      'Customer Lifetime Value',
    ],
  },
  {
    title: 'Sales Performance',
    subtitle: 'What is selling?',
    description: 'Transaction history and top performing products.',
    icon: TrendingUp,
    color: 'text-green-500',
    metric: { label: 'Top product this month', value: '—' },
    reports: [
      'Daily Sales Summary',
      'Top Products',
      'Payment Method Breakdown',
    ],
  },
];

export const ReportsPage = () => {
  const [dateRange, setDateRange] = useState('last-30');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Exports</h1>
          <p className="text-muted-foreground">
            Download and analyze your business data.
          </p>
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
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="text-primary w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Quick Full Business Snapshot</h3>
            <p className="text-sm text-muted-foreground">
              Download a comprehensive PDF summary of all departments.
            </p>
          </div>
        </div>
        <Button className="w-full md:w-auto gap-2">
          <Download className="w-4 h-4" />
          Generate Snapshot
        </Button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {reportCategories.map((category) => (
          <Card
            key={category.title}
            className="hover:shadow-md transition-shadow flex flex-col"
          >
            <CardHeader>
              <div
                className={cn(
                  'w-10 h-10 rounded-lg bg-background border flex items-center justify-center mb-2',
                  category.color
                )}
              >
                <category.icon className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                {category.subtitle}
              </p>
              <CardTitle className="text-base">{category.title}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>

            {/* Live metric callout — wire to API later */}
            <div className="mx-6 mb-4 p-3 rounded-lg bg-muted/40 border border-border">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                {category.metric.label}
              </p>
              <p className="text-xl font-bold text-foreground">
                {category.metric.value}
              </p>
            </div>

            <CardContent className="flex-1">
              <ul className="space-y-3">
                {category.reports.map((report) => (
                  <li
                    key={report}
                    className="group flex items-center justify-between text-sm py-2 px-3 rounded-md hover:bg-muted cursor-pointer transition-colors"
                  >
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
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs gap-1"
                >
                  <Download className="w-3 h-3" /> Export
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Export History — placeholder until API is wired */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Exports</h2>
        <div className="rounded-xl border bg-card p-12 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Download className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">No exports yet</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Your export history will appear here once you start generating reports.
          </p>
        </div>
      </div>

    </div>
  );
};
