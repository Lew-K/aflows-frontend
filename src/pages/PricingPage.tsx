import React, { useState } from 'react';
import { Check, Zap, TrendingUp, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UpgradeModal } from '@/components/dashboard/modals/UpgradeModal';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

const PLANS = [
  {
    key: 'starter', name: 'Starter', price: 'KES 999', period: '/month',
    icon: Zap, color: 'text-gray-500', highlight: false,
    description: 'For businesses just getting started.',
    features: ['Record sales', 'Receipts + PDF downloads', 'Basic analytics (today/week)', '1 staff member', 'Business settings'],
    missing: ['Inventory management', 'Customer CRM', 'Full analytics', 'CSV exports', 'File uploads'],
  },
  {
    key: 'growth', name: 'Growth', price: 'KES 2,499', period: '/month',
    icon: TrendingUp, color: 'text-blue-500', highlight: true,
    description: 'For growing businesses that need more.',
    features: ['Everything in Starter', 'Inventory management', 'Customer CRM + history', 'Full analytics + projections', 'Up to 3 staff members', 'CSV exports', 'Full branding'],
    missing: ['File uploads', 'Unlimited staff', 'PDF exports'],
  },
  {
    key: 'pro', name: 'Pro', price: 'KES 3,999', period: '/month',
    icon: Shield, color: 'text-purple-500', highlight: false,
    description: 'Full power for serious businesses.',
    features: ['Everything in Growth', 'Unlimited staff members', 'File uploads + document vault', 'PDF exports', 'Priority support', 'Multi-session management'],
    missing: [],
  },
];

export const PricingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [upgradeModal, setUpgradeModal] = useState<'growth' | 'pro' | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
  
      <div className="pt-20">
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Pricing</p>
          <h1 className="text-4xl font-black">Simple, transparent pricing</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Start free for 30 days. No credit card required. Upgrade when you're ready.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => {
            const Icon = plan.icon;
            return (
              <div key={plan.key} className={`rounded-2xl border p-6 flex flex-col gap-5 relative ${plan.highlight ? 'border-primary shadow-lg shadow-primary/10' : 'border-border'}`}>
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${plan.color}`} />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                <div>
                  <span className="text-3xl font-black">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>

                <ul className="space-y-2 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                  {plan.missing.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground/50 line-through">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-30" />
                      {f}
                    </li>
                  ))}
                </ul>

                {user ? (
                  plan.key !== 'starter' && (
                    <Button
                      className="w-full"
                      variant={plan.highlight ? 'default' : 'outline'}
                      onClick={() => setUpgradeModal(plan.key as 'growth' | 'pro')}
                    >
                      Upgrade to {plan.name}
                    </Button>
                  )
                ) : null}
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          All plans include a 30-day free trial with full Pro access. No credit card required to start.
        </p>
      </div>
      </div>


      <Footer />

      {upgradeModal && (
        <UpgradeModal
          requiredPlan={upgradeModal}
          featureName={upgradeModal === 'growth' ? 'Growth Plan' : 'Pro Plan'}
          onClose={() => setUpgradeModal(null)}
        />
      )}
    </div>
  );
};

export default PricingPage;
