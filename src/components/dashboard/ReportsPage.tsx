import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, Download, Calendar, TrendingUp,
  Users, Package, CreditCard, ArrowRight, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/apiFetch';

/* ── Date range helpers ── */
const getDateRange = (range: string): { start: string; end: string } => {
  const now = new Date();
  const end = now.toISOString().slice(0, 10);

  switch (range) {
    case 'today': {
      return { start: end, end };
    }
    case 'last-7': {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      return { start: start.toISOString().slice(0, 10), end };
    }
    case 'last-30': {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      return { start: start.toISOString().slice(0, 10), end };
    }
    case 'this-quarter': {
      const quarter = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), quarter * 3, 1);
      return { start: start.toISOString().slice(0, 10), end };
    }
    case 'year-to-date': {
      const start = new Date(now.getFullYear(), 0, 1);
      return { start: start.toISOString().slice(0, 10), end };
    }
    default: {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      return { start: start.toISOString().slice(0, 10), end };
    }
  }
};

/* ── CSV export helper ── */
// Replace the existing downloadCSV function with:
const downloadCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    toast.info('No data available to export for this period');
    return;
  }

  // Human-readable header mapping
  const headerMap: Record<string, string> = {
    date: 'Date', total_revenue: 'Total Revenue (KES)', transaction_count: 'Transactions',
    avg_transaction: 'Avg Transaction (KES)', payment_method: 'Payment Method',
    amount: 'Amount (KES)', customer_name: 'Customer Name', total_spent: 'Total Spent (KES)',
    total_orders: 'Total Orders', last_seen_at: 'Last Purchase Date', segment: 'Segment',
    name: 'Product Name', stock: 'Current Stock', cost_price: 'Cost Price (KES)',
    selling_price: 'Selling Price (KES)', low_stock_threshold: 'Low Stock Alert',
    status: 'Status', percentage: 'Percentage (%)',
  };

  const rawKeys = Object.keys(data[0]);
  const displayHeaders = rawKeys.map(k => headerMap[k] || k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));

  const rows = data.map(row =>
    rawKeys.map(k => {
      const val = row[k];
      if (val == null) return '';
      // Format currency fields
      if (['total_revenue', 'avg_transaction', 'amount', 'total_spent', 'cost_price', 'selling_price'].includes(k)) {
        return Number(val).toLocaleString('en-KE');
      }
      // Format dates
      if (k.includes('date') || k.includes('at') || k.includes('created')) {
        const d = new Date(val);
        if (!isNaN(d.getTime())) return d.toLocaleDateString('en-KE');
      }
      const str = String(val);
      // Wrap in quotes if contains comma or newline
      return str.includes(',') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(',')
  );

  const csv = [displayHeaders.join(','), ...rows].join('\n');
  // BOM (\uFEFF) ensures Excel opens with correct encoding
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toLocaleDateString('en-KE', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
  a.download = `${filename}_${dateStr}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`${filename} exported successfully`);
};

/* ── Types ── */
interface ReportData {
  summary: any;
  data: any[];
}

export const ReportsPage = () => {
  const { user } = useAuth();
  const businessId = user?.businessId;
  const [dateRange, setDateRange] = useState('last-30');

  const [financial, setFinancial] = useState<ReportData | null>(null);
  const [stock, setStock] = useState<ReportData | null>(null);
  const [customers, setCustomers] = useState<ReportData | null>(null);
  const [salesPerf, setSalesPerf] = useState<ReportData | null>(null);

  const [loadingFinancial, setLoadingFinancial] = useState(false);
  const [loadingStock, setLoadingStock] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingSales, setLoadingSales] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!businessId) return;
    const { start, end } = getDateRange(dateRange);

    // Financial
    setLoadingFinancial(true);
    try {
      const res = await apiFetch(
        `https://api.aflows.uk/api/v1/reports/financial?businessId=${businessId}&start=${start}&end=${end}`
      );
      const json = await res.json();
      const d = json;
      if (d?.success) {
        setFinancial({ summary: d.data.summary, data: d.data.daily_breakdown });
      }
    } catch (e) { console.error(e); }
    finally { setLoadingFinancial(false); }

    // Stock
    setLoadingStock(true);
    try {
      const res = await apiFetch(
        `https://api.aflows.uk/api/v1/reports/stock?businessId=${businessId}`
      );
      const json = await res.json();
      const d = json;
      if (d?.success) {
        setStock({ summary: d.data.summary, data: d.data.items });
      }
    } catch (e) { console.error(e); }
    finally { setLoadingStock(false); }

    // Customers
    setLoadingCustomers(true);
    try {
      const res = await apiFetch(
        `https://api.aflows.uk/api/v1/reports/customers?businessId=${businessId}`
      );
      const json = await res.json();
      const d = json;
      if (d?.success) {
        setCustomers({ summary: d.data.summary, data: d.data.customers });
      }
    } catch (e) { console.error(e); }
    finally { setLoadingCustomers(false); }

    // Sales Performance
    setLoadingSales(true);
    try {
      const res = await apiFetch(
        `https://api.aflows.uk/api/v1/reports/sales-performance?businessId=${businessId}&start=${start}&end=${end}`
      );
      const json = await res.json();
      const d = json;
      if (d?.success) {
        setSalesPerf({ summary: d.data.summary, data: d.data.breakdown });
      }
    } catch (e) { console.error(e); }
    finally { setLoadingSales(false); }

  }, [businessId, dateRange]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const fmt = (n: number) => `KES ${Number(n).toLocaleString()}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Exports</h1>
          <p className="text-muted-foreground">Download and analyze your business data.</p>
        </div>
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
              Download a comprehensive CSV of all report data.
            </p>
          </div>
        </div>
        <Button
          className="w-full md:w-auto gap-2"
          onClick={() => {
            if (financial?.data) downloadCSV(financial.data, 'financial-summary');
            if (stock?.data) downloadCSV(stock.data, 'stock-list');
            if (customers?.data) downloadCSV(customers.data, 'customer-insights');
            if (salesPerf?.data) downloadCSV(salesPerf.data, 'sales-performance');
          }}
        >
          <Download className="w-4 h-4" />
          Download All Reports
        </Button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {/* Financial Health */}
        <Card className="hover:shadow-md transition-shadow flex flex-col">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-background border flex items-center justify-center mb-2 text-blue-500">
              <CreditCard className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">Where is my money?</p>
            <CardTitle className="text-base">Financial Health Summary</CardTitle>
            <CardDescription>Understand your real profit after costs and expenses.</CardDescription>
          </CardHeader>
          <div className="mx-6 mb-4 p-3 rounded-lg bg-muted/40 border border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-xl font-bold text-foreground">
              {loadingFinancial ? <Loader2 className="w-4 h-4 animate-spin" /> : financial ? fmt(financial.summary.total_revenue) : '—'}
            </p>
          </div>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              {['Cash In vs Cash Out', 'Daily Revenue Breakdown', 'Avg Transaction Value'].map(r => (
                <li key={r} className="group flex items-center justify-between text-sm py-2 px-3 rounded-md hover:bg-muted cursor-pointer transition-colors">
                  <span className="font-medium">{r}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs gap-1"
              disabled={loadingFinancial || !financial}
              onClick={() => financial?.data && downloadCSV(financial.data, 'financial-summary')}
            >
              {loadingFinancial ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
              Export CSV
            </Button>
          </CardFooter>
        </Card>

        {/* Smart Stock List */}
        <Card className="hover:shadow-md transition-shadow flex flex-col">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-background border flex items-center justify-center mb-2 text-orange-500">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">What do I need to buy?</p>
            <CardTitle className="text-base">Smart Stock List</CardTitle>
            <CardDescription>Automatic restock list based on stock levels.</CardDescription>
          </CardHeader>
          <div className="mx-6 mb-4 p-3 rounded-lg bg-muted/40 border border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Items to restock</p>
            <p className="text-xl font-bold text-foreground">
              {loadingStock ? <Loader2 className="w-4 h-4 animate-spin" /> : stock ? stock.summary.total_items_to_restock : '—'}
            </p>
            {stock && (
              <p className="text-[10px] text-muted-foreground mt-1">
                {stock.summary.out_of_stock_count} out of stock · {stock.summary.low_stock_count} low
              </p>
            )}
          </div>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              {['Low Stock Alerts', 'Inventory Velocity', 'Restock Shopping List'].map(r => (
                <li key={r} className="group flex items-center justify-between text-sm py-2 px-3 rounded-md hover:bg-muted cursor-pointer transition-colors">
                  <span className="font-medium">{r}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs gap-1"
              disabled={loadingStock || !stock}
              onClick={() => stock?.data && downloadCSV(stock.data, 'smart-stock-list')}
            >
              {loadingStock ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
              Export CSV
            </Button>
          </CardFooter>
        </Card>

        {/* Customer Loyalty */}
        <Card className="hover:shadow-md transition-shadow flex flex-col">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-background border flex items-center justify-center mb-2 text-purple-500">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">Who is my best customer?</p>
            <CardTitle className="text-base">Customer Loyalty Insights</CardTitle>
            <CardDescription>Turn gut feeling about regulars into data.</CardDescription>
          </CardHeader>
          <div className="mx-6 mb-4 p-3 rounded-lg bg-muted/40 border border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">VIP customers</p>
            <p className="text-xl font-bold text-foreground">
              {loadingCustomers ? <Loader2 className="w-4 h-4 animate-spin" /> : customers ? customers.summary.vip_count : '—'}
            </p>
            {customers && (
              <p className="text-[10px] text-muted-foreground mt-1">
                {customers.summary.lapsed_count} lapsed · {customers.summary.regular_count} regular
              </p>
            )}
          </div>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              {['Top 10% Spenders', 'Lapsed Customers (30+ days)', 'Customer Lifetime Value'].map(r => (
                <li key={r} className="group flex items-center justify-between text-sm py-2 px-3 rounded-md hover:bg-muted cursor-pointer transition-colors">
                  <span className="font-medium">{r}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs gap-1"
              disabled={loadingCustomers || !customers}
              onClick={() => customers?.data && downloadCSV(customers.data, 'customer-loyalty-insights')}
            >
              {loadingCustomers ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
              Export CSV
            </Button>
          </CardFooter>
        </Card>

        {/* Sales Performance */}
        <Card className="hover:shadow-md transition-shadow flex flex-col">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-background border flex items-center justify-center mb-2 text-green-500">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">What is selling?</p>
            <CardTitle className="text-base">Sales Performance</CardTitle>
            <CardDescription>Transaction history and payment method breakdown.</CardDescription>
          </CardHeader>
          <div className="mx-6 mb-4 p-3 rounded-lg bg-muted/40 border border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Top payment method</p>
            <p className="text-xl font-bold text-foreground">
              {loadingSales ? <Loader2 className="w-4 h-4 animate-spin" /> : salesPerf ? salesPerf.summary.top_payment_method : '—'}
            </p>
            {salesPerf && (
              <p className="text-[10px] text-muted-foreground mt-1">
                {salesPerf.summary.top_payment_percentage}% of transactions
              </p>
            )}
          </div>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              {['Daily Sales Summary', 'Payment Method Breakdown', 'Total Transactions'].map(r => (
                <li key={r} className="group flex items-center justify-between text-sm py-2 px-3 rounded-md hover:bg-muted cursor-pointer transition-colors">
                  <span className="font-medium">{r}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs gap-1"
              disabled={loadingSales || !salesPerf}
              onClick={() => salesPerf?.data && downloadCSV(salesPerf.data, 'sales-performance')}
            >
              {loadingSales ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
              Export CSV
            </Button>
          </CardFooter>
        </Card>

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
