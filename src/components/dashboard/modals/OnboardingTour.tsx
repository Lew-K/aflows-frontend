import React, { useEffect, useMemo, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowRight, Check, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface TourStep {
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
    pageTitle: 'Sales',
    stepNumber: 4,
    targetSelector: '[data-tour="sales-customer-name"]',
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
    path: '/dashboard',
  },

  // ===== ANALYTICS PAGE =====
  {
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
  },

  {
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
    pageTitle: 'Analytics',
    stepNumber: 11,
    targetSelector: '[data-tour="top-items"]',
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
    path: '/dashboard/inventory',
  },

  // ===== INVENTORY PAGE =====
  {
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
  },

  {
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
    path: '/dashboard/customers',
  },

  // ===== CUSTOMERS PAGE =====
  {
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
  },

  {
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
    path: '/dashboard/operations',
  },

  // ===== OPERATIONS PAGE =====
  {
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
  },

  {
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
    path: '/dashboard/settings',
  },

  // ===== SETTINGS PAGE =====
  {
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
  },

  {
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

export const OnboardingTour = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const navigate = useNavigate();
  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;
  const isFirst = step === 0;
  const panelRef = useRef<HTMLDivElement>(null);

  // Auto-navigate to page if needed
  useEffect(() => {
    if (current.path) {
      navigate(current.path);
    }
  }, [step, current.path, navigate]);

  // Calculate spotlight
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
          top: window.scrollY + rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16,
        });

        // Scroll into view smoothly
        const el = document.querySelector(current.targetSelector);
        if (el) {
          const elementTop = rect.top + window.scrollY;
          window.scrollTo({
            top: Math.max(0, elementTop - 150),
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
      localStorage.setItem('tour-completed', new Date().toISOString());
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
        className="fixed z-50 bottom-0 left-0 right-0 sm:bottom-6 sm:right-6 sm:left-auto sm:w-[420px]"
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b sticky top-0 bg-card">
            <div className="flex gap-1">
              {TOUR_STEPS.map((_, i) => (
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
              {step + 1}/{TOUR_STEPS.length}
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">
                {current.pageTitle}
              </p>
              <h3 className="text-lg font-bold leading-tight">{current.title}</h3>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">{current.description}</p>

            {current.details && (
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

// import React, { useState, useEffect, useRef } from 'react';
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
//   hint?: string;
//   path?: string; // Navigate to this page if not already there
// }

// const TOUR_STEPS: TourStep[] = [
//   // WELCOME
//   { pageTitle: 'Welcome', stepNumber: 1, targetSelector: 'body', title: 'Welcome to Aflows', description: 'Let\'s take a quick tour. This will help you get started in 2 minutes.', hint: 'Each step highlights a specific feature.' },

//   // SALES PAGE
//   { pageTitle: 'Sales', stepNumber: 2, targetSelector: '[data-tour="sales-form"]', title: 'Quick Sales Entry', description: 'Record any transaction here — customer name is optional.', path: '/dashboard/sales' },
//   { pageTitle: 'Sales', stepNumber: 3, targetSelector: '[data-tour="sales-customer-name"]', title: 'Customer Name', description: 'Optional. Use "Walk-in" for anonymous sales, or enter a name to track repeat customers.' },
//   { pageTitle: 'Sales', stepNumber: 4, targetSelector: '[data-tour="sales-items"]', title: 'Add Items', description: 'Type the product name or service. If tracked in inventory, it auto-selects with the price.' },
//   { pageTitle: 'Sales', stepNumber: 5, targetSelector: '[data-tour="sales-payment"]', title: 'Payment Method', description: 'Choose how the customer paid. M-Pesa and card payments require a transaction reference.' },
//   { pageTitle: 'Sales', stepNumber: 6, targetSelector: '[data-tour="recent-sales"]', title: 'Receipt Receipts', description: 'Your transactions appear here. Click the download icon to save the PDF receipt.' },

//   // ANALYTICS PAGE
//   { pageTitle: 'Analytics', stepNumber: 7, targetSelector: '[data-tour="analytics-kpis"]', title: 'Key Metrics', description: 'Total Revenue, Sales, and % change vs last period. Green = improvement.', path: '/dashboard' },
//   { pageTitle: 'Analytics', stepNumber: 8, targetSelector: '[data-tour="revenue-trend"]', title: 'Revenue Trend', description: 'Switch between Monthly and Daily view to see patterns in your sales.' },
//   { pageTitle: 'Analytics', stepNumber: 9, targetSelector: '[data-tour="top-items"]', title: 'Top Selling Items', description: 'See which products move the most (Items Sold) or earn the most (Revenue).' },
//   { pageTitle: 'Analytics', stepNumber: 10, targetSelector: '[data-tour="payment-breakdown"]', title: 'Payment Methods', description: 'Which payment method brings in the most revenue? See the breakdown here.' },

//   // INVENTORY PAGE
//   { pageTitle: 'Inventory', stepNumber: 11, targetSelector: '[data-tour="low-stock-alert"]', title: 'Low Stock Alert', description: 'Items below their threshold appear here. Click to see the full list.', path: '/dashboard/inventory' },
//   { pageTitle: 'Inventory', stepNumber: 12, targetSelector: '[data-tour="inventory-actions"]', title: 'Manage Inventory', description: 'New Product adds one item. Bulk Restock updates many at once. Import Excel loads hundreds.' },
//   { pageTitle: 'Inventory', stepNumber: 13, targetSelector: '[data-tour="inventory-table"]', title: 'Inventory List', description: 'All your products with stock levels and cost/selling price. Click Restock to add units.' },

//   // CUSTOMERS PAGE
//   { pageTitle: 'Customers', stepNumber: 14, targetSelector: '[data-tour="customer-kpis"]', title: 'Customer Insights', description: 'Total customers, active this month, avg spend, and repeat rate.', path: '/dashboard/customers' },
//   { pageTitle: 'Customers', stepNumber: 15, targetSelector: '[data-tour="customer-filters"]', title: 'Filter Customers', description: 'Search by name or filter by segment: VIP (high spenders), Regular, or At Risk (lapsed).' },
//   { pageTitle: 'Customers', stepNumber: 16, targetSelector: '[data-tour="customer-list"]', title: 'Customer Profiles', description: 'Click any customer to see their full purchase history in the side panel.' },

//   // OPERATIONS PAGE
//   { pageTitle: 'Operations', stepNumber: 17, targetSelector: '[data-tour="operations-quick-add"]', title: 'Add Tasks', description: 'Type a task and press Enter for quick add, or use Advanced for due dates and recurring tasks.', path: '/dashboard/operations' },
//   { pageTitle: 'Operations', stepNumber: 18, targetSelector: '[data-tour="operations-filters"]', title: 'Filter Tasks', description: 'View only Sales, Inventory, or Admin tasks using these filters.' },
//   { pageTitle: 'Operations', stepNumber: 19, targetSelector: '[data-tour="operations-tasks"]', title: 'Task List', description: 'Red border = high priority. Orange = overdue. Drag to reorder or mark as done.' },

//   // REPORTS PAGE
//   { pageTitle: 'Reports', stepNumber: 20, targetSelector: '[data-tour="reports-date-range"]', title: 'Date Range', description: 'Choose any period to analyze: today, this week, custom range, year-to-date, etc.', path: '/dashboard/reports' },
//   { pageTitle: 'Reports', stepNumber: 21, targetSelector: '[data-tour="reports-cards"]', title: 'Export Reports', description: 'Each card shows key metrics and has a Download button to export as CSV for Excel.' },

//   // SETTINGS PAGE
//   { pageTitle: 'Settings', stepNumber: 22, targetSelector: '[data-tour="settings-logo"]', title: 'Business Logo', description: 'Upload your logo — it appears on all receipts automatically.', path: '/dashboard/settings' },
//   { pageTitle: 'Settings', stepNumber: 23, targetSelector: '[data-tour="settings-subscription"]', title: 'Subscription Status', description: 'See your plan, usage, and when it renews. Upgrade anytime.' },
//   { pageTitle: 'Settings', stepNumber: 24, targetSelector: '[data-tour="settings-team"]', title: 'Team Members', description: 'Invite staff who can record sales and manage tasks, but cannot access settings.' },
//   { pageTitle: 'Settings', stepNumber: 25, targetSelector: '[data-tour="settings-sessions"]', title: 'Active Sessions', description: 'See all logged-in devices. Revoke any you don\'t recognize for security.' },

//   // FINISH
//   { pageTitle: 'Finish', stepNumber: 26, targetSelector: 'body', title: 'You\'re All Set!', description: 'You now know the basics. Start recording sales and watch your insights grow in real-time.' },
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
//             top: Math.max(0, elementTop - 150),
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
//         className="fixed z-50 bottom-0 left-0 right-0 sm:bottom-6 sm:right-6 sm:left-auto sm:w-[400px]"
//       >
//         <motion.div
//           key={step}
//           initial={{ opacity: 0, y: 16 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.2 }}
//           className="bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl"
//         >
//           {/* Header */}
//           <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b">
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
//               <h3 className="text-lg font-bold">{current.title}</h3>
//             </div>

//             <p className="text-sm text-muted-foreground leading-relaxed">{current.description}</p>

//             {current.hint && (
//               <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
//                 <p className="text-xs text-primary font-medium">💡 {current.hint}</p>
//               </div>
//             )}
//           </div>

//           {/* Footer */}
//           <div className="px-5 pb-5 pt-3 border-t flex items-center gap-2">
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

// import React, { useState, useEffect, useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { X, ArrowRight, Check, BarChart3, ShoppingCart, Package, Users, FileBarChart, Settings, ClipboardCheck, ChevronLeft } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { useNavigate } from 'react-router-dom';

// interface TourStep {
//   page: string;
//   icon: React.ReactNode;
//   title: string;
//   description: string;
//   tips: string[];
//   path?: string;
//   targetSelector?: string; // CSS selector for element to highlight
// }

// const TOUR_STEPS: TourStep[] = [
//   {
//     page: 'Welcome',
//     icon: '👋',
//     title: 'Welcome to Aflows',
//     description: 'This quick tour walks you through everything. You can skip at any time and reopen it from the account menu.',
//     tips: [
//       'Your data saves automatically — nothing to configure',
//       'Use the sidebar on the left to switch between pages',
//       'The tour covers every page and feature',
//     ],
//   },
//   {
//     page: 'Sales',
//     icon: <ShoppingCart className="w-6 h-6 text-primary" />,
//     title: 'Recording Sales',
//     description: 'Use the Sales page to record every transaction. Fill in what was sold, the amount, and how the customer paid.',
//     tips: [
//       'Customer name is optional — anonymous sales record as "Walk-in"',
//       'Add multiple items in one sale using "+ Add Another Item"',
//       'M-Pesa and card payments require a transaction reference number',
//       'A PDF receipt is generated automatically after each recorded sale',
//       'Use the period filter on Recent Sales to download receipts by date range',
//       'The bulk download button lets you download all receipts for a period as a ZIP file',
//     ],
//     path: '/dashboard/sales',
//   },
//   {
//     page: 'Analytics',
//     icon: <BarChart3 className="w-6 h-6 text-primary" />,
//     title: 'Understanding Analytics',
//     description: 'Analytics shows your business performance in real time. Here is what each section means:',
//     tips: [
//       'Total Revenue — your earnings for the selected period, with % change vs the previous period',
//       'Total Sales — number of transactions, with your average sale value below',
//       'Payment Breakdown — which payment method brings in the most revenue this month',
//       'Revenue Trend chart — switch between Monthly (long-term patterns) and Daily (recent activity)',
//       'Top Selling Items — switch between Items Sold (volume) and Revenue (earnings)',
//       'Today Snapshot — compares today\'s pace against your daily average (Pro)',
//       'Monthly Projection — estimates your end-of-month revenue based on current pace (Pro)',
//       'Use the period selector at the top right to analyse any custom date range',
//     ],
//     path: '/dashboard',
//   },
//   {
//     page: 'Inventory',
//     icon: <Package className="w-6 h-6 text-primary" />,
//     title: 'Managing Inventory',
//     description: 'Inventory tracks what you have in stock so you always know what needs restocking.',
//     tips: [
//       '"New Product" — add a product with name, starting stock, cost price, and a low-stock threshold',
//       '"Bulk Restock" — update many products at once. Add mode adds units; Set mode fixes the exact quantity',
//       '"Import Excel" — download the template, fill in your products, upload to add hundreds at once',
//       '"Restock" on each row — add new stock units to a single product',
//       'Low Stock Alert card at top — shows how many items are below threshold',
//       'When you record a sale with a tracked item, stock is automatically deducted',
//     ],
//     path: '/dashboard/inventory',
//   },
//   {
//     page: 'Customers',
//     icon: <Users className="w-6 h-6 text-primary" />,
//     title: 'Customer Profiles',
//     description: 'Customers are created automatically when you record a sale with a customer name. Nothing to set up.',
//     tips: [
//       'Click any customer row to see their full purchase history in the side panel',
//       'VIP customers are your highest spenders — they deserve extra attention',
//       'At Risk customers haven\'t bought in 30+ days — good candidates for follow-up',
//       'Use the segment filter to target specific groups',
//       'The phone number shown is the one recorded at the time of their most recent sale',
//     ],
//     path: '/dashboard/customers',
//   },
//   {
//     page: 'Task List',
//     icon: <ClipboardCheck className="w-6 h-6 text-primary" />,
//     title: 'Tasks & Reminders',
//     description: 'Operations is your business to-do list. Use it to track tasks and set recurring reminders so nothing gets forgotten.',
//     tips: [
//       'Quick Add (right sidebar) — type a task name and press Enter to add it instantly',
//       'Advanced Task — set priority, due date, tags, and attach an external link',
//       'Recurring Tasks — set a task to auto-generate daily, weekly, or monthly',
//       'High priority tasks show a red left border so they stand out',
//       'Overdue tasks turn orange and automatically increase in priority',
//       'Tag filters let you see only Sales, Inventory, or Admin tasks',
//     ],
//     path: '/dashboard/operations',
//   },
//   {
//     page: 'Reports',
//     icon: <FileBarChart className="w-6 h-6 text-primary" />,
//     title: 'Exporting Reports',
//     description: 'Reports exports your business data as CSV files that open directly in Excel or Google Sheets.',
//     tips: [
//       'Use the date range at the top to pick any period you want',
//       'Financial Health — daily revenue breakdown and average transaction value',
//       'Smart Stock List — auto-generated restock list based on current stock levels',
//       'Customer Loyalty — customers ranked by spend with their last purchase date',
//       'Sales Performance — transaction breakdown by payment method',
//       '"Download All Reports" generates all four reports as a ZIP file',
//     ],
//     path: '/dashboard/reports',
//   },
//   {
//     page: 'Settings',
//     icon: <Settings className="w-6 h-6 text-primary" />,
//     title: 'Business Settings',
//     description: 'Settings is where you customize your business identity, receipts, and manage who has access.',
//     tips: [
//       'Upload your logo — it appears on every receipt automatically',
//       'Set your Receipt Prefix (e.g. "INV") and starting receipt number',
//       'Add your KRA PIN and Paybill/Till number to print them on receipts',
//       'Receipt Footer — the message at the bottom of every receipt',
//       'Tax Rate — set your VAT percentage and it calculates automatically',
//       'Team Members — invite staff accounts that can only record sales and manage tasks',
//       'Active Sessions — see all logged-in devices. Revoke anything you don\'t recognize',
//       'Change Password — always use a strong password with uppercase letters and numbers',
//     ],
//     path: '/dashboard/settings',
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

//   // Resume tour on load
//   useEffect(() => {
//     const saved = localStorage.getItem('tour-step');
//     const completed = localStorage.getItem('tour-completed');
  
//     if (saved && !completed) {
//       const parsed = parseInt(saved, 10);
//       if (!isNaN(parsed)) setStep(parsed);
//     }
//   }, []);
  
//   // Save step on change
//   useEffect(() => {
//     localStorage.setItem('tour-step', step.toString());
//   }, [step]);
  
//   // Complete handler
//   const handleComplete = () => {
//     localStorage.setItem('tour-completed', new Date().toISOString());
//     localStorage.removeItem('tour-step');
//     onClose();
//   };

//   // Position the modal at bottom-right on desktop, bottom on mobile
//   const panelRef = useRef<HTMLDivElement>(null);

//   const goNext = () => {
//     if (isLast) { handleComplete(); return; }
//     setStep(s => s + 1);
//   };

//   const goPrev = () => {
//     if (!isFirst) setStep(s => s - 1);
//   };

//   const navigateToPage = () => {
//     if (current.path) navigate(current.path);
//   };

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') onClose();
//       if (e.key === 'ArrowRight' && !isLast) goNext();
//       if (e.key === 'ArrowLeft' && !isFirst) goPrev();
//     };
  
//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [step, isLast, isFirst]);

//   useEffect(() => {
//     if (!current.targetSelector) {
//       setSpotlightRect(null);
//       return;
//     }
  
//     const update = () => {
//       const el = document.querySelector(current.targetSelector!);
//       if (!el) {
//         setSpotlightRect(null);
//         return;
//       }
  
//       const rect = el.getBoundingClientRect();
  
//       setSpotlightRect({
//         top: rect.top,
//         left: rect.left,
//         width: rect.width,
//         height: rect.height,
//       });
//     };
  
//     update();
  
//     window.addEventListener('scroll', update);
//     window.addEventListener('resize', update);
  
//     return () => {
//       window.removeEventListener('scroll', update);
//       window.removeEventListener('resize', update);
//     };
//   }, [step, current.targetSelector]);

//   return (
//     <>
//       {/* Semi-transparent overlay — does NOT block clicks on the page */}
//       {/* <div className="fixed inset-0 z-40 bg-black/30 pointer-events-none" /> */}
//       <div className="fixed inset-0 z-40 bg-black/40" />

//       {spotlightRect && (
//         <div
//           className="fixed z-40 border-2 border-primary rounded-lg shadow-lg shadow-primary/30 pointer-events-none animate-pulse"
//           style={{
//             top: spotlightRect.top - 4,
//             left: spotlightRect.left - 4,
//             width: spotlightRect.width + 8,
//             height: spotlightRect.height + 8,
//           }}
//         />
//       )}

//       {/* Tour panel — anchored bottom-right on desktop, bottom on mobile */}
//       <div
//         ref={panelRef}
//         className="fixed z-50 bottom-0 left-0 right-0 sm:bottom-6 sm:right-6 sm:left-auto sm:w-[420px]"
//       >
//         <motion.div
//           key={step}
//           initial={{ opacity: 0, y: 16 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: 16 }}
//           transition={{ duration: 0.2, ease: 'easeOut' }}
//           className="bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[80vh] sm:max-h-[70vh]"
//         >
//           {/* Progress bar + controls */}
//           <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border flex-shrink-0">
//             <div className="flex gap-1">
//               {TOUR_STEPS.map((_, i) => (
//                 <button
//                   key={i}
//                   onClick={() => setStep(i)}
//                   className={`h-1.5 rounded-full transition-all duration-200 ${
//                     i === step
//                       ? 'w-6 bg-primary'
//                       : i < step
//                       ? 'w-3 bg-primary/40'
//                       : 'w-3 bg-muted-foreground/20'
//                   }`}
//                   aria-label={`Go to step ${i + 1}`}
//                 />
//               ))}
//             </div>
//             <div className="flex items-center gap-3">
//               <span className="text-xs text-muted-foreground tabular-nums">
//                 {step + 1} / {TOUR_STEPS.length}
//               </span>
//               <button
//                 onClick={onClose}
//                 className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
//                 aria-label="Close tour"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>
//           </div>

//           {/* Content */}
//           <div className="flex-1 overflow-y-auto px-5 py-4 pb-24 sm:pb-4 space-y-4">
//             {/* Icon + Title */}
//             <div className="flex items-center gap-3">
//               <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
//                 {typeof current.icon === 'string' ? current.icon : current.icon}
//               </div>
//               <div>
//                 <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
//                   {current.page}
//                 </p>
//                 <h3 className="text-base font-bold leading-tight">{current.title}</h3>
//               </div>
//             </div>

//             <p className="text-sm text-muted-foreground leading-relaxed">
//               {current.description}
//             </p>

//             {/* Tips */}
//             <div className="space-y-2">
//               {current.tips.map((tip, i) => (
//                 <div
//                   key={i}
//                   className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/40"
//                 >
//                   <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
//                     <span className="text-[10px] font-bold text-primary">{i + 1}</span>
//                   </div>
//                   <p className="text-sm text-foreground leading-relaxed">{tip}</p>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="px-5 pb-5 pt-3 border-t border-border flex-shrink-0 space-y-2.5">
//             {/* Navigate + step buttons */}
//             <div className="flex gap-2.5">
//               {!isFirst && (
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={goPrev}
//                   className="flex-shrink-0"
//                 >
//                   <ChevronLeft className="w-4 h-4" />
//                 </Button>
//               )}

//               {current.path && (
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={navigateToPage}
//                   className="flex-1 text-primary border-primary/30 hover:bg-primary/5"
//                 >
//                   Open {current.page}
//                 </Button>
//               )}

//               <Button
//                 size="sm"
//                 onClick={goNext}
//                 className="flex-1"
//               >
//                 {isLast ? (
//                   <><Check className="w-4 h-4 mr-1" /> Finish</>
//                 ) : (
//                   <>Next <ArrowRight className="w-4 h-4 ml-1" /></>
//                 )}
//               </Button>
//             </div>

//             <button
//               onClick={onClose}
//               className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-0.5"
//             >
//               Skip tour
//             </button>
//           </div>
//         </motion.div>
//       </div>
//     </>
//   );
// };


// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { X, ArrowRight, Check, BarChart3, ShoppingCart, Package, Users, FileBarChart, Settings, ClipboardCheck } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { useNavigate } from 'react-router-dom';

// interface TourStep {
//   page: string;
//   icon: React.ReactNode;
//   title: string;
//   description: string;
//   tips: string[];
//   path?: string;
//   actionLabel?: string;
// }

// const TOUR_STEPS: TourStep[] = [
//   {
//     page: 'Welcome',
//     icon: '👋',
//     title: 'Welcome to Aflows',
//     description: 'This quick tour will walk you through everything in about 2 minutes. You can skip at any time and come back later.',
//     tips: ['Your data is saved automatically', 'Use the sidebar to navigate between pages', 'Everything you see is live data'],
//   },
//   {
//     page: 'Sales',
//     icon: <ShoppingCart className="w-6 h-6 text-primary" />,
//     title: 'Recording Sales',
//     description: 'The Sales page is where you record every transaction. Add the customer name, what was sold, the amount, and how they paid.',
//     tips: [
//       'Customer name is optional — use "Walk-in" for anonymous sales',
//       'Add multiple items in one sale using the "+ Add Another Item" button',
//       'M-Pesa and card sales require a payment reference number',
//       'A PDF receipt is generated automatically after each sale',
//       'Use the period filter above Recent Sales to download receipts by date range',
//     ],
//     path: '/dashboard/sales',
//     actionLabel: 'Go to Sales',
//   },
//   {
//     page: 'Analytics',
//     icon: <BarChart3 className="w-6 h-6 text-primary" />,
//     title: 'Understanding Your Analytics',
//     description: 'Analytics gives you a live view of your business performance. Here is what each section means:',
//     tips: [
//       'Total Revenue & Sales cards — your performance vs last period. Green arrow = improvement',
//       'Payment Breakdown — shows which payment method brings in the most money this month',
//       'Revenue Trend — switch between Monthly view (for long-term patterns) and Daily view (for this week)',
//       'Top Selling Items — switch between Items Sold (quantity) and Revenue to see what earns most vs what moves most',
//       'Today Snapshot — compares today\'s sales pace vs your daily average (Pro plan)',
//       'Monthly Projection — estimates your end-of-month revenue based on your current pace (Pro plan)',
//       'Use the period filter at the top to analyse any custom date range',
//     ],
//     path: '/dashboard',
//     actionLabel: 'View Analytics',
//   },
//   {
//     page: 'Inventory',
//     icon: <Package className="w-6 h-6 text-primary" />,
//     title: 'Managing Your Inventory',
//     description: 'Inventory tracks your stock levels so you always know what you have and what needs restocking.',
//     tips: [
//       '"New Product" — adds a single product with its name, starting stock, cost price, and a low-stock alert threshold',
//       '"Bulk Restock" — update stock for many products at once (use Add mode to add units, or Set mode to fix an exact quantity)',
//       '"Import Excel" — download the template, fill it in with your products, and upload it to add hundreds of items at once',
//       '"Restock" button on each row — adds new stock units for a single product',
//       'The Low Stock Alert card at the top shows how many items are below their threshold — click the filter to see them',
//       'When you record a sale with an inventory item, stock is automatically deducted',
//     ],
//     path: '/dashboard/inventory',
//     actionLabel: 'Go to Inventory',
//   },
//   {
//     page: 'Customers',
//     icon: <Users className="w-6 h-6 text-primary" />,
//     title: 'Customer Profiles',
//     description: 'Customers are created automatically when you record a sale with a customer name. No manual entry needed.',
//     tips: [
//       'Click any customer row to see their full purchase history in the side panel',
//       'VIP customers are your highest spenders — they deserve extra attention',
//       'At Risk customers haven\'t bought in over 30 days — good candidates for a follow-up',
//       'Use the segment filter to target specific groups',
//       'The Repeat Rate at the top shows the percentage of customers who have bought more than once',
//     ],
//     path: '/dashboard/customers',
//     actionLabel: 'View Customers',
//   },
//   {
//     page: 'Operations',
//     icon: <ClipboardCheck className="w-6 h-6 text-primary" />,
//     title: 'Task List & Reminders',
//     description: 'Operations is your business to-do list. Use it to track things you need to do and set up recurring reminders so nothing gets forgotten.',
//     tips: [
//       'Quick Add (right sidebar) — type a task and press Enter to add it instantly',
//       'Advanced Task — set a priority, due date, tags, and even attach a link to a document or Google Sheet',
//       'Recurring Tasks — create automations that generate a task every day, week, or month automatically (e.g. "Send weekly sales report")',
//       'High priority tasks get a red left border so they stand out',
//       'Overdue tasks turn orange and get bumped up in priority automatically',
//       'Use the tag filters to see only Sales, Inventory, or Admin tasks',
//     ],
//     path: '/dashboard/operations',
//     actionLabel: 'Go to Operations',
//   },
//   {
//     page: 'Reports',
//     icon: <FileBarChart className="w-6 h-6 text-primary" />,
//     title: 'Downloading Reports',
//     description: 'Reports lets you export your business data as CSV files that open in Excel or Google Sheets.',
//     tips: [
//       'Use the date range selector at the top to pick the period you want',
//       'Financial Health — shows your daily revenue breakdown and average transaction value',
//       'Smart Stock List — automatically identifies items that need restocking',
//       'Customer Loyalty — lists your customers ranked by total spend with their last purchase date',
//       'Sales Performance — breaks down transactions by payment method',
//       '"Download All Reports" generates all four CSV files at once',
//     ],
//     path: '/dashboard/reports',
//     actionLabel: 'View Reports',
//   },
//   {
//     page: 'Settings',
//     icon: <Settings className="w-6 h-6 text-primary" />,
//     title: 'Setting Up Your Business',
//     description: 'Settings is where you customize how Aflows represents your business and manage security.',
//     tips: [
//       'Upload your logo — it will appear on every receipt sent to customers',
//       'Set your Receipt Prefix (e.g. "INV" or "RCT") and the next receipt number',
//       'Add your KRA PIN and Paybill/Till number — these print on receipts automatically',
//       'Receipt Footer — the message printed at the bottom of every receipt (e.g. "No refunds after 7 days")',
//       'Tax Rate — if you charge VAT, set it here and it will be calculated automatically',
//       'Team Members — invite staff who need access. Staff can only record sales and manage tasks',
//       'Active Sessions — see all devices logged into your account. Revoke any you don\'t recognize',
//       'Change Password — use a strong password with uppercase letters and numbers',
//     ],
//     path: '/dashboard/settings',
//     actionLabel: 'Open Settings',
//   },
// ];

// export const OnboardingTour = ({ onClose }: { onClose: () => void }) => {
//   const [step, setStep] = useState(0);
//   const navigate = useNavigate();
//   const current = TOUR_STEPS[step];
//   const isLast = step === TOUR_STEPS.length - 1;
//   const isFirst = step === 0;

//   const handleNavigate = () => {
//     if (current.path) {
//       navigate(current.path);
//     }
//     if (!isLast) setStep(s => s + 1);
//     else onClose();
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm">
//       <motion.div
//         key={step}
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, y: -10 }}
//         transition={{ duration: 0.2 }}
//         className="bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[85vh] flex flex-col"
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-border flex-shrink-0">
//           <div className="flex gap-1.5">
//             {TOUR_STEPS.map((_, i) => (
//               <button
//                 key={i}
//                 onClick={() => setStep(i)}
//                 className={`h-1.5 rounded-full transition-all ${
//                   i === step ? 'w-6 bg-primary' : i < step ? 'w-3 bg-primary/40' : 'w-3 bg-muted'
//                 }`}
//               />
//             ))}
//           </div>
//           <div className="flex items-center gap-2">
//             <span className="text-xs text-muted-foreground">{step + 1} / {TOUR_STEPS.length}</span>
//             <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
//               <X className="w-4 h-4" />
//             </button>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="flex-1 overflow-y-auto px-6 py-5">
//           <div className="flex items-center gap-3 mb-4">
//             <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
//               {typeof current.icon === 'string' ? current.icon : current.icon}
//             </div>
//             <div>
//               <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{current.page}</p>
//               <h3 className="text-lg font-bold leading-tight">{current.title}</h3>
//             </div>
//           </div>

//           <p className="text-sm text-muted-foreground leading-relaxed mb-5">{current.description}</p>

//           <div className="space-y-2.5">
//             {current.tips.map((tip, i) => (
//               <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
//                 <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
//                   <span className="text-[10px] font-bold text-primary">{i + 1}</span>
//                 </div>
//                 <p className="text-sm text-foreground leading-relaxed">{tip}</p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="px-6 pb-5 pt-3 border-t border-border flex-shrink-0 space-y-3">
//           <div className="flex gap-3">
//             {!isFirst && (
//               <Button variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>
//                 Back
//               </Button>
//             )}
//             <Button
//               className="flex-1"
//               onClick={() => {
//                 if (isLast) { onClose(); return; }
//                 setStep(s => s + 1);
//               }}
//             >
//               {isLast ? (
//                 <><Check className="w-4 h-4 mr-1" /> All done!</>
//               ) : (
//                 <>Next <ArrowRight className="w-4 h-4 ml-1" /></>
//               )}
//             </Button>
//           </div>

//           {current.path && !isLast && (
//             <button
//               onClick={handleNavigate}
//               className="w-full text-center text-xs text-primary hover:underline"
//             >
//               Take me to {current.page} →
//             </button>
//           )}

//           <button onClick={onClose} className="w-full text-center text-xs text-muted-foreground hover:text-foreground">
//             Skip tour — I'll explore on my own
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   );
// };
