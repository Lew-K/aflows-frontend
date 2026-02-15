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
import { UserPlus, Check, X } from 'lucide-react';

export const RegisterSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await registerBusiness({
        businessName: data.businessName,
        ownerName: data.ownerName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      
      if (response.success && response.access_token) {
        login(response.access_token, {
          businessId: response.business_id,
          businessName: response.business_name,
          ownerName: response.business_owner,
          email: data.email,
        });
      
        localStorage.setItem('access_token', response.access_token);
      
        toast.success('Registration successful! Welcome to Aflows.');
        navigate('/dashboard');
      } else {
        toast.error(response.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <section id="register" className="section-padding bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-lg mx-auto"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
              <UserPlus className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Create Your Account</h2>
            <p className="text-muted-foreground">
              Register your business to get started with Aflows
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="bg-card rounded-2xl p-8 border border-border shadow-soft">
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="Acme Corp"
                    className="mt-2"
                    {...register('businessName')}
                  />
                  {errors.businessName && (
                    <p className="text-destructive text-sm mt-1">{errors.businessName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <Input
                    id="ownerName"
                    placeholder="John Doe"
                    className="mt-2"
                    {...register('ownerName')}
                  />
                  {errors.ownerName && (
                    <p className="text-destructive text-sm mt-1">{errors.ownerName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="register-email">Email Address</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="you@business.com"
                  className="mt-2"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+254700000000"
                  className="mt-2"
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="register-password">Password</Label>
                <PasswordInput
                  id="register-password"
                  placeholder="Create a strong password"
                  className="mt-2"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-destructive text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    className="mt-2"
                    {...register('confirmPassword')}
                  />
                  {passwordsMatch && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 mt-1">
                      <Check className="w-5 h-5 text-success" />
                    </div>
                  )}
                  {passwordsDontMatch && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 mt-1">
                      <X className="w-5 h-5 text-destructive" />
                    </div>
                  )}
                </div>
                {errors.confirmPassword && (
                  <p className="text-destructive text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
                {passwordsDontMatch && !errors.confirmPassword && (
                  <p className="text-destructive text-sm mt-1">Passwords do not match</p>
                )}
              </div>

              <Button type="submit" variant="hero" className="w-full" disabled={isLoading || passwordsDontMatch}>
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    Create Account
                    <UserPlus className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};
