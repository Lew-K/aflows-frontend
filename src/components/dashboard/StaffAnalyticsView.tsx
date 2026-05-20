import React, { useEffect, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, TrendingUp, Package } from 'lucide-react';
import { motion } from 'framer-motion';

export const StaffAnalyticsView = ({ businessId, tier }: { businessId: string; tier: string }) => {
  const { user } = useAuth();
  const { getSales, fetchSales, isFetching, business } = useData();

  useEffect(() => {
    if (businessId) {
      fetchSales(businessId, 'today');
    }
  }, [businessId]);

  const todaySales = getSales(businessId, 'today');
  const loading = isFetching(`${businessId}-today--`);

  const todayStats = useMemo(() => {
    const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' });
    const filteredToday = todaySales.filter((s: any) =>
      s.created_at?.startsWith(todayDate)
    );
    const transactions = filteredToday.length;
    const lastCustomer = filteredToday.length > 0
      ? (filteredToday[filteredToday.length - 1] as any)?.customer_name || 'Walk-in'
      : '—';
    return { transactions, lastCustomer };
  }, [todaySales]);

  const today = new Date().toLocaleDateString('en-KE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="space-y-6 p-4 md:p-6">

      {/* Business header */}
      <div className="flex items-center gap-4">
        {business?.logo_url ? (
          <img
            src={business.logo_url}
            alt="logo"
            className="w-12 h-12 object-contain rounded-xl border bg-white"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
            {business?.business_name?.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() || 'B'}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">{business?.business_name || 'Dashboard'}</h1>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>
      </div>

      {/* Welcome */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <p className="text-sm font-medium">
          Welcome back, <span className="text-primary font-bold">{user?.ownerName}</span> 👋
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Here's what's happening today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-black">
                {loading ? '...' : todayStats.transactions}
              </p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-2">
                Transactions Today
              </p>
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
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-black truncate">
                {loading ? '...' : todayStats.lastCustomer}
              </p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-2">
                Last Customer
              </p>
            </CardContent>
          </Card>
        </motion.div>
      
        {(tier === 'growth' || tier === 'pro') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="sm:col-span-2"
          >
            <Card>
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-black">
                  {loading ? '...' : `KES ${todaySales.reduce((sum: number, s: any) => sum + (s.amount ?? 0), 0).toLocaleString()}`}
                </p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-2">
                  Revenue Today
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Actions
        </p>
      
        <div className="grid grid-cols-2 gap-3">
      
          <a
            href="/dashboard/sales"
            className="p-4 rounded-xl border bg-card hover:bg-muted/40 transition-colors flex items-center gap-3"
          >
            <ShoppingCart className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Record Sale</span>
          </a>
      
          <a
            href="/dashboard/operations"
            className="p-4 rounded-xl border bg-card hover:bg-muted/40 transition-colors flex items-center gap-3"
          >
            <Package className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Operations</span>
          </a>
      
        </div>
      </div>

    </div>
  );
};
