import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { requestPasswordReset } from '@/lib/api';
import { toast } from 'sonner';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type EmailFormData = z.infer<typeof emailSchema>;

const RequestPasswordReset = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = async (data: EmailFormData) => {
    setIsLoading(true);
    try {
      await requestPasswordReset(data.email);
      setEmail(data.email);
      setSubmitted(true);
      toast.success('Check your email for the password reset link');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to request password reset');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-card/50 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden shadow-2xl p-8 md:p-12 relative z-10"
      >
        {!submitted ? (
          <>
            <div className="mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Reset Your Password</h2>
              <p className="text-muted-foreground text-sm">Enter your email and we'll send you a link to reset your password.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/70">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@business.com"
                  className="h-11 bg-white/5 border-white/10 focus:border-primary rounded-xl"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-primary text-xs italic">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="hero"
                className="w-full h-11 rounded-xl text-black font-bold"
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner size="sm" /> : 'Send Reset Link'}
              </Button>
            </form>

            <div className="text-center pt-6">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </div>
          </>
        ) : (
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
              <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
              <p className="text-muted-foreground text-sm">We've sent a password reset link to <span className="text-primary font-semibold">{email}</span></p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-xs text-muted-foreground">The link will expire in 30 minutes. If you don't see it, check your spam folder.</p>
            </div>
            <Button
              variant="hero"
              className="w-full h-11 rounded-xl text-black font-bold"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default RequestPasswordReset;
