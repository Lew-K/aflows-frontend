import React from 'react';
import { X, Zap, TrendingUp, Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccess } from '@/hooks/useAccess';

const PLANS = {
  growth: {
    name: 'Growth',
    price: 'KES 2,499/mo',
    icon: TrendingUp,
    color: 'text-blue-500',
    highlight: false,
    features: ['Everything in Starter', 'Inventory management', 'Customer CRM + history', 'Full analytics + projections', 'Up to 3 staff', 'CSV exports', 'Full branding & receipts'],
  },
  pro: {
    name: 'Pro',
    price: 'KES 3,999/mo',
    icon: Shield,
    color: 'text-purple-500',
    highlight: true,
    features: ['Everything in Growth', 'Unlimited staff', 'WhatsApp receipts', 'File uploads & vault', 'PDF exports', 'Priority support', 'Multi-session management'],
  },
};

interface UpgradeModalProps {
  requiredPlan: 'growth' | 'pro';
  featureName: string;
  onClose: () => void;
  locked?: boolean;
}

export const UpgradeModal = ({ requiredPlan, featureName, onClose, locked = false }: UpgradeModalProps) => {
  const { tier } = useAccess();
  const showBothPlans = tier === 'starter';
  const plan = PLANS[requiredPlan];
  const Icon = plan.icon;

  const plansToShow = showBothPlans
    ? [PLANS.growth, PLANS.pro]
    : [PLANS.pro];

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-foreground/30 backdrop-blur-sm ${locked ? '' : ''}`}
      onClick={locked ? undefined : onClose}
    >
      <div
        className={`bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl w-full ${showBothPlans ? 'sm:max-w-2xl' : 'sm:max-w-md'} max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle mobile */}
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border">
          <div>
            {locked ? (
              <>
                <p className="text-xs font-bold uppercase tracking-wider text-destructive mb-1">Trial Ended</p>
                <h2 className="text-xl font-black">Your 30-day trial has expired</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose a plan to continue using Aflows. Your data is safe.
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Upgrade Required</p>
                <h2 className="text-xl font-black">{featureName} requires an upgrade</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  You're on the <span className="font-semibold capitalize">{tier}</span> plan.
                  {showBothPlans ? ' Choose the plan that fits your business.' : ' Upgrade to Pro to unlock this.'}
                </p>
              </>
            )}
          </div>
          {!locked && (
            <button onClick={onClose} className="ml-4 text-muted-foreground hover:text-foreground flex-shrink-0 mt-1">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Plans */}
        <div className={`p-6 ${showBothPlans ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : ''}`}>
          {plansToShow.map(plan => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`rounded-xl border p-5 flex flex-col gap-4 ${plan.highlight ? 'border-primary bg-primary/5' : 'border-border'}`}
              >
                {plan.highlight && showBothPlans && (
                {/* <span className="self-start text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    Most Popular
                  </span> */}
                )}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className={`w-4 h-4 ${plan.color}`} />
                  </div>
                  <div>
                    <p className="font-bold">{plan.name}</p>
                    <p className="text-sm text-muted-foreground">{plan.price}</p>
                  </div>
                </div>

                <ul className="space-y-1.5 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full mt-2"
                  variant={plan.highlight ? 'default' : 'outline'}
                  onClick={() => onClose()}
                >
                  Upgrade to {plan.name} — {plan.price}
                </Button>
              </div>
            );
          })}
        </div>

        {!locked && (
          <div className="px-6 pb-5 text-center">
            <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
              Maybe later
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
