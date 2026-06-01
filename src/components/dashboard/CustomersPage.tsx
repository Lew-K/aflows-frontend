import React, { useEffect, useMemo, useState } from "react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/apiFetch";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Users, Search, Calendar, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerModal } from "./modals/CustomerModal";

export const CustomersPage = () => {
  const { user, accessToken } = useAuth();
  const { customers: contextCustomers, isFetching } = useData();
  const businessId = user?.businessId || "";
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("total_spent");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [salesCache, setSalesCache] = useState<Record<string, any[]>>({});
  const [loadingSales, setLoadingSales] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  useEffect(() => {
    if (!businessId) return;
  
    // Use prefetched data from DataContext if available
    if (contextCustomers && contextCustomers.length > 0) {
      const normalized = contextCustomers.map((c: any) => ({
        ...c,
        segment: c.segment === 'lapsed' ? 'at_risk' : c.segment,
      }));
      setCustomers(normalized);
      setLoading(false);
      return;
    }
  
    // Fallback: fetch directly
    setLoading(true);
    apiFetch(`https://api.aflows.uk/api/v1/customers?businessId=${businessId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const normalized = d.customers.map((c: any) => ({
            ...c,
            segment: c.segment === 'lapsed' ? 'at_risk' : c.segment,
          }));
          setCustomers(normalized);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [businessId, contextCustomers]);

  useEffect(() => { setCurrentPage(1); }, [search, segmentFilter, sortBy]);

  // useEffect(() => {
  //   if (!customers.length || !businessId) return;
  
  //   const top20 = customers.slice(0, 20);
  
  //   top20.forEach(c => {
  //     if (salesCache[c.id]) return;
  
  //     apiFetch(
  //       `https://api.aflows.uk/api/v1/customers/${c.id}/sales?businessId=${businessId}`
  //     )
  //       .then(r => r.json())
  //       .then(d => {
  //         if (d.success) {
  //           setSalesCache(prev => ({
  //             ...prev,
  //             [c.id]: d.sales,
  //           }));
  //         }
  //       })
  //       .catch(() => {});
  //   });
  // }, [customers, businessId]);

  const handleSelectCustomer = async (c: any) => {
    setSelectedCustomer(c);
    setMobileSheetOpen(true);
    if (salesCache[c.id]) return; // already cached
    setLoadingSales(true);
    try {
      const res = await apiFetch(
        `https://api.aflows.uk/api/v1/customers/${c.id}/sales?businessId=${businessId}`
      );
      const d = await res.json();
      if (d.success) setSalesCache(prev => ({ ...prev, [c.id]: d.sales }));
    } catch {}
    setLoadingSales(false);
  };

  const now = new Date();
  const totalRevenue = customers.reduce((s, c) => s + Number(c.total_spent), 0);
  const avgSpend = totalRevenue / (customers.length || 1);
  const repeatCustomers = customers.filter(c => Number(c.total_orders) > 1);
  const repeatRate = (repeatCustomers.length / (customers.length || 1)) * 100;
  const activeThisMonth = customers.filter(c => {
    const d = new Date(c.last_seen_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const processedCustomers = useMemo(() => {
    let list = customers.filter(c =>
      c.customer_name?.toLowerCase().includes(search.toLowerCase())
    );
    if (segmentFilter !== "all") list = list.filter(c => c.segment === segmentFilter);
    if (sortBy === "transactions") list.sort((a, b) => b.total_orders - a.total_orders);
    else if (sortBy === "last_purchase") list.sort((a, b) => new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime());
    else list.sort((a, b) => b.total_spent - a.total_spent);
    return list;
  }, [customers, search, sortBy, segmentFilter]);

  const totalPages = Math.ceil(processedCustomers.length / PAGE_SIZE);
  const paginated = processedCustomers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (loading) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
      {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
    </div>
  );

  if (!loading && customers.length === 0) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center p-6">
      <div className="p-5 bg-muted rounded-full">
        <Users className="w-10 h-10 text-muted-foreground/40" />
      </div>
      <h2 className="text-xl font-bold">No customers yet</h2>
      <p className="text-muted-foreground max-w-sm">
        Customers are added automatically when you record a sale with a customer name. Try recording a sale first.
      </p>
      <Button variant="outline" onClick={() => window.history.back()}>
        Go to Sales
      </Button>
    </div>
  );

  return (
    <>
    {/* MOBILE BOTTOM SHEET */}
    {mobileSheetOpen && selectedCustomer && (
      <div className="fixed inset-0 z-50 lg:hidden">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => { setMobileSheetOpen(false); setSelectedCustomer(null); }}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl shadow-2xl max-h-[88vh] overflow-y-auto">
          <div className="sticky top-0 bg-card px-4 pt-4 pb-3 border-b flex items-center justify-between">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30 absolute left-1/2 -translate-x-1/2 top-2" />
            <span className="font-semibold text-sm">{selectedCustomer.customer_name}</span>
            <button onClick={() => { setMobileSheetOpen(false); setSelectedCustomer(null); }}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <CustomerModal
            customer={selectedCustomer}
            sales={loadingSales ? [] : (salesCache[selectedCustomer?.id] || [])}
            onClose={() => { setMobileSheetOpen(false); setSelectedCustomer(null); }}
          />
        </div>
      </div>
    )}
    <div className="flex h-screen bg-background/50 gap-0 overflow-hidden">
      <div className={`transition-all duration-500 ease-in-out flex flex-col h-screen ${selectedCustomer ? "w-full lg:w-[60%]" : "w-full"}`}>
        <div className="w-full space-y-6 px-6 pt-4 pb-2 flex-shrink-0">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Customers</h1>
              <p className="text-muted-foreground mt-1">
                {repeatCustomers.length} repeat customers driving {Math.round((repeatCustomers.reduce((s, c) => s + c.total_spent, 0) / (totalRevenue || 1)) * 100)}% of revenue.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Total Customers" value={customers.length} icon={<Users className="w-4 h-4 text-blue-500" />} />
            <KPICard title="Active This Month" value={activeThisMonth} icon={<Calendar className="w-4 h-4 text-green-500" />} />
            <KPICard title="Avg Spend" value={`KES ${Math.round(avgSpend).toLocaleString()}`} icon={<TrendingUp className="w-4 h-4 text-orange-500" />} />
            <KPICard title="Repeat Rate" value={`${Math.round(repeatRate)}%`} icon={<Users className="w-4 h-4 text-purple-500" />} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-card p-2 rounded-lg border shadow-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 border-none bg-transparent focus-visible:ring-0" />
            </div>
            <Select value={segmentFilter} onValueChange={setSegmentFilter}>
              <SelectTrigger className="w-36 text-sm"><SelectValue placeholder="All Segments" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Segments</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="Lapsed">Lapsed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="border-none shadow-md overflow-hidden">
            <CardContent className="p-0 divide-y">
              {paginated.map(c => (
                <div key={c.id} onClick={() => handleSelectCustomer(c)}
                  className={`p-5 flex justify-between items-center cursor-pointer transition-all hover:bg-primary/5 group border-l-4 ${selectedCustomer?.id === c.id ? "bg-primary/10 border-primary" : "border-transparent"}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      {c.customer_name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{c.customer_name}</p>
                     <p className="text-xs text-muted-foreground truncate">
                       {c.customer_phone && <span>{c.customer_phone} · </span>}
                       {c.total_orders} orders · Last {new Date(c.last_seen_at).toLocaleDateString()}
                     </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">KES {Number(c.total_spent).toLocaleString()}</p>
                    <Badge variant="outline" className="text-[9px] uppercase">{c.segment}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, processedCustomers.length)} of {processedCustomers.length}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
                <span className="text-sm font-medium">{currentPage} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedCustomer && (
        <div className="hidden lg:block w-[40%] sticky top-0 h-screen border-l bg-card shadow-2xl">
          <CustomerModal
            customer={selectedCustomer}
            sales={loadingSales ? [] : (salesCache[selectedCustomer?.id] || [])}
            onClose={() => { setSelectedCustomer(null); setMobileSheetOpen(false); }}
          />
        </div>
      )}
    </div>
  </>
  );
};

const KPICard = ({ title, value, icon }: any) => (
  <Card><CardContent className="p-4">
    <div className="flex justify-between text-xs text-muted-foreground">{title} {icon}</div>
    <p className="text-xl font-bold">{value}</p>
  </CardContent></Card>
);




// // CUSTOMERS PAGE WITH INLINE SIDE PANEL (PREMIUM UX)
// import React, { useEffect, useMemo, useState } from "react";
// import { useData } from "@/contexts/DataContext";
// import { useAuth } from "@/contexts/AuthContext";
// import { Card, CardContent } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Input } from "@/components/ui/input";
// import { Users, Search, Calendar, TrendingUp } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// import { CustomerModal } from "./modals/CustomerModal"; // ← USE PANEL (NOT MODAL)

// export const CustomersPage = () => {
//   const { user } = useAuth();
//   const { getSales, fetchSales, isFetching } = useData();

//   const businessId = user?.businessId || "";

//   // ── ALL useState DECLARATIONS FIRST ──
//   const [search, setSearch] = useState("");
//   const [sortBy, setSortBy] = useState("total_spent");
//   const [segmentFilter, setSegmentFilter] = useState("all");
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const PAGE_SIZE = 15;

//   // ── THEN useEffect HOOKS ──
//   useEffect(() => {
//     if (!businessId) return;
//     fetchSales(businessId, "all");
//   }, [businessId]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [search, segmentFilter, sortBy]);

//   // ── THEN DERIVED VALUES ──
//   const sales = getSales(businessId, "all");
//   const getKey = (businessId, period) => `${businessId}-${period}`;
//   const loading = isFetching(getKey(businessId, "all"));

//   const now = useMemo(() => new Date(), []);

//   /* ---------------- AGGREGATION ---------------- */
//   const customers = useMemo(() => {
//     const map = new Map();

//     sales.forEach((sale) => {
//       if (!sale.customer_name) return;

//       if (!map.has(sale.customer_name)) {
//         map.set(sale.customer_name, {
//           customer_name: sale.customer_name,
//           total_spent: 0,
//           transactions: 0,
//           last_purchase: sale.created_at,
//         });
//       }

//       const c = map.get(sale.customer_name);
//       c.total_spent += Number(sale.amount);
//       c.transactions += 1;

//       if (new Date(sale.created_at) > new Date(c.last_purchase)) {
//         c.last_purchase = sale.created_at;
//       }
//     });

//     return Array.from(map.values());
//   }, [sales]);

//   /* ---------------- METRICS ---------------- */
//   const totalRevenue = useMemo(
//     () => sales.reduce((sum, s) => sum + Number(s.amount || 0), 0),
//     [sales]
//   );

//   const repeatCustomers = customers.filter((c) => c.transactions > 1);
//   const avgSpend = totalRevenue / (customers.length || 1);
//   const repeatRate = (repeatCustomers.length / (customers.length || 1)) * 100;

//   const activeThisMonth = customers.filter((c) => {
//     const d = new Date(c.last_purchase);
//     return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
//   }).length;

//   /* ---------------- SEGMENTATION ---------------- */
//   const SEGMENT_DAYS = 30;
//   const VIP_THRESHOLD = avgSpend * 2;

//   const segmentedCustomers = customers.map((c) => {
//     const last = new Date(c.last_purchase);
//     const diffDays = (now - last) / (1000 * 60 * 60 * 24);

//     let segment = "regular";

//     if (c.total_spent >= VIP_THRESHOLD) segment = "vip";
//     else if (diffDays > SEGMENT_DAYS) segment = "at_risk";

//     return { ...c, segment };
//   });

//   const segmentStats = useMemo(() => {
//     const stats = {
//       vip: { count: 0, revenue: 0 },
//       regular: { count: 0, revenue: 0 },
//       at_risk: { count: 0, revenue: 0 },
//     };

//     segmentedCustomers.forEach((c) => {
//       stats[c.segment].count++;
//       stats[c.segment].revenue += c.total_spent;
//     });

//     return stats;
//   }, [segmentedCustomers]);

//   /* ---------------- TOP + AT RISK ---------------- */
//   const topCustomers = [...segmentedCustomers]
//     .sort((a, b) => b.total_spent - a.total_spent)
//     .slice(0, 3);

//   const atRiskCustomers = segmentedCustomers
//     .filter((c) => c.segment === "at_risk")
//     .slice(0, 5);

//   /* ---------------- FILTER ---------------- */
//   const processedCustomers = useMemo(() => {
//     let filtered = segmentedCustomers.filter((c) =>
//       c.customer_name.toLowerCase().includes(search.toLowerCase())
//     );

//     if (segmentFilter !== "all") {
//       filtered = filtered.filter((c) => c.segment === segmentFilter);
//     }

//     if (sortBy === "transactions") {
//       filtered.sort((a, b) => b.transactions - a.transactions);
//     } else if (sortBy === "last_purchase") {
//       filtered.sort((a, b) => new Date(b.last_purchase) - new Date(a.last_purchase));
//     } else {
//       filtered.sort((a, b) => b.total_spent - a.total_spent);
//     }

//     return filtered;
//   }, [segmentedCustomers, search, sortBy, segmentFilter]);

//   const totalPages = Math.ceil(processedCustomers.length / PAGE_SIZE);
//   const paginatedCustomers = processedCustomers.slice(
//     (currentPage - 1) * PAGE_SIZE,
//     currentPage * PAGE_SIZE
//   );


//   /* ---------------- CUSTOMER SALES ---------------- */
//   const customerSales = useMemo(() => {
//     if (!selectedCustomer) return [];

//     return sales
//       .filter((s) => s.customer_name === selectedCustomer.customer_name)
//       .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
//       .slice(0, 10);
//   }, [selectedCustomer, sales]);

//   if (loading) {
//     return (
//       <div className="p-6 space-y-4">
//         <Skeleton className="h-10 w-48" />
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//           {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
//         </div>
//         <Skeleton className="h-12 w-full rounded-lg" />
//         {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-background/50 gap-0 overflow-hidden">
//       {/* LEFT SIDE (MAIN PAGE) */}
//       <div
//         className={`
//           transition-all duration-500 ease-in-out flex flex-col h-screen
//           ${selectedCustomer ? "w-full lg:w-[60%] scale-[0.99] origin-left" : "w-full"}
//         `}
//       >
//         {/* PINNED — header + KPIs */}
//         <div className="w-full space-y-6 px-6 pt-4 pb-2 flex-shrink-0">
//           {/* HEADER */}
//           <div className="flex justify-between items-end">
//             <div>
//               <h1 className="text-3xl font-extrabold tracking-tight">Customers</h1>
//               <p className="text-muted-foreground mt-1">
//                 {repeatCustomers.length} repeat customers driving {Math.round((repeatCustomers.reduce((s, c) => s + c.total_spent, 0) / (totalRevenue || 1)) * 100)}% of revenue.
//               </p>
//             </div>
//           </div>

//           {/* KPIs */}
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//             <KPICard title="Total Customers" value={customers.length} icon={<Users className="w-4 h-4 text-blue-500" />} />
//             <KPICard title="Active Month" value={activeThisMonth} icon={<Calendar className="w-4 h-4 text-green-500" />} />
//             <KPICard title="Avg Spend" value={`KES ${Math.round(avgSpend).toLocaleString()}`} icon={<TrendingUp className="w-4 h-4 text-orange-500" />} />
//             <KPICard title="Repeat Rate" value={`${Math.round(repeatRate)}%`} icon={<Users className="w-4 h-4 text-purple-500" />} />
//           </div>
//         </div>

//         {/* SCROLLABLE — search bar + list + pagination */}
//         <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
//           <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-card p-2 rounded-lg border shadow-sm">
//             <div className="relative w-full">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search by name..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 className="pl-9 border-none bg-transparent focus-visible:ring-0"
//               />
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Filter by:</span>
//               <Select value={segmentFilter} onValueChange={setSegmentFilter}>
//                 <SelectTrigger className="w-36 text-sm">
//                   <SelectValue placeholder="All Segments" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Segments</SelectItem>
//                   <SelectItem value="vip">VIP</SelectItem>
//                   <SelectItem value="regular">Regular</SelectItem>
//                   <SelectItem value="at_risk">At Risk</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <Card className="border-none shadow-md overflow-hidden">
//             <CardContent className="p-0 divide-y">
//               {paginatedCustomers.map((c, i) => (
//                 <div
//                   key={c.customer_name}
//                   onClick={() => setSelectedCustomer(c)}
//                   className={`
//                     p-5 flex justify-between items-center cursor-pointer transition-all
//                     hover:bg-primary/5 group
//                     ${selectedCustomer?.customer_name === c.customer_name ? "bg-primary/10 border-l-4 border-primary" : "border-l-4 border-transparent"}
//                   `}
//                 >
//                   <div className="flex items-center gap-4">
//                     <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">
//                       {c.customer_name.substring(0, 2).toUpperCase()}
//                     </div>
//                     <div>
//                       <p className="font-semibold text-sm">{c.customer_name}</p>
//                       <p className="text-xs text-muted-foreground">
//                         {c.transactions} orders <span className="mx-1">•</span> Last {new Date(c.last_purchase).toLocaleDateString()}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-bold text-sm">KES {c.total_spent.toLocaleString()}</p>
//                     <Badge variant="outline" className="text-[9px] uppercase">{c.segment}</Badge>
//                   </div>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>

//           {totalPages > 1 && (
//             <div className="flex items-center justify-between pt-2">
//               <p className="text-xs text-muted-foreground">
//                 Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, processedCustomers.length)} of {processedCustomers.length} customers
//               </p>
//               <div className="flex items-center gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   disabled={currentPage === 1}
//                   onClick={() => setCurrentPage((p) => p - 1)}
//                 >
//                   Previous
//                 </Button>
//                 <span className="text-sm font-medium">
//                   {currentPage} / {totalPages}
//                 </span>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   disabled={currentPage === totalPages}
//                   onClick={() => setCurrentPage((p) => p + 1)}
//                 >
//                   Next
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* RIGHT SIDE PANEL - Fixed positioning and height */}
//       {selectedCustomer && (
//         <div className="hidden lg:block w-[40%] sticky top-0 h-screen border-l bg-card shadow-2xl">
//           <CustomerModal
//             customer={selectedCustomer}
//             sales={customerSales}
//             onClose={() => setSelectedCustomer(null)}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// const KPICard = ({ title, value, icon }) => (
//   <Card>
//     <CardContent className="p-4">
//       <div className="flex justify-between text-xs text-muted-foreground">
//         {title} {icon}
//       </div>
//       <p className="text-xl font-bold">{value}</p>
//     </CardContent>
//   </Card>
// );
