import React, { useEffect, useMemo, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowRight, Check, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { useNavigate } from 'react-router-dom';

interface TourStep {
  tourId: string;
  pageTitle: string;
  stepNumber: number;
  targetSelector: string;
  title: string;
  description: string;
  details?: string[];
  action?: string;
  path?: string;
  note?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    tourId: 'welcome',
    pageTitle: 'Welcome',
    stepNumber: 1,
    targetSelector: 'body',
    title: '👋 Welcome to Aflows',
    description: 'Your all-in-one business management platform. This quick tour will show you how to record sales, manage inventory, track customers, and analyze your business—all in one place.',
    details: [
      '⏱️ Takes about 2 minutes',
      '📱 Works on desktop and mobile',
      '🎯 Skip anytime with the X button'
    ],
    action: 'Ready? Click Next to get started',
  },
  
  // ===== SALES PAGE =====
  {
    tourId: 'sales',
    pageTitle: 'Sales',
    stepNumber: 2,
    targetSelector: '[data-tour="sales-form"]',
    title: '🛒 The Sales Entry Form',
    description: 'This is where all your transactions start. Every time you make a sale—whether it\'s cash, M-Pesa, or card—you record it here.',
    details: [
      '✅ Customer name is required (helps you track repeat customers)',
      '📱 Phone number is optional',
      '⏱️ Takes 30 seconds per transaction'
    ],
    action: 'Scroll down to add customer details',
    path: '/dashboard/sales',
  },

  {
    tourId: 'sales',
    pageTitle: 'Sales',
    stepNumber: 3,
    targetSelector: '[data-tour="sales-customer-name"]',
    title: '👤 Enter Customer Name (Required)',
    description: 'Always enter the customer\'s name here. This is crucial for tracking who bought what and building your customer database.',
    details: [
      '💡 "John" or "John Smith" both work',
      '📊 Helps you identify your best customers later',
      '🔄 Repeat customers will auto-appear in a dropdown',
      '⚠️ Cannot use "Walk-in"—use actual names'
    ],
    action: 'Next, let\'s add the phone number',
  },

  {
    tourId: 'sales',
    pageTitle: 'Sales',
    stepNumber: 4,
    targetSelector: '[data-tour="sales-phone"]',
    title: '📞 Phone Number (Optional)',
    description: 'Below the customer name, you can optionally add their phone number. This is helpful for follow-ups and marketing.',
    details: [
      '🆓 Not required—you can skip it',
      '📞 +254 or 07XXXXXXXX formats both work',
      '💬 Useful for SMS reminders or promotions'
    ],
    action: 'Now let\'s add items to the sale',
  },

  {
    tourId: 'sales',
    pageTitle: 'Sales',
    stepNumber: 5,
    targetSelector: '[data-tour="sales-items"]',
    title: '📦 Add Items to the Sale',
    description: 'Type the product or service name. If it\'s in your inventory, Aflows auto-fills the price. If not, you can enter it manually.',
    details: [
      '💰 If tracked in Inventory: price auto-fills',
      '🆕 New items: enter the price manually',
      '🔢 Quantity auto-defaults to 1 (edit as needed)',
      '➕ Click "Add Another Item" for multiple products'
    ],
    action: 'Next, we\'ll set the payment method',
  },

  {
    tourId: 'sales',
    pageTitle: 'Sales',
    stepNumber: 6,
    targetSelector: '[data-tour="sales-payment"]',
    title: '💳 Payment Method & Reference',
    description: 'Select how the customer paid. For M-Pesa and card, include the transaction reference for your records.',
    details: [
      '💵 Cash: no reference needed',
      '📱 M-Pesa: include the STK transaction code',
      '🏦 Card: note the last 4 digits or reference',
      '📝 This helps you reconcile payments later'
    ],
    action: 'Let\'s see where your receipts appear',
  },

  {
    tourId: 'sales',
    pageTitle: 'Sales',
    stepNumber: 7,
    targetSelector: '[data-tour="recent-sales"]',
    title: '📋 Your Recent Sales List',
    description: 'Every transaction you record appears here. You can download a PDF receipt, edit, or delete any sale.',
    details: [
      '📥 Download icon: saves a PDF receipt',
      '✏️ Edit button: change customer/amount',
      '🗑️ Delete: remove incorrect entries',
      '💾 All receipts show customer name and payment method'
    ],
    action: 'Now let\'s look at your analytics',
    // path: '/dashboard',
  },

  // ===== ANALYTICS PAGE =====
  {
    tourId: 'analytics',
    pageTitle: 'Analytics',
    stepNumber: 8,
    targetSelector: '[data-tour="analytics-kpis"]',
    title: '📊 Your Key Business Metrics',
    description: 'At a glance: total revenue, number of sales, average transaction size, and payment breakdown. Green = good trend, red = declining.',
    details: [
      '💰 Total Revenue: sum of all sales',
      '🛒 Total Sales: number of transactions',
      '💵 Payment Methods: which pays most',
      '👥 Customers: new vs repeat (Growth/Pro only)'
    ],
    action: 'Select a time period to filter the data',
    path: '/dashboard',
  },

  {
    tourId: 'analytics',
    pageTitle: 'Analytics',
    stepNumber: 9,
    targetSelector: '[data-tour="analytics-period-selector"]',
    title: '📅 Choose Your Time Period',
    description: 'View sales by Today, This Week, This Month, Last Month, or any Custom Range. Perfect for spotting trends.',
    details: [
      '📈 Today: did you have a good day?',
      '📊 This Month: on track for your goal?',
      '🔄 Last Month: compare month-to-month',
      '🎯 Custom: analyze any date range'
    ],
    action: 'Scroll down to see detailed charts',
  },

  {
    tourId: 'analytics',
    pageTitle: 'Analytics',
    stepNumber: 10,
    targetSelector: '[data-tour="revenue-trend"]',
    title: '📈 Revenue Trend Chart',
    description: 'Visual breakdown of your revenue over time. Switch between Monthly (overview) and Daily (detail) view.',
    details: [
      '📉 Spot seasonal patterns (high/low days)',
      '🎯 Identify your best-performing weeks',
      '⏰ Plan promotions based on slow periods',
      '📊 See exactly how much you made each day'
    ],
    action: 'Check which products sell best',
  },

  {
    tourId: 'analytics',
    pageTitle: 'Analytics',
    stepNumber: 11,
    targetSelector: '[data-tour="top-selling-items"]',
    title: '🏆 Top Selling Items',
    description: 'Which products move the most units (Items Sold) or generate the most revenue (Revenue). Switch between Bar and Pie charts.',
    details: [
      '📊 Items Sold: your volume leaders',
      '💰 Revenue: your profit generators',
      '🎨 Bar chart: easy to compare',
      '🥧 Pie chart: see proportions at a glance'
    ],
    action: 'Next, see your payment method breakdown',
  },

  {
    tourId: 'analytics',
    pageTitle: 'Analytics',
    stepNumber: 12,
    targetSelector: '[data-tour="payment-breakdown"]',
    title: '💳 Payment Methods Breakdown',
    description: 'Which payment method brings in the most revenue? M-Pesa, cash, card—see the split in percentages.',
    details: [
      '📱 M-Pesa dominant? Good for mobile customers',
      '💵 Cash heavy? Keep change on hand',
      '🏦 Card-heavy? Ensure payment processor working',
      '⚖️ Balance = less risk from any single method'
    ],
    action: 'Now let\'s manage your inventory',
    // path: '/dashboard/inventory',
  },

  // ===== INVENTORY PAGE =====
  {
    tourId: 'inventory',
    pageTitle: 'Inventory',
    stepNumber: 13,
    targetSelector: '[data-tour="low-stock-alert"]',
    title: '⚠️ Low Stock Alert',
    description: 'Items running out appear here in red. Never surprise a customer by being out of stock—this keeps you ahead.',
    details: [
      '🔴 Red = critical (0 units)',
      '🟠 Orange = low (below threshold)',
      '🟢 Green = healthy stock',
      '✏️ Click to adjust thresholds per product'
    ],
    action: 'Let\'s add and manage products',
    path: '/dashboard/inventory',
  },

  {
    tourId: 'inventory',
    pageTitle: 'Inventory',
    stepNumber: 14,
    targetSelector: '[data-tour="inventory-actions"]',
    title: '📦 Manage Your Inventory',
    description: 'Three ways to update stock: add a single product, bulk restock multiple items, or import hundreds via Excel.',
    details: [
      '➕ New Product: add 1 item with cost/price',
      '🔄 Bulk Restock: update 10+ items at once',
      '📊 Import Excel: load hundreds from CSV',
      '⏰ Pick the fastest method for your needs'
    ],
    action: 'See your inventory in the table below',
  },

  {
    tourId: 'inventory',
    pageTitle: 'Inventory',
    stepNumber: 15,
    targetSelector: '[data-tour="inventory-table"]',
    title: '📋 Your Inventory List',
    description: 'All products with current stock, cost, selling price, and status. Restock any item with one click.',
    details: [
      '📊 Stock column: units available',
      '💰 Value: stock × cost price',
      '🟢 Status badge: in stock / low / out',
      '🔄 Restock button: quick restocking'
    ],
    action: 'Now let\'s track your customers',
    // path: '/dashboard/customers',
  },

  // ===== CUSTOMERS PAGE =====
  {
    tourId: 'customers',
    pageTitle: 'Customers',
    stepNumber: 16,
    targetSelector: '[data-tour="customer-kpis"]',
    title: '👥 Customer Insights (Growth/Pro)',
    description: 'See your total customers, active this month, average spend per customer, and repeat rate.',
    details: [
      '📈 High repeat rate = loyal customers',
      '💰 Avg spend guides your promotions',
      '📱 Active this month = engagement level',
      '🎯 Use to segment marketing campaigns'
    ],
    action: 'Filter and search customers',
    path: '/dashboard/customers',
  },

  {
    tourId: 'customers',
    pageTitle: 'Customers',
    stepNumber: 17,
    targetSelector: '[data-tour="customer-filters"]',
    title: '🔍 Search & Filter Customers',
    description: 'Find customers by name or filter by segment: VIP (high spenders), Regular, or At Risk (inactive).',
    details: [
      '🔴 VIP: your top 20% (do not lose them)',
      '🟢 Regular: steady, reliable buyers',
      '🟡 At Risk: haven\'t bought in 30+ days',
      '📞 Use segments for targeted outreach'
    ],
    action: 'Click a customer to see their history',
  },

  {
    tourId: 'customers',
    pageTitle: 'Customers',
    stepNumber: 18,
    targetSelector: '[data-tour="customer-list"]',
    title: '📱 Customer Profiles',
    description: 'Click any customer to see their full purchase history, total spent, phone number, and contact info.',
    details: [
      '📞 Phone: call/SMS for follow-up',
      '💰 Total Spent: lifetime value',
      '📅 Last Purchase: when did they buy?',
      '📊 Order Count: frequency of purchases'
    ],
    action: 'Let\'s manage your daily tasks',
    // path: '/dashboard/operations',
  },

  // ===== OPERATIONS PAGE =====
  {
    tourId: 'operations',
    pageTitle: 'Operations',
    stepNumber: 19,
    targetSelector: '[data-tour="operations-search"]',
    title: '🔍 Task Search',
    description: 'Quickly find any task by typing keywords. Supports tag filtering too.',
    details: [
      '⌨️ Type to search live',
      '⌘K shortcut: jump to search anytime',
      '🏷️ Filter by Sales, Admin, Inventory tags',
      '✅ See completed tasks separately'
    ],
    action: 'Filter tasks by category',
    path: '/dashboard/operations',
  },

  {
    tourId: 'operations',
    pageTitle: 'Operations',
    stepNumber: 20,
    targetSelector: '[data-tour="operations-filters"]',
    title: '🏷️ Task Categories',
    description: 'Organize tasks into Sales, Admin, Inventory, Operations, or Marketing. Helps you stay focused.',
    details: [
      '🛍️ Sales: customer orders, follow-ups',
      '⚙️ Admin: accounting, reports, settings',
      '📦 Inventory: restock, orders',
      '🎯 Operations: daily operations, processes'
    ],
    action: 'Now focus on high-priority tasks',
  },

  {
    tourId: 'operations',
    pageTitle: 'Operations',
    stepNumber: 21,
    targetSelector: '[data-tour="operations-focus"]',
    title: '🎯 Focus Mode',
    description: 'Three views: All Tasks, High Priority (urgent/overdue), or Due Today (what\'s due now?).',
    details: [
      '🔥 High Priority: overdue items highlighted',
      '📅 Due Today: won\'t show tomorrow tasks',
      '🔄 All: your complete task list',
      '✅ Use "Due Today" each morning'
    ],
    action: 'Add a quick task or recurring automation',
  },

  {
    tourId: 'operations',
    pageTitle: 'Operations',
    stepNumber: 22,
    targetSelector: '[data-tour="operations-tasks"]',
    title: '✅ Complete Your Tasks',
    description: 'Check off tasks as done. Create recurring automations so routine work repeats automatically.',
    details: [
      '✓ Click checkbox: mark as complete',
      '🔄 Recurring: daily, weekly, monthly automations',
      '⏰ Overdue tasks: orange highlight',
      '🎯 High priority: red left border'
    ],
    action: 'Finally, let\'s customize your settings',
    // path: '/dashboard/settings',
  },

  // ===== SETTINGS PAGE =====
  {
    tourId: 'settings',
    pageTitle: 'Settings',
    stepNumber: 23,
    targetSelector: '[data-tour="settings-logo"]',
    title: '🎨 Your Business Logo',
    description: 'Upload your logo. It appears on all receipts, reports, and documents automatically.',
    details: [
      '📸 PNG or JPG, max 5MB',
      '🖼️ Shows on every receipt PDF',
      '🎯 Builds brand recognition',
      '♻️ Update anytime (Old receipts unaffected)'
    ],
    action: 'Set up your business info',
    path: '/dashboard/settings',
  },

  {
    tourId: 'settings',
    pageTitle: 'Settings',
    stepNumber: 24,
    targetSelector: '[data-tour="settings-profile"]',
    title: '🏢 Business Profile',
    description: 'Your business name, phone, location. These appear on receipts so customers know who to contact.',
    details: [
      '📞 Your business phone number',
      '📍 Location: Nairobi, Mombasa, etc.',
      '🌍 Website or social media',
      '🔍 Customers use this to reach you'
    ],
    action: 'Customize how receipts look',
  },

  {
    tourId: 'settings',
    pageTitle: 'Settings',
    stepNumber: 25,
    targetSelector: '[data-tour="settings-receipt"]',
    title: '🧾 Receipt Customization',
    description: 'Configure receipt prefix, numbering, tax rate, discounts, and footer message.',
    details: [
      '🔢 Prefix: RCT, INV, etc. (you choose)',
      '💰 Tax rate: 16% VAT or custom',
      '🏷️ Default discount: percent or fixed amount',
      '✍️ Footer: "Thank you" message'
    ],
    action: 'See a live preview of your receipt',
  },

  {
    tourId: 'settings',
    pageTitle: 'Settings',
    stepNumber: 26,
    targetSelector: '[data-tour="settings-receipt-preview"]',
    title: '👀 Live Receipt Preview',
    description: 'This shows exactly how your receipts will print. Updates in real-time as you customize.',
    details: [
      '🎯 Logo appears at top',
      '📋 Sample items with tax/discount',
      '💵 Total calculation shown',
      '📞 Business info visible to customers'
    ],
    action: 'Check your subscription status',
  },

  {
    tourId: 'settings',
    pageTitle: 'Settings',
    stepNumber: 27,
    targetSelector: '[data-tour="settings-subscription"]',
    title: '👑 Your Subscription Plan',
    description: 'See your current plan (Starter, Growth, Pro), trial status, and renewal date. Upgrade anytime.',
    details: [
      '🎯 Starter: sales + receipts only',
      '📦 Growth: + inventory + reports',
      '👑 Pro: everything + unlimited staff',
      '⏰ All new users get 30 days Pro free'
    ],
    action: 'Manage team access and security',
  },

  {
    tourId: 'settings',
    pageTitle: 'Settings',
    stepNumber: 28,
    targetSelector: '[data-tour="settings-team"]',
    title: '🔐 Team & Security',
    description: 'Invite staff (Growth/Pro), change your password, and see active devices/sessions.',
    details: [
      '👥 Invite staff with role restrictions',
      '🔒 Change password regularly',
      '📱 View/revoke logged-in devices',
      '🚪 Sign out of all devices at once'
    ],
    action: 'You\'re all set!',
  },

  {
    tourId: 'finish',
    pageTitle: 'Finish',
    stepNumber: 29,
    targetSelector: 'body',
    title: '🎉 You\'re Ready!',
    description: 'You now know Aflows inside and out. Start recording sales, track inventory, analyze trends, and grow your business.',
    details: [
      '💡 Bookmark this tour: click Help anytime',
      '📞 Support: email hello@aflows.uk',
      '🚀 Explore advanced features as you grow',
      '✨ Your success is our mission'
    ],
    note: '✅ Tour completed! Happy selling!'
  },
];

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const OnboardingTour = ({
  onClose,
  tourId,
}: {
  onClose: () => void;
  tourId: string;
}) => {

  const steps = useMemo(
    () => TOUR_STEPS.filter(step => step.tourId === tourId),
    [tourId]
  );
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem(`tour-${tourId}-step`);
    return saved ? Number(saved) : 0;
  });
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  // const navigate = useNavigate();
  const current = steps[step];
  const isLast = step === steps.length - 1;
  const isFirst = step === 0;
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(`tour-${tourId}-step`, step.toString());
  }, [step, tourId]);
      
  useEffect(() => {
    if (!current.targetSelector || current.targetSelector === 'body') {
      setSpotlightRect(null);
      return;
    }

    const findElement = () => {
      const el = document.querySelector(current.targetSelector);
      if (!el) return null;

      const rect = el.getBoundingClientRect();
      return rect;
    };

    let attempts = 0;
    const tryFind = () => {
      const rect = findElement();
      if (rect && rect.width > 0 && rect.height > 0) {
        setSpotlightRect({
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16,
        });

        // Scroll into view smoothly
        const el = document.querySelector(current.targetSelector);
        if (el) {
          const elementTop = rect.top + window.scrollY;
          window.scrollTo({
            top: Math.max(0, elementTop - 250),
            behavior: 'smooth',
          });
        }
      } else if (attempts < 10) {
        attempts++;
        setTimeout(tryFind, 200);
      }
    };

    tryFind();
  }, [step, current.targetSelector]);

  const goNext = () => {
    if (isLast) {
      localStorage.setItem(
        `tour-${tourId}-completed`,
        'true'
      );
      onClose();
      return;
    }
    setStep(s => s + 1);
  };

  const goPrev = () => {
    if (!isFirst) setStep(s => s - 1);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && !isLast) goNext();
      if (e.key === 'ArrowLeft' && !isFirst) goPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, isLast, isFirst]);

  useEffect(() => {
    setMobileExpanded(false);
  }, [step]);

  return (
    <>
      {/* Dark overlay */}
      <div className="fixed inset-0 z-40 bg-black/50 pointer-events-none" />

      {/* Spotlight effect */}
      {spotlightRect && spotlightRect.width > 0 && (
        <>
          <div
            className="fixed z-40 bg-black/60 pointer-events-none transition-all duration-300"
            style={{
              top: 0,
              left: 0,
              right: 0,
              height: spotlightRect.top,
            }}
          />
          <div
            className="fixed z-40 bg-black/60 pointer-events-none transition-all duration-300"
            style={{
              top: spotlightRect.top + spotlightRect.height,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          <div
            className="fixed z-40 bg-black/60 pointer-events-none transition-all duration-300"
            style={{
              top: spotlightRect.top,
              left: 0,
              width: spotlightRect.left,
              height: spotlightRect.height,
            }}
          />
          <div
            className="fixed z-40 bg-black/60 pointer-events-none transition-all duration-300"
            style={{
              top: spotlightRect.top,
              right: 0,
              width: window.innerWidth - (spotlightRect.left + spotlightRect.width),
              height: spotlightRect.height,
            }}
          />
          <div
            className="fixed z-40 border-2 border-primary rounded-lg shadow-lg shadow-primary/50 pointer-events-none transition-all duration-300"
            style={{
              top: spotlightRect.top,
              left: spotlightRect.left,
              width: spotlightRect.width,
              height: spotlightRect.height,
            }}
          />
        </>
      )}

      {/* Tour panel */}
      <div
        ref={panelRef}
        className="
          fixed z-50
          bottom-4 left-4 right-4
          sm:bottom-6 sm:right-6 sm:left-auto sm:w-[420px]
        "
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`
            bg-card border border-border shadow-2xl
            rounded-2xl
            overflow-hidden
            transition-all duration-300
            ${
              mobileExpanded
                ? 'max-h-[80vh]'
                : 'max-h-[180px] sm:max-h-[85vh]'
            }
          `}
        >
          {/* Header */}

          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b sticky top-0 bg-card">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`h-1 rounded-full transition-all ${
                    i === step
                      ? 'w-8 bg-primary'
                      : i < step
                      ? 'w-2 bg-primary/40'
                      : 'w-2 bg-muted'
                  }`}
                />
              ))}
            </div>
          
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {step + 1}/{steps.length}
              </span>
          
              {/* Mobile expand/collapse */}
              <button
                className="sm:hidden text-xs px-2 py-1 border rounded"
                onClick={() => setMobileExpanded(v => !v)}
              >
                {mobileExpanded ? 'Hide' : 'More'}
              </button>
          
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b sticky top-0 bg-card">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`h-1 rounded-full transition-all ${
                    i === step ? 'w-8 bg-primary' : i < step ? 'w-2 bg-primary/40' : 'w-2 bg-muted'
                  }`}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              {step + 1}/{steps.length}
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div> */}

          {/* Content */}
          <div
            className={`
              p-5
              space-y-4
              overflow-y-auto
              ${
                mobileExpanded
                  ? 'block'
                  : 'max-h-[90px] sm:max-h-none'
              }
            `}
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">
                {current.pageTitle}
              </p>
              <h3 className="text-lg font-bold leading-tight">{current.title}</h3>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {mobileExpanded
                ? current.description
                : `${current.description.slice(0, 80)}...`}
            </p>

            {current.details && (mobileExpanded || window.innerWidth >= 640) && (
              <div className="space-y-2 pl-3 border-l-2 border-primary/30">
                {current.details.map((detail, i) => (
                  <p key={i} className="text-xs text-muted-foreground leading-relaxed">
                    {detail}
                  </p>
                ))}
              </div>
            )}

            {current.action && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-primary font-medium">→ {current.action}</p>
              </div>
            )}

            {current.note && (
              <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                <p className="text-xs text-success font-medium">{current.note}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 pb-5 pt-3 border-t flex items-center gap-2 sticky bottom-0 bg-card">
            {!isFirst && (
              <Button variant="outline" size="sm" onClick={goPrev}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="sm"
              onClick={goNext}
              className="flex-1"
            >
              {isLast ? (
                <>
                  <Check className="w-4 h-4 mr-1" /> Finish
                </>
              ) : (
                <>
                  Next <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  );
};




// import React, { useEffect, useMemo, useState, useRef } from 'react';
// import { motion } from 'framer-motion';
// import { X, ArrowRight, Check, ChevronLeft } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { useNavigate } from 'react-router-dom';

// interface TourStep {
//   pageTitle: string;
//   stepNumber: number;
//   targetSelector: string;
//   title: string;
//   description: string;
//   details?: string[];
//   action?: string;
//   path?: string;
//   note?: string;
// }

// const TOUR_STEPS: TourStep[] = [
//   {
//     pageTitle: 'Welcome',
//     stepNumber: 1,
//     targetSelector: 'body',
//     title: '👋 Welcome to Aflows',
//     description: 'Your all-in-one business management platform. This quick tour will show you how to record sales, manage inventory, track customers, and analyze your business—all in one place.',
//     details: [
//       '⏱️ Takes about 2 minutes',
//       '📱 Works on desktop and mobile',
//       '🎯 Skip anytime with the X button'
//     ],
//     action: 'Ready? Click Next to get started',
//   },
  
//   // ===== SALES PAGE =====
//   {
//     pageTitle: 'Sales',
//     stepNumber: 2,
//     targetSelector: '[data-tour="sales-form"]',
//     title: '🛒 The Sales Entry Form',
//     description: 'This is where all your transactions start. Every time you make a sale—whether it\'s cash, M-Pesa, or card—you record it here.',
//     details: [
//       '✅ Customer name is required (helps you track repeat customers)',
//       '📱 Phone number is optional',
//       '⏱️ Takes 30 seconds per transaction'
//     ],
//     action: 'Scroll down to add customer details',
//     path: '/dashboard/sales',
//   },

//   {
//     pageTitle: 'Sales',
//     stepNumber: 3,
//     targetSelector: '[data-tour="sales-customer-name"]',
//     title: '👤 Enter Customer Name (Required)',
//     description: 'Always enter the customer\'s name here. This is crucial for tracking who bought what and building your customer database.',
//     details: [
//       '💡 "John" or "John Smith" both work',
//       '📊 Helps you identify your best customers later',
//       '🔄 Repeat customers will auto-appear in a dropdown',
//       '⚠️ Cannot use "Walk-in"—use actual names'
//     ],
//     action: 'Next, let\'s add the phone number',
//   },

//   {
//     pageTitle: 'Sales',
//     stepNumber: 4,
//     targetSelector: '[data-tour="sales-phone"]',
//     title: '📞 Phone Number (Optional)',
//     description: 'Below the customer name, you can optionally add their phone number. This is helpful for follow-ups and marketing.',
//     details: [
//       '🆓 Not required—you can skip it',
//       '📞 +254 or 07XXXXXXXX formats both work',
//       '💬 Useful for SMS reminders or promotions'
//     ],
//     action: 'Now let\'s add items to the sale',
//   },

//   {
//     pageTitle: 'Sales',
//     stepNumber: 5,
//     targetSelector: '[data-tour="sales-items"]',
//     title: '📦 Add Items to the Sale',
//     description: 'Type the product or service name. If it\'s in your inventory, Aflows auto-fills the price. If not, you can enter it manually.',
//     details: [
//       '💰 If tracked in Inventory: price auto-fills',
//       '🆕 New items: enter the price manually',
//       '🔢 Quantity auto-defaults to 1 (edit as needed)',
//       '➕ Click "Add Another Item" for multiple products'
//     ],
//     action: 'Next, we\'ll set the payment method',
//   },

//   {
//     pageTitle: 'Sales',
//     stepNumber: 6,
//     targetSelector: '[data-tour="sales-payment"]',
//     title: '💳 Payment Method & Reference',
//     description: 'Select how the customer paid. For M-Pesa and card, include the transaction reference for your records.',
//     details: [
//       '💵 Cash: no reference needed',
//       '📱 M-Pesa: include the STK transaction code',
//       '🏦 Card: note the last 4 digits or reference',
//       '📝 This helps you reconcile payments later'
//     ],
//     action: 'Let\'s see where your receipts appear',
//   },

//   {
//     pageTitle: 'Sales',
//     stepNumber: 7,
//     targetSelector: '[data-tour="recent-sales"]',
//     title: '📋 Your Recent Sales List',
//     description: 'Every transaction you record appears here. You can download a PDF receipt, edit, or delete any sale.',
//     details: [
//       '📥 Download icon: saves a PDF receipt',
//       '✏️ Edit button: change customer/amount',
//       '🗑️ Delete: remove incorrect entries',
//       '💾 All receipts show customer name and payment method'
//     ],
//     action: 'Now let\'s look at your analytics',
//     // path: '/dashboard',
//   },

//   // ===== ANALYTICS PAGE =====
//   {
//     pageTitle: 'Analytics',
//     stepNumber: 8,
//     targetSelector: '[data-tour="analytics-kpis"]',
//     title: '📊 Your Key Business Metrics',
//     description: 'At a glance: total revenue, number of sales, average transaction size, and payment breakdown. Green = good trend, red = declining.',
//     details: [
//       '💰 Total Revenue: sum of all sales',
//       '🛒 Total Sales: number of transactions',
//       '💵 Payment Methods: which pays most',
//       '👥 Customers: new vs repeat (Growth/Pro only)'
//     ],
//     action: 'Select a time period to filter the data',
//     path: '/dashboard',
//   },

//   {
//     pageTitle: 'Analytics',
//     stepNumber: 9,
//     targetSelector: '[data-tour="analytics-period-selector"]',
//     title: '📅 Choose Your Time Period',
//     description: 'View sales by Today, This Week, This Month, Last Month, or any Custom Range. Perfect for spotting trends.',
//     details: [
//       '📈 Today: did you have a good day?',
//       '📊 This Month: on track for your goal?',
//       '🔄 Last Month: compare month-to-month',
//       '🎯 Custom: analyze any date range'
//     ],
//     action: 'Scroll down to see detailed charts',
//   },

//   {
//     pageTitle: 'Analytics',
//     stepNumber: 10,
//     targetSelector: '[data-tour="revenue-trend"]',
//     title: '📈 Revenue Trend Chart',
//     description: 'Visual breakdown of your revenue over time. Switch between Monthly (overview) and Daily (detail) view.',
//     details: [
//       '📉 Spot seasonal patterns (high/low days)',
//       '🎯 Identify your best-performing weeks',
//       '⏰ Plan promotions based on slow periods',
//       '📊 See exactly how much you made each day'
//     ],
//     action: 'Check which products sell best',
//   },

//   {
//     pageTitle: 'Analytics',
//     stepNumber: 11,
//     targetSelector: '[data-tour="top-selling-items"]',
//     title: '🏆 Top Selling Items',
//     description: 'Which products move the most units (Items Sold) or generate the most revenue (Revenue). Switch between Bar and Pie charts.',
//     details: [
//       '📊 Items Sold: your volume leaders',
//       '💰 Revenue: your profit generators',
//       '🎨 Bar chart: easy to compare',
//       '🥧 Pie chart: see proportions at a glance'
//     ],
//     action: 'Next, see your payment method breakdown',
//   },

//   {
//     pageTitle: 'Analytics',
//     stepNumber: 12,
//     targetSelector: '[data-tour="payment-breakdown"]',
//     title: '💳 Payment Methods Breakdown',
//     description: 'Which payment method brings in the most revenue? M-Pesa, cash, card—see the split in percentages.',
//     details: [
//       '📱 M-Pesa dominant? Good for mobile customers',
//       '💵 Cash heavy? Keep change on hand',
//       '🏦 Card-heavy? Ensure payment processor working',
//       '⚖️ Balance = less risk from any single method'
//     ],
//     action: 'Now let\'s manage your inventory',
//     // path: '/dashboard/inventory',
//   },

//   // ===== INVENTORY PAGE =====
//   {
//     pageTitle: 'Inventory',
//     stepNumber: 13,
//     targetSelector: '[data-tour="low-stock-alert"]',
//     title: '⚠️ Low Stock Alert',
//     description: 'Items running out appear here in red. Never surprise a customer by being out of stock—this keeps you ahead.',
//     details: [
//       '🔴 Red = critical (0 units)',
//       '🟠 Orange = low (below threshold)',
//       '🟢 Green = healthy stock',
//       '✏️ Click to adjust thresholds per product'
//     ],
//     action: 'Let\'s add and manage products',
//     path: '/dashboard/inventory',
//   },

//   {
//     pageTitle: 'Inventory',
//     stepNumber: 14,
//     targetSelector: '[data-tour="inventory-actions"]',
//     title: '📦 Manage Your Inventory',
//     description: 'Three ways to update stock: add a single product, bulk restock multiple items, or import hundreds via Excel.',
//     details: [
//       '➕ New Product: add 1 item with cost/price',
//       '🔄 Bulk Restock: update 10+ items at once',
//       '📊 Import Excel: load hundreds from CSV',
//       '⏰ Pick the fastest method for your needs'
//     ],
//     action: 'See your inventory in the table below',
//   },

//   {
//     pageTitle: 'Inventory',
//     stepNumber: 15,
//     targetSelector: '[data-tour="inventory-table"]',
//     title: '📋 Your Inventory List',
//     description: 'All products with current stock, cost, selling price, and status. Restock any item with one click.',
//     details: [
//       '📊 Stock column: units available',
//       '💰 Value: stock × cost price',
//       '🟢 Status badge: in stock / low / out',
//       '🔄 Restock button: quick restocking'
//     ],
//     action: 'Now let\'s track your customers',
//     // path: '/dashboard/customers',
//   },

//   // ===== CUSTOMERS PAGE =====
//   {
//     pageTitle: 'Customers',
//     stepNumber: 16,
//     targetSelector: '[data-tour="customer-kpis"]',
//     title: '👥 Customer Insights (Growth/Pro)',
//     description: 'See your total customers, active this month, average spend per customer, and repeat rate.',
//     details: [
//       '📈 High repeat rate = loyal customers',
//       '💰 Avg spend guides your promotions',
//       '📱 Active this month = engagement level',
//       '🎯 Use to segment marketing campaigns'
//     ],
//     action: 'Filter and search customers',
//     path: '/dashboard/customers',
//   },

//   {
//     pageTitle: 'Customers',
//     stepNumber: 17,
//     targetSelector: '[data-tour="customer-filters"]',
//     title: '🔍 Search & Filter Customers',
//     description: 'Find customers by name or filter by segment: VIP (high spenders), Regular, or At Risk (inactive).',
//     details: [
//       '🔴 VIP: your top 20% (do not lose them)',
//       '🟢 Regular: steady, reliable buyers',
//       '🟡 At Risk: haven\'t bought in 30+ days',
//       '📞 Use segments for targeted outreach'
//     ],
//     action: 'Click a customer to see their history',
//   },

//   {
//     pageTitle: 'Customers',
//     stepNumber: 18,
//     targetSelector: '[data-tour="customer-list"]',
//     title: '📱 Customer Profiles',
//     description: 'Click any customer to see their full purchase history, total spent, phone number, and contact info.',
//     details: [
//       '📞 Phone: call/SMS for follow-up',
//       '💰 Total Spent: lifetime value',
//       '📅 Last Purchase: when did they buy?',
//       '📊 Order Count: frequency of purchases'
//     ],
//     action: 'Let\'s manage your daily tasks',
//     // path: '/dashboard/operations',
//   },

//   // ===== OPERATIONS PAGE =====
//   {
//     pageTitle: 'Operations',
//     stepNumber: 19,
//     targetSelector: '[data-tour="operations-search"]',
//     title: '🔍 Task Search',
//     description: 'Quickly find any task by typing keywords. Supports tag filtering too.',
//     details: [
//       '⌨️ Type to search live',
//       '⌘K shortcut: jump to search anytime',
//       '🏷️ Filter by Sales, Admin, Inventory tags',
//       '✅ See completed tasks separately'
//     ],
//     action: 'Filter tasks by category',
//     path: '/dashboard/operations',
//   },

//   {
//     pageTitle: 'Operations',
//     stepNumber: 20,
//     targetSelector: '[data-tour="operations-filters"]',
//     title: '🏷️ Task Categories',
//     description: 'Organize tasks into Sales, Admin, Inventory, Operations, or Marketing. Helps you stay focused.',
//     details: [
//       '🛍️ Sales: customer orders, follow-ups',
//       '⚙️ Admin: accounting, reports, settings',
//       '📦 Inventory: restock, orders',
//       '🎯 Operations: daily operations, processes'
//     ],
//     action: 'Now focus on high-priority tasks',
//   },

//   {
//     pageTitle: 'Operations',
//     stepNumber: 21,
//     targetSelector: '[data-tour="operations-focus"]',
//     title: '🎯 Focus Mode',
//     description: 'Three views: All Tasks, High Priority (urgent/overdue), or Due Today (what\'s due now?).',
//     details: [
//       '🔥 High Priority: overdue items highlighted',
//       '📅 Due Today: won\'t show tomorrow tasks',
//       '🔄 All: your complete task list',
//       '✅ Use "Due Today" each morning'
//     ],
//     action: 'Add a quick task or recurring automation',
//   },

//   {
//     pageTitle: 'Operations',
//     stepNumber: 22,
//     targetSelector: '[data-tour="operations-tasks"]',
//     title: '✅ Complete Your Tasks',
//     description: 'Check off tasks as done. Create recurring automations so routine work repeats automatically.',
//     details: [
//       '✓ Click checkbox: mark as complete',
//       '🔄 Recurring: daily, weekly, monthly automations',
//       '⏰ Overdue tasks: orange highlight',
//       '🎯 High priority: red left border'
//     ],
//     action: 'Finally, let\'s customize your settings',
//     // path: '/dashboard/settings',
//   },

//   // ===== SETTINGS PAGE =====
//   {
//     pageTitle: 'Settings',
//     stepNumber: 23,
//     targetSelector: '[data-tour="settings-logo"]',
//     title: '🎨 Your Business Logo',
//     description: 'Upload your logo. It appears on all receipts, reports, and documents automatically.',
//     details: [
//       '📸 PNG or JPG, max 5MB',
//       '🖼️ Shows on every receipt PDF',
//       '🎯 Builds brand recognition',
//       '♻️ Update anytime (Old receipts unaffected)'
//     ],
//     action: 'Set up your business info',
//     path: '/dashboard/settings',
//   },

//   {
//     pageTitle: 'Settings',
//     stepNumber: 24,
//     targetSelector: '[data-tour="settings-profile"]',
//     title: '🏢 Business Profile',
//     description: 'Your business name, phone, location. These appear on receipts so customers know who to contact.',
//     details: [
//       '📞 Your business phone number',
//       '📍 Location: Nairobi, Mombasa, etc.',
//       '🌍 Website or social media',
//       '🔍 Customers use this to reach you'
//     ],
//     action: 'Customize how receipts look',
//   },

//   {
//     pageTitle: 'Settings',
//     stepNumber: 25,
//     targetSelector: '[data-tour="settings-receipt"]',
//     title: '🧾 Receipt Customization',
//     description: 'Configure receipt prefix, numbering, tax rate, discounts, and footer message.',
//     details: [
//       '🔢 Prefix: RCT, INV, etc. (you choose)',
//       '💰 Tax rate: 16% VAT or custom',
//       '🏷️ Default discount: percent or fixed amount',
//       '✍️ Footer: "Thank you" message'
//     ],
//     action: 'See a live preview of your receipt',
//   },

//   {
//     pageTitle: 'Settings',
//     stepNumber: 26,
//     targetSelector: '[data-tour="settings-receipt-preview"]',
//     title: '👀 Live Receipt Preview',
//     description: 'This shows exactly how your receipts will print. Updates in real-time as you customize.',
//     details: [
//       '🎯 Logo appears at top',
//       '📋 Sample items with tax/discount',
//       '💵 Total calculation shown',
//       '📞 Business info visible to customers'
//     ],
//     action: 'Check your subscription status',
//   },

//   {
//     pageTitle: 'Settings',
//     stepNumber: 27,
//     targetSelector: '[data-tour="settings-subscription"]',
//     title: '👑 Your Subscription Plan',
//     description: 'See your current plan (Starter, Growth, Pro), trial status, and renewal date. Upgrade anytime.',
//     details: [
//       '🎯 Starter: sales + receipts only',
//       '📦 Growth: + inventory + reports',
//       '👑 Pro: everything + unlimited staff',
//       '⏰ All new users get 30 days Pro free'
//     ],
//     action: 'Manage team access and security',
//   },

//   {
//     pageTitle: 'Settings',
//     stepNumber: 28,
//     targetSelector: '[data-tour="settings-team"]',
//     title: '🔐 Team & Security',
//     description: 'Invite staff (Growth/Pro), change your password, and see active devices/sessions.',
//     details: [
//       '👥 Invite staff with role restrictions',
//       '🔒 Change password regularly',
//       '📱 View/revoke logged-in devices',
//       '🚪 Sign out of all devices at once'
//     ],
//     action: 'You\'re all set!',
//   },

//   {
//     pageTitle: 'Finish',
//     stepNumber: 29,
//     targetSelector: 'body',
//     title: '🎉 You\'re Ready!',
//     description: 'You now know Aflows inside and out. Start recording sales, track inventory, analyze trends, and grow your business.',
//     details: [
//       '💡 Bookmark this tour: click Help anytime',
//       '📞 Support: email hello@aflows.uk',
//       '🚀 Explore advanced features as you grow',
//       '✨ Your success is our mission'
//     ],
//     note: '✅ Tour completed! Happy selling!'
//   },
// ];

// interface SpotlightRect {
//   top: number;
//   left: number;
//   width: number;
//   height: number;
// }

// export const OnboardingTour = ({ onClose }: { onClose: () => void }) => {
//   const [step, setStep] = useState(0);
//   const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
//   const navigate = useNavigate();
//   const current = TOUR_STEPS[step];
//   const isLast = step === TOUR_STEPS.length - 1;
//   const isFirst = step === 0;
//   const panelRef = useRef<HTMLDivElement>(null);

//   // Auto-navigate to page if needed
//   useEffect(() => {
//     if (current.path) {
//       navigate(current.path);
//     }
//   }, [step, current.path, navigate]);

//   // Calculate spotlight
//   useEffect(() => {
//     if (!current.targetSelector || current.targetSelector === 'body') {
//       setSpotlightRect(null);
//       return;
//     }

//     const findElement = () => {
//       const el = document.querySelector(current.targetSelector);
//       if (!el) return null;

//       const rect = el.getBoundingClientRect();
//       return rect;
//     };

//     let attempts = 0;
//     const tryFind = () => {
//       const rect = findElement();
//       if (rect && rect.width > 0 && rect.height > 0) {
//         setSpotlightRect({
//           top: window.scrollY + rect.top - 8,
//           left: rect.left - 8,
//           width: rect.width + 16,
//           height: rect.height + 16,
//         });

//         // Scroll into view smoothly
//         const el = document.querySelector(current.targetSelector);
//         if (el) {
//           const elementTop = rect.top + window.scrollY;
//           window.scrollTo({
//             top: Math.max(0, elementTop - 250),
//             behavior: 'smooth',
//           });
//         }
//       } else if (attempts < 10) {
//         attempts++;
//         setTimeout(tryFind, 200);
//       }
//     };

//     tryFind();
//   }, [step, current.targetSelector]);

//   const goNext = () => {
//     if (isLast) {
//       localStorage.setItem('tour-completed', new Date().toISOString());
//       onClose();
//       return;
//     }
//     setStep(s => s + 1);
//   };

//   const goPrev = () => {
//     if (!isFirst) setStep(s => s - 1);
//   };

//   // Keyboard shortcuts
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') onClose();
//       if (e.key === 'ArrowRight' && !isLast) goNext();
//       if (e.key === 'ArrowLeft' && !isFirst) goPrev();
//     };
//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [step, isLast, isFirst]);

//   return (
//     <>
//       {/* Dark overlay */}
//       <div className="fixed inset-0 z-40 bg-black/50 pointer-events-none" />

//       {/* Spotlight effect */}
//       {spotlightRect && spotlightRect.width > 0 && (
//         <>
//           <div
//             className="fixed z-40 bg-black/60 pointer-events-none transition-all duration-300"
//             style={{
//               top: 0,
//               left: 0,
//               right: 0,
//               height: spotlightRect.top,
//             }}
//           />
//           <div
//             className="fixed z-40 bg-black/60 pointer-events-none transition-all duration-300"
//             style={{
//               top: spotlightRect.top + spotlightRect.height,
//               left: 0,
//               right: 0,
//               bottom: 0,
//             }}
//           />
//           <div
//             className="fixed z-40 bg-black/60 pointer-events-none transition-all duration-300"
//             style={{
//               top: spotlightRect.top,
//               left: 0,
//               width: spotlightRect.left,
//               height: spotlightRect.height,
//             }}
//           />
//           <div
//             className="fixed z-40 bg-black/60 pointer-events-none transition-all duration-300"
//             style={{
//               top: spotlightRect.top,
//               right: 0,
//               width: window.innerWidth - (spotlightRect.left + spotlightRect.width),
//               height: spotlightRect.height,
//             }}
//           />
//           <div
//             className="fixed z-40 border-2 border-primary rounded-lg shadow-lg shadow-primary/50 pointer-events-none transition-all duration-300"
//             style={{
//               top: spotlightRect.top,
//               left: spotlightRect.left,
//               width: spotlightRect.width,
//               height: spotlightRect.height,
//             }}
//           />
//         </>
//       )}

//       {/* Tour panel */}
//       <div
//         ref={panelRef}
//         className="fixed z-50 bottom-0 left-0 right-0 sm:bottom-6 sm:right-6 sm:left-auto sm:w-[420px]"
//       >
//         <motion.div
//           key={step}
//           initial={{ opacity: 0, y: 16 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.2 }}
//           className="bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto"
//         >
//           {/* Header */}
//           <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b sticky top-0 bg-card">
//             <div className="flex gap-1">
//               {TOUR_STEPS.map((_, i) => (
//                 <button
//                   key={i}
//                   onClick={() => setStep(i)}
//                   className={`h-1 rounded-full transition-all ${
//                     i === step ? 'w-8 bg-primary' : i < step ? 'w-2 bg-primary/40' : 'w-2 bg-muted'
//                   }`}
//                   aria-label={`Go to step ${i + 1}`}
//                 />
//               ))}
//             </div>
//             <div className="text-xs text-muted-foreground">
//               {step + 1}/{TOUR_STEPS.length}
//             </div>
//             <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
//               <X className="w-4 h-4" />
//             </button>
//           </div>

//           {/* Content */}
//           <div className="p-5 space-y-4">
//             <div>
//               <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">
//                 {current.pageTitle}
//               </p>
//               <h3 className="text-lg font-bold leading-tight">{current.title}</h3>
//             </div>

//             <p className="text-sm text-muted-foreground leading-relaxed">{current.description}</p>

//             {current.details && (
//               <div className="space-y-2 pl-3 border-l-2 border-primary/30">
//                 {current.details.map((detail, i) => (
//                   <p key={i} className="text-xs text-muted-foreground leading-relaxed">
//                     {detail}
//                   </p>
//                 ))}
//               </div>
//             )}

//             {current.action && (
//               <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
//                 <p className="text-xs text-primary font-medium">→ {current.action}</p>
//               </div>
//             )}

//             {current.note && (
//               <div className="p-3 rounded-lg bg-success/5 border border-success/20">
//                 <p className="text-xs text-success font-medium">{current.note}</p>
//               </div>
//             )}
//           </div>

//           {/* Footer */}
//           <div className="px-5 pb-5 pt-3 border-t flex items-center gap-2 sticky bottom-0 bg-card">
//             {!isFirst && (
//               <Button variant="outline" size="sm" onClick={goPrev}>
//                 <ChevronLeft className="w-4 h-4" />
//               </Button>
//             )}
//             <Button
//               size="sm"
//               onClick={goNext}
//               className="flex-1"
//             >
//               {isLast ? (
//                 <>
//                   <Check className="w-4 h-4 mr-1" /> Finish
//                 </>
//               ) : (
//                 <>
//                   Next <ArrowRight className="w-4 h-4 ml-1" />
//                 </>
//               )}
//             </Button>
//           </div>
//         </motion.div>
//       </div>
//     </>
//   );
// };

