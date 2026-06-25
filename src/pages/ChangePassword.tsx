import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/PasswordInput';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { changePassword, changePasswordStaff, resetPassword } from '@/lib/api';
import { toast } from 'sonner';
import { Lock, Check, AlertCircle } from 'lucide-react';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ChangePassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [flowType, setFlowType] = useState<'staff' | 'owner' | 'reset'>('owner');
  const [invalidToken, setInvalidToken] = useState(false);

  const token = searchParams.get('token');

  // Determine flow type
  useEffect(() => {
    if (!isAuthenticated && !token) {
      navigate('/login');
      return;
    }

    if (isAuthenticated) {
      // User is logged in
      if (user?.mustChangePassword) {
        setFlowType('staff');
      } else {
        setFlowType('owner');
      }
    } else if (token) {
      // User is not logged in but has reset token
      setFlowType('reset');
    }
  }, [isAuthenticated, token, user?.mustChangePassword, navigate]);

  // For change password (requires current password)
  const {
    register: registerChange,
    handleSubmit: handleChangeSubmit,
    watch: watchChange,
    formState: { errors: errorsChange },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  // For reset password (no current password needed)
  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    watch: watchReset,
    formState: { errors: errorsReset },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const newPassword = watchChange('newPassword');
  const confirmPassword = watchChange('confirmPassword');
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const passwordsDontMatch = newPassword && confirmPassword && newPassword !== confirmPassword;

  const resetNewPassword = watchReset('newPassword');
  const resetConfirmPassword = watchReset('confirmPassword');
  const resetPasswordsMatch = resetNewPassword && resetConfirmPassword && resetNewPassword === resetConfirmPassword;
  const resetPasswordsDontMatch = resetNewPassword && resetConfirmPassword && resetNewPassword !== resetConfirmPassword;

  const onChangeSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      if (flowType === 'staff') {
        await changePasswordStaff(data.currentPassword, data.newPassword);
      } else if (flowType === 'owner') {
        await changePassword(data.currentPassword, data.newPassword);
      }
      updateUser({ mustChangePassword: false });
  
      toast.success('Password changed successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Invalid reset link');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token, data.newPassword);
      toast.success('Password reset successfully! Please log in.');
      navigate('/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reset password';
      if (message.includes('expired') || message.includes('Invalid')) {
        setInvalidToken(true);
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (invalidToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-card/80 backdrop-blur-xl rounded-2xl border border-border overflow-hidden shadow-2xl p-8 md:p-12 relative z-10"
        >
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Link Expired</h2>
              <p className="text-muted-foreground text-sm">Your password reset link has expired. Please request a new one.</p>
            </div>
            <div className="space-y-2 pt-4">
              <Button
                variant="hero"
                className="w-full h-11 rounded-xl font-bold"
                onClick={() => navigate('/request-password-reset')}
              >
                Request New Reset Link
              </Button>
              <Button
                variant="outline"
                className="w-full h-11 rounded-xl"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-card/80 backdrop-blur-xl rounded-2xl border border-border overflow-hidden shadow-2xl p-8 md:p-12 relative z-10"
      >
        <div className="mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {flowType === 'staff' ? 'Create Your Password' : flowType === 'reset' ? 'Reset Your Password' : 'Change Your Password'}
          </h2>
          <p className="text-muted-foreground text-sm">
            {flowType === 'staff' ? 'Set a strong password for your account.' : 'Enter a new password to secure your account.'}
          </p>
        </div>

        {(flowType === 'staff' || flowType === 'owner') && (
          <form onSubmit={handleChangeSubmit(onChangeSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-foreground">Current Password</Label>
              <PasswordInput
                id="current-password"
                placeholder="••••••••"
                className="h-11 bg-background border-border focus:border-primary rounded-xl"
                {...registerChange('currentPassword')}
              />
              {errorsChange.currentPassword && (
                <p className="text-primary text-xs italic">{errorsChange.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-foreground">New Password</Label>
              <PasswordInput
                id="new-password"
                placeholder="••••••••"
                className="h-11 bg-background border-border focus:border-primary rounded-xl"
                {...registerChange('newPassword')}
              />
              {errorsChange.newPassword && (
                <p className="text-primary text-xs italic">{errorsChange.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-foreground">Confirm Password</Label>
              <div className="relative">
                <PasswordInput
                  id="confirm-password"
                  placeholder="••••••••"
                  className="h-11 bg-background border-border focus:border-primary rounded-xl"
                  {...registerChange('confirmPassword')}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {passwordsMatch && <Check className="w-4 h-4 text-green-500" />}
                </div>
              </div>
              {errorsChange.confirmPassword && (
                <p className="text-primary text-xs italic">{errorsChange.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="hero"
              className="w-full h-11 rounded-xl font-bold"
              disabled={isLoading || passwordsDontMatch}
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Change Password'}
            </Button>
          </form>
        )}

        {flowType === 'reset' && (
          <form onSubmit={handleResetSubmit(onResetSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="reset-password" className="text-foreground">New Password</Label>
              <PasswordInput
                id="reset-password"
                placeholder="••••••••"
                className="h-11 bg-background border-border focus:border-primary rounded-xl"
                {...registerReset('newPassword')}
              />
              {errorsReset.newPassword && (
                <p className="text-primary text-xs italic">{errorsReset.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-confirm-password" className="text-foreground">Confirm Password</Label>
              <div className="relative">
                <PasswordInput
                  id="reset-confirm-password"
                  placeholder="••••••••"
                  className="h-11 bg-background border-border focus:border-primary rounded-xl"
                  {...registerReset('confirmPassword')}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {resetPasswordsMatch && <Check className="w-4 h-4 text-green-500" />}
                </div>
              </div>
              {errorsReset.confirmPassword && (
                <p className="text-primary text-xs italic">{errorsReset.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="hero"
              className="w-full h-11 rounded-xl font-bold"
              disabled={isLoading || resetPasswordsDontMatch}
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Reset Password'}
            </Button>
          </form>
        )}

        <div className="text-center pt-6">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-sm text-muted-foreground hover:text-primary transition-all"
          >
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ChangePassword;
