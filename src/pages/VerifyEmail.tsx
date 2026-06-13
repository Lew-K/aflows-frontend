import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { verifyEmailToken } from '@/lib/api';
import { toast } from 'sonner';
import { CheckCircle2, AlertCircle, Mail } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setState('error');
      setMessage('No verification token found. Please check your email link.');
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyEmailToken(token);
        setState('success');
        setMessage(result.message || 'Email verified successfully!');
        
        // Redirect to dashboard after 2 seconds
        const timer = setTimeout(() => {
          navigate('/dashboard');
        }, 2000);

        return () => clearTimeout(timer);
      } catch (error) {
        setState('error');
        setMessage(error instanceof Error ? error.message : 'Failed to verify email. Please try again.');
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-card/50 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden shadow-2xl p-8 md:p-12 relative z-10"
      >
        {/* Loading State */}
        {state === 'loading' && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Verifying Your Email</h2>
              <p className="text-muted-foreground text-sm">Please wait while we confirm your email address...</p>
            </div>
            <LoadingSpinner size="md" />
          </div>
        )}

        {/* Success State */}
        {state === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-6"
          >
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center"
              >
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </motion.div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
              <p className="text-muted-foreground text-sm">{message}</p>
            </div>
            <div className="pt-4 text-sm text-muted-foreground">
              Redirecting to dashboard in 2 seconds...
            </div>
            <Button
              variant="hero"
              className="w-full h-11 rounded-xl text-black font-bold"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard Now
            </Button>
          </motion.div>
        )}

        {/* Error State */}
        {state === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-6"
          >
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
              <p className="text-muted-foreground text-sm">{message}</p>
            </div>
            <div className="space-y-2 pt-4">
              <Button
                variant="hero"
                className="w-full h-11 rounded-xl text-black font-bold"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </Button>
              <Button
                variant="outline"
                className="w-full h-11 rounded-xl"
                onClick={() => navigate('/')}
              >
                Go Home
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
