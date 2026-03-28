// CUSTOMERS PAGE WITH INLINE SIDE PANEL (PREMIUM UX)
import React, { useEffect, useMemo, useState } from "react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Users, Search, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerModal } from "./modals/CustomerModal"; // ← USE PANEL (NOT MODAL)

// ... keep imports the same

export const CustomersPage = () => {
  // ... keep all your logic/memo hooks exactly as they are

  return (
    <div className="relative flex w-full h-full overflow-hidden">
      {/* MAIN CONTENT AREA */}
      <div
        className={`
          flex-1 transition-all duration-500 ease-in-out px-1
          ${selectedCustomer ? "pr-4 lg:mr-[400px]" : ""} 
        `}
      >
        <div className="max-w-[1600px] mx-auto space-y-8 pb-10">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Customers</h1>
              <p className="text-muted-foreground mt-1">
                {repeatCustomers.length} repeat customers generating <span className="text-primary font-semibold">{Math.round((repeatCustomers.reduce((s, c) => s + c.total_spent, 0) / (totalRevenue || 1)) * 100)}%</span> of revenue
              </p>
            </div>
            
            <div className="flex gap-2 bg-muted/50 p-1 rounded-lg border">
              {['all', 'vip', 'at_risk'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setSegmentFilter(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${segmentFilter === tab ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {tab.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* KPI GRID - Tightened padding and subtle borders */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Total Customers" value={customers.length} icon={<Users className="w-4 h-4" />} />
            <KPICard title="Active This Month" value={activeThisMonth} icon={<Calendar className="w-4 h-4" />} />
            <KPICard title="Avg Spend" value={`KES ${Math.round(avgSpend).toLocaleString()}`} icon={<TrendingUp className="w-4 h-4 text-emerald-500" />} />
            <KPICard title="Repeat Rate" value={`${Math.round(repeatRate)}%`} icon={<TrendingUp className="w-4 h-4 text-blue-500" />} />
          </div>

          {/* TOP PERFORMERS & AT RISK SECTION */}
          <div className="grid lg:grid-cols-3 gap-6">
             {/* TOP CUSTOMERS: Added visual rank badges */}
             <Card className="lg:col-span-2">
               <CardContent className="p-6">
                 <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-muted-foreground">Top Contributors</h3>
                 <div className="grid md:grid-cols-3 gap-4">
                    {topCustomers.map((c, i) => (
                      <div 
                        key={c.customer_name} 
                        onClick={() => setSelectedCustomer(c)}
                        className="group relative p-4 rounded-xl border bg-gradient-to-br from-background to-muted/30 cursor-pointer hover:border-primary/50 transition-all"
                      >
                        <span className="absolute top-2 right-3 text-4 font-black opacity-10 group-hover:opacity-30 transition-opacity">#0{i+1}</span>
                        <p className="font-bold truncate pr-6">{c.customer_name}</p>
                        <p className="text-xl font-black mt-1">KES {c.total_spent.toLocaleString()}</p>
                        <div className="w-full bg-muted h-1 rounded-full mt-3 overflow-hidden">
                           <div className="bg-primary h-full" style={{ width: `${Math.round((c.total_spent / (totalRevenue || 1)) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                 </div>
               </CardContent>
             </Card>

             {/* AT RISK: Cleaner list style */}
             <Card>
               <CardContent className="p-6">
                 <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-muted-foreground">Retention Alerts</h3>
                 <div className="space-y-3">
                   {atRiskCustomers.map((c) => (
                      <div key={c.customer_name} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer" onClick={() => setSelectedCustomer(c)}>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                          <span className="text-sm font-medium">{c.customer_name}</span>
                        </div>
                        <span className="text-xs font-bold">KES {c.total_spent.toLocaleString()}</span>
                      </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
          </div>

          {/* MAIN LIST WITH SEARCH INTEGRATED */}
          <div className="space-y-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search by name, order ID, or amount..." 
                className="pl-10 h-12 bg-muted/20 border-none ring-1 ring-border focus:ring-2 focus:ring-primary"
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>

            <Card className="overflow-hidden border-none shadow-none bg-transparent">
               <div className="grid gap-2">
                  {paginatedCustomers.map((c, i) => (
                    <div
                      key={c.customer_name}
                      onClick={() => setSelectedCustomer(c)}
                      className={`
                        p-4 flex justify-between items-center rounded-xl border transition-all
                        ${selectedCustomer?.customer_name === c.customer_name 
                          ? "bg-primary/5 border-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]" 
                          : "bg-card hover:border-muted-foreground/30 hover:shadow-md"}
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div className="hidden md:flex w-8 h-8 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-bold">{c.customer_name}</p>
                          <p className="text-xs text-muted-foreground flex gap-2">
                            <span>{c.transactions} orders</span>
                            <span>•</span>
                            <span>Last active {new Date(c.last_purchase).toLocaleDateString()}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black tracking-tight">KES {c.total_spent.toLocaleString()}</p>
                        <Badge variant="outline" className="text-[9px] py-0">{c.segment.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                  ))}
               </div>
            </Card>
          </div>
        </div>
      </div>

      {/* SIDE PANEL: Fixed width slide-over */}
      {selectedCustomer && (
        <div className="hidden lg:block fixed right-0 top-0 h-screen w-[400px] border-l bg-background shadow-2xl z-50">
          <CustomerModal
            customer={selectedCustomer}
            sales={customerSales}
            onClose={() => setSelectedCustomer(null)}
          />
        </div>
      )}
    </div>
  );
};
