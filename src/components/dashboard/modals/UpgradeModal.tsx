import React from 'react';
import { X, Zap, TrendingUp, Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccess } from '@/hooks/useAccess';

const PLANS = {
  growth: {
    name: 'Growth',
    price: 'KES 2,500/mo',
    icon: TrendingUp,
    color: 'text-blue-500',
    features: ['Inventory management', 'Customer CRM', 'Full analytics', '3 staff members', 'CSV exports', 'Full branding'],
  },
  pro: {
    name: 'Pro',
    price: 'KES 4,000/mo',
    icon: Shield,
    color: 'text-purple-500',
    features: ['Everything in Growth', 'Unlimited staff', 'WhatsApp receipts', 'File uploads', 'PDF exports', 'Priority support'],
  },
};

interface UpgradeModalProps {
  requiredPlan: 'growth' | 'pro';
  featureName: string;
  onClose: () => void;
}

export const UpgradeModal = ({ requiredPlan, featureName, onClose }: UpgradeModalProps) => {
  const { tier } = useAccess();
  const plan = PLANS[requiredPlan];
  const Icon = plan.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className={`w-5 h-5 ${plan.color}`} />
            </div>
            <div>
              <h2 className="font-bold text-lg">Upgrade to {plan.name}</h2>
              <p className="text-sm text-muted-foreground">{plan.price}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{featureName}</span> requires the {plan.name} plan.
          You're currently on <span className="font-semibold capitalize">{tier}</span>.
        </p>

        <ul className="space-y-2">
          {plan.features.map(f => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        <div className="space-y-3">
          <Button className="w-full" variant="hero" onClick={() => {
            // Paystack integration goes here
            onClose();
          }}>
            Upgrade Now — {plan.price}
          </Button>
          <Button className="w-full" variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
        </div>
      </div>
    </div>
  );
};
