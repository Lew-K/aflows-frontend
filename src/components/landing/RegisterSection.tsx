import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/PasswordInput';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { registerSchema, type RegisterFormData } from '@/lib/validation';
import { registerBusiness } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { UserPlus, Check, X, Rocket, Sparkles } from 'lucide-react';

export const RegisterSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Logic Preserved: form setup and watchers
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordsDontMatch = password && confirmPassword && password !== confirmPassword;

  // Logic Preserved: registration handler
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const res = await registerBusiness({
        businessName: data.businessName,
        ownerName: data.ownerName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      
      if (res.success && res.access_token && res.refresh_token) {
        login(
          res.access_token,
          res.refresh_token,
          {
            businessId: res.businessId,
            businessName: res.businessName,
            ownerName: res.ownerName,
            email: data.email,
          }
        );
        toast.success('Registration successful! Welcome to Aflows.');
        navigate('/dashboard');
      } else {
        toast.error(res.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Register error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="register" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto bg-card/50 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl flex flex-col md:flex-row-reverse"
        >
          {/* Left Side (Visual Pane): Feature Highlights */}
          <div className="md:w-5/12 bg-primary/10 p-12 flex flex-col justify-between border-b md:border-b-0 md:border-l border-white/5">
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
                <Rocket className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-6">Scale Your Business</h2>
              
              <ul className="space-y-6">
                {[
                  "Automated receipt generation",
                  "Real-time revenue tracking",
                  "Secure document vault"
                ].map((text, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2 text-primary">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Free Tier Included</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Get started today with our base features at zero cost. No credit card required.
              </p>
            </div>
          </div>

          {/* Right Side (Form Pane): Register Details */}
          <div className="md:w-7/12 p-8 md:p-12">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Create Your Account</h3>
              <p className="text-muted-foreground">Join the future of business automation.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="text-white/70">Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="Acme Corp"
                    className="bg-white/5 border-white/10 focus:border-primary transition-all h-11"
                    {...register('businessName')}
                  />
                  {errors.businessName && <p className="text-primary text-[10px] mt-1 italic">{errors.businessName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerName" className="text-white/70">Owner Name</Label>
                  <Input
                    id="ownerName"
                    placeholder="John Doe"
                    className="bg-white/5 border-white/10 focus:border-primary transition-all h-11"
                    {...register('ownerName')}
                  />
                  {errors.ownerName && <p className="text-primary text-[10px] mt-1 italic">{errors.ownerName.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-white/70">Email Address</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="you@business.com"
                  className="bg-white/5 border-white/10 focus:border-primary transition-all h-11"
                  {...register('email')}
                />
                {errors.email && <p className="text-primary text-[10px] mt-1 italic">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white/70">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+254700000000"
                  className="bg-white/5 border-white/10 focus:border-primary transition-all h-11"
                  {...register('phone')}
                />
                {errors.phone && <p className="text-primary text-[10px] mt-1 italic">{errors.phone.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-white/70">Password</Label>
                  <PasswordInput
                    id="register-password"
                    placeholder="••••••••"
                    className="bg-white/5 border-white/10 focus:border-primary transition-all h-11"
                    {...register('password')}
                  />
                  {errors.password && <p className="text-primary text-[10px] mt-1 italic">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white/70">Confirm</Label>
                  <div className="relative">
                    <PasswordInput
                      id="confirmPassword"
                      placeholder="••••••••"
                      className="bg-white/5 border-white/10 focus:border-primary transition-all h-11"
                      {...register('confirmPassword')}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {passwordsMatch && <Check className="w-4 h-4 text-primary" />}
                      {passwordsDontMatch && <X className="w-4 h-4 text-destructive" />}
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                variant="hero" 
                className="w-full h-12 rounded-xl text-black font-bold shadow-lg shadow-primary/10 transition-all active:scale-[0.98]" 
                disabled={isLoading || passwordsDontMatch}
              >
                {isLoading ? <LoadingSpinner size="sm" /> : "Create Your Account"}
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Already have an account? {' '}
                <button 
                  type="button"
                  onClick={() => document.getElementById('login')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-primary font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
