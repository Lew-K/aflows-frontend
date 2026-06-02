import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Check, BarChart3, ShoppingCart, Package, Users, FileBarChart, Settings, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface TourStep {
  page: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  tips: string[];
  path?: string;
  actionLabel?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    page: 'Welcome',
    icon: '👋',
    title: 'Welcome to Aflows',
    description: 'This quick tour will walk you through everything in about 2 minutes. You can skip at any time and come back later.',
    tips: ['Your data is saved automatically', 'Use the sidebar to navigate between pages', 'Everything you see is live data'],
  },
  {
    page: 'Sales',
    icon: <ShoppingCart className="w-6 h-6 text-primary" />,
    title: 'Recording Sales',
    description: 'The Sales page is where you record every transaction. Add the customer name, what was sold, the amount, and how they paid.',
    tips: [
      'Customer name is optional — use "Walk-in" for anonymous sales',
      'Add multiple items in one sale using the "+ Add Another Item" button',
      'M-Pesa and card sales require a payment reference number',
      'A PDF receipt is generated automatically after each sale',
      'Use the period filter above Recent Sales to download receipts by date range',
    ],
    path: '/dashboard/sales',
    actionLabel: 'Go to Sales',
  },
  {
    page: 'Analytics',
    icon: <BarChart3 className="w-6 h-6 text-primary" />,
    title: 'Understanding Your Analytics',
    description: 'Analytics gives you a live view of your business performance. Here is what each section means:',
    tips: [
      'Total Revenue & Sales cards — your performance vs last period. Green arrow = improvement',
      'Payment Breakdown — shows which payment method brings in the most money this month',
      'Revenue Trend — switch between Monthly view (for long-term patterns) and Daily view (for this week)',
      'Top Selling Items — switch between Items Sold (quantity) and Revenue to see what earns most vs what moves most',
      'Today Snapshot — compares today\'s sales pace vs your daily average (Pro plan)',
      'Monthly Projection — estimates your end-of-month revenue based on your current pace (Pro plan)',
      'Use the period filter at the top to analyse any custom date range',
    ],
    path: '/dashboard',
    actionLabel: 'View Analytics',
  },
  {
    page: 'Inventory',
    icon: <Package className="w-6 h-6 text-primary" />,
    title: 'Managing Your Inventory',
    description: 'Inventory tracks your stock levels so you always know what you have and what needs restocking.',
    tips: [
      '"New Product" — adds a single product with its name, starting stock, cost price, and a low-stock alert threshold',
      '"Bulk Restock" — update stock for many products at once (use Add mode to add units, or Set mode to fix an exact quantity)',
      '"Import Excel" — download the template, fill it in with your products, and upload it to add hundreds of items at once',
      '"Restock" button on each row — adds new stock units for a single product',
      'The Low Stock Alert card at the top shows how many items are below their threshold — click the filter to see them',
      'When you record a sale with an inventory item, stock is automatically deducted',
    ],
    path: '/dashboard/inventory',
    actionLabel: 'Go to Inventory',
  },
  {
    page: 'Customers',
    icon: <Users className="w-6 h-6 text-primary" />,
    title: 'Customer Profiles',
    description: 'Customers are created automatically when you record a sale with a customer name. No manual entry needed.',
    tips: [
      'Click any customer row to see their full purchase history in the side panel',
      'VIP customers are your highest spenders — they deserve extra attention',
      'At Risk customers haven\'t bought in over 30 days — good candidates for a follow-up',
      'Use the segment filter to target specific groups',
      'The Repeat Rate at the top shows the percentage of customers who have bought more than once',
    ],
    path: '/dashboard/customers',
    actionLabel: 'View Customers',
  },
  {
    page: 'Operations',
    icon: <ClipboardCheck className="w-6 h-6 text-primary" />,
    title: 'Task List & Reminders',
    description: 'Operations is your business to-do list. Use it to track things you need to do and set up recurring reminders so nothing gets forgotten.',
    tips: [
      'Quick Add (right sidebar) — type a task and press Enter to add it instantly',
      'Advanced Task — set a priority, due date, tags, and even attach a link to a document or Google Sheet',
      'Recurring Tasks — create automations that generate a task every day, week, or month automatically (e.g. "Send weekly sales report")',
      'High priority tasks get a red left border so they stand out',
      'Overdue tasks turn orange and get bumped up in priority automatically',
      'Use the tag filters to see only Sales, Inventory, or Admin tasks',
    ],
    path: '/dashboard/operations',
    actionLabel: 'Go to Operations',
  },
  {
    page: 'Reports',
    icon: <FileBarChart className="w-6 h-6 text-primary" />,
    title: 'Downloading Reports',
    description: 'Reports lets you export your business data as CSV files that open in Excel or Google Sheets.',
    tips: [
      'Use the date range selector at the top to pick the period you want',
      'Financial Health — shows your daily revenue breakdown and average transaction value',
      'Smart Stock List — automatically identifies items that need restocking',
      'Customer Loyalty — lists your customers ranked by total spend with their last purchase date',
      'Sales Performance — breaks down transactions by payment method',
      '"Download All Reports" generates all four CSV files at once',
    ],
    path: '/dashboard/reports',
    actionLabel: 'View Reports',
  },
  {
    page: 'Settings',
    icon: <Settings className="w-6 h-6 text-primary" />,
    title: 'Setting Up Your Business',
    description: 'Settings is where you customize how Aflows represents your business and manage security.',
    tips: [
      'Upload your logo — it will appear on every receipt sent to customers',
      'Set your Receipt Prefix (e.g. "INV" or "RCT") and the next receipt number',
      'Add your KRA PIN and Paybill/Till number — these print on receipts automatically',
      'Receipt Footer — the message printed at the bottom of every receipt (e.g. "No refunds after 7 days")',
      'Tax Rate — if you charge VAT, set it here and it will be calculated automatically',
      'Team Members — invite staff who need access. Staff can only record sales and manage tasks',
      'Active Sessions — see all devices logged into your account. Revoke any you don\'t recognize',
      'Change Password — use a strong password with uppercase letters and numbers',
    ],
    path: '/dashboard/settings',
    actionLabel: 'Open Settings',
  },
];

export const OnboardingTour = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;
  const isFirst = step === 0;

  const handleNavigate = () => {
    if (current.path) {
      navigate(current.path);
    }
    if (!isLast) setStep(s => s + 1);
    else onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-border flex-shrink-0">
          <div className="flex gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-6 bg-primary' : i < step ? 'w-3 bg-primary/40' : 'w-3 bg-muted'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{step + 1} / {TOUR_STEPS.length}</span>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
              {typeof current.icon === 'string' ? current.icon : current.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{current.page}</p>
              <h3 className="text-lg font-bold leading-tight">{current.title}</h3>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-5">{current.description}</p>

          <div className="space-y-2.5">
            {current.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-3 border-t border-border flex-shrink-0 space-y-3">
          <div className="flex gap-3">
            {!isFirst && (
              <Button variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>
                Back
              </Button>
            )}
            <Button
              className="flex-1"
              onClick={() => {
                if (isLast) { onClose(); return; }
                setStep(s => s + 1);
              }}
            >
              {isLast ? (
                <><Check className="w-4 h-4 mr-1" /> All done!</>
              ) : (
                <>Next <ArrowRight className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          </div>

          {current.path && !isLast && (
            <button
              onClick={handleNavigate}
              className="w-full text-center text-xs text-primary hover:underline"
            >
              Take me to {current.page} →
            </button>
          )}

          <button onClick={onClose} className="w-full text-center text-xs text-muted-foreground hover:text-foreground">
            Skip tour — I'll explore on my own
          </button>
        </div>
      </motion.div>
    </div>
  );
};
