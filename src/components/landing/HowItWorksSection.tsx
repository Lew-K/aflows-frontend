import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, LogIn, Upload, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Register Your Business',
    description: 'Create your account in minutes with just your business details. No credit card required.',
    color: 'from-emerald-400 to-cyan-400',
  },
  {
    icon: LogIn,
    step: '02',
    title: 'Log In Securely',
    description: 'Access your dashboard with enterprise-grade security. Your data is always protected.',
    color: 'from-cyan-400 to-blue-400',
  },
  {
    icon: Upload,
    step: '03',
    title: 'Upload & Organize',
    description: 'Upload invoices, receipts, bank statements, and more. Everything organized automatically.',
    color: 'from-blue-400 to-indigo-400',
  },
  {
    icon: TrendingUp,
    step: '04',
    title: 'Track & Grow',
    description: 'Monitor sales, generate receipts, and get insights to grow your business faster.',
    color: 'from-indigo-400 to-primary',
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Header - Matching the Hero's Emerald-to-White text flow */}
        <motion.div className="text-center mb-20">
          <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-4 block">
            The Workflow
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How <span className="text-primary">Aflows</span> Works
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <motion.div key={item.step} className="group relative">
              
              {/* Connector Line - Now a subtle dimmed emerald line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[70%] w-[60%] h-[1px] bg-primary/10" />
              )}
              
              <div className="relative z-10 p-8 rounded-3xl bg-card border border-white/5 group-hover:border-primary/50 transition-all duration-500">
                {/* Icon Box - STRICT Emerald Theme */}
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] transition-all duration-300">
                  <item.icon className="w-6 h-6 text-primary group-hover:text-black transition-colors" />
                </div>

                {/* Step number now matches the muted emerald text */}
                <span className="absolute top-8 right-8 text-4xl font-bold text-primary/5 group-hover:text-primary/10 transition-colors">
                  {item.step}
                </span>

                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
