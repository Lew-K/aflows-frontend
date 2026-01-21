import { z } from 'zod';

export const emailSchema = z.string().email('Please enter a valid email address');

export const phoneSchema = z.string()
  .min(10, 'Phone number must be at least 10 digits')
  .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number (E.164 format)');

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const registerSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  ownerName: z.string().min(2, 'Owner name must be at least 2 characters'),
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const saleSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  itemSold: z.string().min(2, 'Item description is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  paymentReference: z.string().min(1, 'Payment reference is required'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type SaleFormData = z.infer<typeof saleSchema>;
