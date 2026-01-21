import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, LogIn, Upload, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Register Your Business',
    description: 'Create your account in minutes with just your business details. No credit card required.',
  },
  {
    icon: LogIn,
    step: '02',
    title: 'Log In Securely',
    description: 'Access your dashboard with enterprise-grade security. Your data is always protected.',
  },
  {
    icon: Upload,
    step: '03',
    title: 'Upload & Organize',
    description: 'Upload invoices, receipts, bank statements, and more. Everything organized automatically.',
  },
  {
    icon: TrendingUp,
    step: '04',
    title: 'Track & Grow',
    description: 'Monitor sales, generate receipts, and get insights to grow your business faster.',
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="section-padding bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium mb-4 block">Simple Process</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How Aflows Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get started in minutes and automate your business workflows with our simple four-step process.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-border" />
              )}
              
              <div className="relative bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
                    <item.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <span className="text-4xl font-bold text-muted-foreground/30">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
