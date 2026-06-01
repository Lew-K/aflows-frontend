import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '@/lib/apiFetch';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PaymentVerifyPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [plan, setPlan] = useState('');
  const navigate = useNavigate();
  const { user, login, accessToken, refreshToken } = useAuth();

  useEffect(() => {
    const reference = searchParams.get('reference');
    if (!reference) { setStatus('failed'); return; }

    apiFetch(`https://api.aflows.uk/api/v1/payments/verify?reference=${reference}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setPlan(d.plan);
          setStatus('success');
          // Refresh user session so new tier is reflected immediately
          // Re-login silently by refreshing the token
          apiFetch('https://api.aflows.uk/api/v1/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refresh_token: refreshToken }),
          }).then(r => r.json()).then(refreshData => {
            if (refreshData.success && user) {
              login(refreshData.access_token, refreshData.refresh_token, {
                ...user,
                subscriptionTier: d.plan,
                subscriptionStatus: 'active',
              });
            }
          }).catch(() => {});
        } else {
          setStatus('failed');
        }
      })
      .catch(() => setStatus('failed'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-8 text-center space-y-6">
        {status === 'verifying' && (
          <>
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">Verifying your payment...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold">Payment Successful!</h2>
            <p className="text-muted-foreground">
              Your <span className="text-primary font-semibold capitalize">{plan}</span> plan is now active.
            </p>
            <Button className="w-full" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </>
        )}
        {status === 'failed' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold">Payment Failed</h2>
            <p className="text-muted-foreground">Something went wrong. Your card was not charged.</p>
            <Button className="w-full" variant="outline" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
