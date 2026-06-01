// Create src/components/dashboard/OnboardingTour.tsx:
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STEPS = [
  {
    title: 'Record your first sale',
    description: 'Go to Sales → fill in the customer name, items sold, amount, and payment method. A receipt is generated automatically.',
    icon: '🛒',
    action: { label: 'Go to Sales', path: '/dashboard/sales' },
  },
  {
    title: 'Track your inventory',
    description: 'Add your products under Inventory. Set stock levels and low-stock alerts so you never run out.',
    icon: '📦',
    action: { label: 'Go to Inventory', path: '/dashboard/inventory' },
  },
  {
    title: 'See your analytics',
    description: 'Your Analytics page updates in real time. Track revenue, top-selling items, and payment methods.',
    icon: '📊',
    action: { label: 'View Analytics', path: '/dashboard' },
  },
  {
    title: 'Customize your receipts',
    description: 'Upload your logo, add your KRA PIN, and set a receipt footer under Settings.',
    icon: '🧾',
    action: { label: 'Open Settings', path: '/dashboard/settings' },
  },
];

export const OnboardingTour = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-6"
      >
        {/* Progress dots */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-primary' : i < step ? 'w-3 bg-primary/40' : 'w-3 bg-muted'}`} />
            ))}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-4xl mb-4">{current.icon}</div>
        <h3 className="text-lg font-bold mb-2">{current.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{current.description}</p>

        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>Back</Button>
          )}
          <Button className="flex-1" onClick={() => {
            if (isLast) { onClose(); }
            else setStep(s => s + 1);
          }}>
            {isLast ? <><Check className="w-4 h-4 mr-1" /> Done</> : <>Next <ArrowRight className="w-4 h-4 ml-1" /></>}
          </Button>
        </div>

        <button onClick={onClose} className="w-full text-center text-xs text-muted-foreground mt-3 hover:text-foreground">
          Skip tour
        </button>
      </motion.div>
    </div>
  );
};
