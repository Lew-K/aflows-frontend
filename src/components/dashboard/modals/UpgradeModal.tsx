import React, { useState } from 'react';
import { X, TrendingUp, Shield, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccess } from '@/hooks/useAccess';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/apiFetch';
import { toast } from 'sonner';
import { useNotifications } from '@/contexts/NotificationContext';
import { initializePaystack } from '@/lib/paystack';

declare global {
  interface Window { PaystackPop: any; }
}

const PLANS = {
  growth: {
    name: 'Growth', price: 'KES 2,499/mo', amount: 249900,
    icon: TrendingUp, color: 'text-blue-500', highlight: true,
    features: [
      'Everything in Starter',
      'Inventory management (unlimited)',
      'Customer CRM + purchase history',
      'Full analytics — all periods + projections',
      'Up to 3 staff members',
      'CSV exports',
      'Full branding + receipt customization',
    ],
  },
  pro: {
    name: 'Pro', price: 'KES 3,999/mo', amount: 399900,
    icon: Shield, color: 'text-purple-500', highlight: false,
    features: [
      'Everything in Growth',
      'Unlimited staff members',
      'File uploads + document vault',
      'PDF exports',
      'Priority support',
      'Multi-session management',
    ],
  },
};

interface Props {
  requiredPlan: 'growth' | 'pro';
  featureName: string;
  onClose: () => void;
  locked?: boolean;
  onSuccess?: () => void;
}

export const UpgradeModal = ({ requiredPlan, featureName, onClose, locked = false, onSuccess }: Props) => {
  const { tier } = useAccess();
  const { user, login } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  const showBothPlans = tier === 'starter';
  const plansToShow = showBothPlans ? [PLANS.growth, PLANS.pro] : [PLANS.pro];

  const handlePayment = async (planKey: 'growth' | 'pro') => {
    if (!user?.email) { toast.error('No email found'); return; }
    setLoading(planKey);

    try {
      await initializePaystack();
      if (!window.PaystackPop) throw new Error('Paystack failed to load');

      const res = await apiFetch('https://api.aflows.uk/api/v1/payments/initialize', {
        method: 'POST',
        body: JSON.stringify({ plan: planKey, email: user.email }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Payment init failed');

      const handler = window.PaystackPop.setup({
        key: data.public_key,
        email: user.email,
        amount: data.amount,
        currency: 'KES',
        ref: data.reference,
        metadata: data.metadata,
        callback_url: `${window.location.origin}/payment/verify`,

        callback: (transaction: any) => { void (async () => {
          try {
            const verifyRes = await apiFetch(
              `https://api.aflows.uk/api/v1/payments/verify?reference=${transaction.reference}`
            );
            const verified = await verifyRes.json();

            if (!verified.success) {
              toast.error('Payment received but activation failed. Contact support.');
              setLoading(null);
              return;
            }

            if (user) {
              login({
                ...user,
                subscriptionTier: verified.plan,
                subscriptionStatus: 'active',
                currentPeriodEnd: verified.expires_at,
              });
            }

            setPaymentSuccess(planKey);
            setLoading(null);
            addNotification('success', `Welcome to ${PLANS[planKey].name}!`, 'Your subscription is now active.');
            setTimeout(() => { onSuccess?.(); onClose(); }, 2500);

          } catch {
            toast.error('Payment received but activation failed. Contact support.');
            setLoading(null);
          }
        })(); },

        onClose: () => setLoading(null),
      });

      handler.openIframe();

    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Payment failed');
      setLoading(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={locked ? undefined : onClose}
    >
      <div
        className={`bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl w-full ${showBothPlans ? 'sm:max-w-2xl' : 'sm:max-w-md'} max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        {paymentSuccess ? (
          <div className="p-12 flex flex-col items-center justify-center gap-4 text-center min-h-[300px]">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center animate-in zoom-in">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-black">You're on {PLANS[paymentSuccess as 'growth' | 'pro'].name}!</h2>
            <p className="text-muted-foreground max-w-sm">
              Your subscription is now active. All features are unlocked and you can start using your new plan immediately.
            </p>
            <div className="flex gap-1 mt-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mt-3 sm:hidden" />

            <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border">
              <div>
                {locked ? (
                  <>
                    <p className="text-xs font-bold uppercase tracking-wider text-destructive mb-1">Trial Ended</p>
                    <h2 className="text-xl font-black">Your 30-day trial has expired</h2>
                    <p className="text-sm text-muted-foreground mt-1">Your data is safe. Choose a plan to continue.</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Upgrade Required</p>
                    <h2 className="text-xl font-black">{featureName} requires an upgrade</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      You're on <span className="font-semibold capitalize">{tier}</span>.
                      {showBothPlans ? ' Choose a plan below.' : ' Upgrade to Pro to unlock this.'}
                    </p>
                  </>
                )}
              </div>
              {!locked && (
                <button onClick={onClose} className="ml-4 text-muted-foreground hover:text-foreground mt-1">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className={`p-6 ${showBothPlans ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : ''}`}>
              {plansToShow.map(plan => {
                const PlanIcon = plan.icon;
                const planKey = plan.name.toLowerCase() as 'growth' | 'pro';
                return (
                  <div
                    key={plan.name}
                    className={`rounded-xl border p-5 flex flex-col gap-4 ${plan.highlight ? 'border-primary bg-primary/5' : 'border-border'}`}
                  >
                    {plan.highlight && showBothPlans && (
                      <span className="self-start text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                        Most Popular
                      </span>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <PlanIcon className={`w-4 h-4 ${plan.color}`} />
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
                      disabled={loading === planKey}
                      onClick={() => handlePayment(planKey)}
                    >
                      {loading === planKey
                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                        : `Upgrade to ${plan.name} — ${plan.price}`
                      }
                    </Button>
                    <p className="text-[10px] text-center text-muted-foreground">
                      Secured payment · Visa, Mastercard, M-Pesa supported
                    </p>
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
          </>
        )}
      </div>
    </div>
  );
};

// import React, { useState } from 'react';
// import { X, TrendingUp, Shield, Check, Loader2 } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { useAccess } from '@/hooks/useAccess';
// import { useAuth } from '@/contexts/AuthContext';
// import { apiFetch } from '@/lib/apiFetch';
// import { toast } from 'sonner';
// import { useNotifications } from '@/contexts/NotificationContext';
// import { initializePaystack } from '@/lib/paystack';


// declare global {
//   interface Window { PaystackPop: any; }
// }

// const PLANS = {
//   growth: {
//     name: 'Growth', price: 'KES 2,499/mo', amount: 249900,
//     icon: TrendingUp, color: 'text-blue-500', highlight: true,
//     features: [
//       'Everything in Starter',
//       'Inventory management (unlimited)',
//       'Customer CRM + purchase history',
//       'Full analytics — all periods + projections',
//       'Up to 3 staff members',
//       'CSV exports',
//       'Full branding + receipt customization',
//     ],
//   },
//   pro: {
//     name: 'Pro', price: 'KES 3,999/mo', amount: 399900,
//     icon: Shield, color: 'text-purple-500', highlight: false,
//     features: [
//       'Everything in Growth',
//       'Unlimited staff members',
//       'File uploads + document vault',
//       'PDF exports',
//       'Priority support',
//       'Multi-session management',
//     ],
//   },
// };

// interface Props {
//   requiredPlan: 'growth' | 'pro';
//   featureName: string;
//   onClose: () => void;
//   locked?: boolean;
//   onSuccess?: () => void;
// }

// export const UpgradeModal = ({ requiredPlan, featureName, onClose, locked = false, onSuccess }: Props) => {
//   const { tier } = useAccess();
//   const { user, login, accessToken, refreshToken } = useAuth();
//   const [loading, setLoading] = useState<string | null>(null);
//   const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
//   const { addNotification } = useNotifications();

//   const showBothPlans = tier === 'starter';
//   const plansToShow = showBothPlans ? [PLANS.growth, PLANS.pro] : [PLANS.pro];

//   const handlePayment = async (planKey: 'growth' | 'pro') => {
//     if (!user?.email) { toast.error('No email found'); return; }
  
//     setLoading(planKey);
  
//     try {
//       console.log('1️⃣ Loading Paystack script...');
//       await initializePaystack();
  
//       if (!window.PaystackPop) throw new Error('PaystackPop is undefined after load');
  
//       console.log('3️⃣ Initializing payment on backend...');
//       const res = await apiFetch('https://api.aflows.uk/api/v1/payments/initialize', {
//         method: 'POST',
//         body: JSON.stringify({ plan: planKey, email: user.email }),
//       });
//       const data = await res.json();
//       if (!data.success) throw new Error(data.message || 'Payment init failed');
  
//       const handler = window.PaystackPop.setup({
//         key: data.public_key,
//         email: user.email,
//         amount: data.amount,
//         currency: 'KES',
//         ref: data.reference,
//         metadata: data.metadata,
//         callback_url: `${window.location.origin}/payment/verify`, // ← fallback for M-Pesa redirect
  
//         callback: (transaction: any) => { void (async () => {
//           console.log('🎉 callback fired', transaction);
  
//           try {
//             // Verify server-side first, then update state from server response
//             const verifyRes = await apiFetch(
//               `https://api.aflows.uk/api/v1/payments/verify?reference=${transaction.reference}`
//             );
//             const verified = await verifyRes.json();
  
//             if (!verified.success) {
//               toast.error('Payment received but activation failed. Contact support.');
//               setLoading(null);
//               return;
//             }
  
//             // Update auth from server-confirmed values, not frontend assumptions
//             if (user) {
//               login(accessToken!, refreshToken!, {
//                 ...user,
//                 subscriptionTier: verified.plan,
//                 subscriptionStatus: 'active',
//                 currentPeriodEnd: verified.expires_at,
//               });
//             }
  
//             setPaymentSuccess(planKey);
//             setLoading(null);
//             addNotification('success', `Welcome to ${PLANS[planKey].name}!`, 'Your subscription is now active.');
  
//             setTimeout(() => { onSuccess?.(); onClose(); }, 2500);
  
//           } catch (e) {
//             console.error('Verification error:', e);
//             toast.error('Payment received but activation failed. Contact support.');
//             setLoading(null);
//           }
//         })(); },
  
//         onClose: () => {
//           console.log('❌ User closed popup');
//           setLoading(null);
//         },
//       });
  
//       handler.openIframe();
  
//     } catch (err) {
//       console.error('❌ Payment error:', err);
//       toast.error(err instanceof Error ? err.message : 'Payment failed');
//       setLoading(null);
//     }
//   };


  

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm"
//       onClick={locked ? undefined : onClose}
//     >
//       <div
//         className={`bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl w-full ${showBothPlans ? 'sm:max-w-2xl' : 'sm:max-w-md'} max-h-[90vh] overflow-y-auto`}
//         onClick={e => e.stopPropagation()}
//       >
//         {/* Success State */}
//         {paymentSuccess ? (
//           <div className="p-12 flex flex-col items-center justify-center gap-4 text-center min-h-[300px]">
//             <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center animate-in zoom-in">
//               <Check className="w-8 h-8 text-green-500" />
//             </div>

//             <h2 className="text-2xl font-black">
//               You're on {PLANS[paymentSuccess as 'growth' | 'pro'].name}!
//             </h2>

//             <p className="text-muted-foreground max-w-sm">
//               Your subscription is now active. All features are unlocked and you can start using your new plan immediately.
//             </p>

//             <div className="flex gap-1 mt-2">
//               {[0, 1, 2].map(i => (
//                 <div
//                   key={i}
//                   className="w-2 h-2 rounded-full bg-primary animate-bounce"
//                   style={{ animationDelay: `${i * 0.15}s` }}
//                 />
//               ))}
//             </div>
//           </div>
//         ) : (
//           <>
//             <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mt-3 sm:hidden" />

//             <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border">
//               <div>
//                 {locked ? (
//                   <>
//                     <p className="text-xs font-bold uppercase tracking-wider text-destructive mb-1">
//                       Trial Ended
//                     </p>
//                     <h2 className="text-xl font-black">Your 30-day trial has expired</h2>
//                     <p className="text-sm text-muted-foreground mt-1">
//                       Your data is safe. Choose a plan to continue.
//                     </p>
//                   </>
//                 ) : (
//                   <>
//                     <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
//                       Upgrade Required
//                     </p>
//                     <h2 className="text-xl font-black">{featureName} requires an upgrade</h2>
//                     <p className="text-sm text-muted-foreground mt-1">
//                       You're on <span className="font-semibold capitalize">{tier}</span>.
//                       {showBothPlans ? ' Choose a plan below.' : ' Upgrade to Pro to unlock this.'}
//                     </p>
//                   </>
//                 )}
//               </div>
//               {!locked && (
//                 <button onClick={onClose} className="ml-4 text-muted-foreground hover:text-foreground mt-1">
//                   <X className="w-5 h-5" />
//                 </button>
//               )}
//             </div>

//             <div className={`p-6 ${showBothPlans ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : ''}`}>
//               {plansToShow.map(plan => {
//                 const PlanIcon = plan.icon;
//                 const planKey = plan.name.toLowerCase() as 'growth' | 'pro';
//                 return (
//                   <div
//                     key={plan.name}
//                     className={`rounded-xl border p-5 flex flex-col gap-4 ${
//                       plan.highlight ? 'border-primary bg-primary/5' : 'border-border'
//                     }`}
//                   >
//                     {plan.highlight && showBothPlans && (
//                       <span className="self-start text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
//                         Most Popular
//                       </span>
//                     )}

//                     <div className="flex items-center gap-3">
//                       <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
//                         <PlanIcon className={`w-4 h-4 ${plan.color}`} />
//                       </div>
//                       <div>
//                         <p className="font-bold">{plan.name}</p>
//                         <p className="text-sm text-muted-foreground">{plan.price}</p>
//                       </div>
//                     </div>

//                     <ul className="space-y-1.5 flex-1">
//                       {plan.features.map(f => (
//                         <li key={f} className="flex items-start gap-2 text-sm">
//                           <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
//                           {f}
//                         </li>
//                       ))}
//                     </ul>

//                     <Button
//                       className="w-full mt-2"
//                       variant={plan.highlight ? 'default' : 'outline'}
//                       disabled={loading === planKey}
//                       onClick={() => handlePayment(planKey)}
//                     >
//                       {loading === planKey ? (
//                         <>
//                           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                           Processing...
//                         </>
//                       ) : (
//                         `Upgrade to ${plan.name} — ${plan.price}`
//                       )}
//                     </Button>

//                     <p className="text-[10px] text-center text-muted-foreground">
//                       Secured payment · Visa, Mastercard, M-Pesa supported
//                     </p>
//                   </div>
//                 );
//               })}
//             </div>

//             {!locked && (
//               <div className="px-6 pb-5 text-center">
//                 <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
//                   Maybe later
//                 </button>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

