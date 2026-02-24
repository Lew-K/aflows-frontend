import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/PasswordInput';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { loginSchema, type LoginFormData } from '@/lib/validation';
import { loginBusiness } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LogIn, ShieldCheck } from 'lucide-react';

export const LoginSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Logic Preserved: useForm with Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Logic Preserved: onSubmit handler
  const onSubmit = async (data: LoginFormData) => {
    if (!data.email || !data.password) return;
    
    setIsLoading(true);
    try {
      const response = await loginBusiness({
        email: data.email,
        password: data.password,
      });     

      if (response.success && response.access_token && response.refresh_token) {
        login(
          response.access_token,
          response.refresh_token,
          {
            businessId: response.user.businessId,
            businessName: response.user.businessName,
            ownerName: response.user.ownerName,
            email: data.email,
          }
        );
      
        toast.success('Login successful! Redirecting to dashboard...');
        navigate('/dashboard');
      } else {
        toast.error(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="login" className="py-24 bg-background relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto bg-card/50 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl flex flex-col md:flex-row"
        >
          {/* Left Side: Brand/Info Pane */}
          <div className="md:w-5/12 bg-primary/10 p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5">
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
                <ShieldCheck className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Secure Access</h2>
              <p className="text-muted-foreground leading-relaxed">
                Log in to manage your sales, generate receipts, and monitor your business growth in real-time.
              </p>
            </div>
            
            <div className="mt-12">
              <div className="flex -space-x-2 mb-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] text-primary">
                    AF
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                Joined by 500+ businesses across Kenya.
              </p>
            </div>
          </div>

          {/* Right Side: Form Pane */}
          <div className="md:w-7/12 p-8 md:p-12">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Welcome Back</h3>
              <p className="text-muted-foreground">Please enter your details to continue.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-sm font-semibold text-white/70">Email Address</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@business.com"
                  className="h-12 bg-white/5 border-white/10 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-primary text-xs mt-1 italic">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="login-password" className="text-sm font-semibold text-white/70">Password</Label>
                  <button type="button" className="text-xs text-primary hover:underline transition-all">
                    Forgot Password?
                  </button>
                </div>
                <PasswordInput
                  id="login-password"
                  placeholder="••••••••"
                  className="h-12 bg-white/5 border-white/10 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-primary text-xs mt-1 italic">{errors.password.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                variant="hero" 
                className="w-full h-12 rounded-xl text-black font-bold text-base shadow-lg shadow-primary/10 hover:shadow-primary/30 active:scale-[0.98] transition-all" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <div className="flex items-center gap-2">
                    Sign In to Dashboard
                    <LogIn className="w-4 h-4" />
                  </div>
                )}
              </Button>

              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  New to Aflows? {' '}
                  <button 
                    type="button"
                    onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-primary font-bold hover:underline"
                  >
                    Create an account
                  </button>
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
