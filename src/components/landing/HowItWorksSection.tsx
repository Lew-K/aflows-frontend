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
      {/* Subtle Background Decoration */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-y-1/2" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest text-primary uppercase bg-primary/10 rounded-full border border-primary/20">
            Simple Process
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight">
            How Aflows Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Get started in minutes and automate your business workflows with our 
            enterprise-ready four-step process.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group relative"
            >
              {/* Connector Line (Desktop Only) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-[4.5rem] left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary/30 to-transparent z-0" />
              )}
              
              <div className="relative z-10 bg-white/[0.03] backdrop-blur-sm rounded-[2.5rem] p-8 border border-white/5 group-hover:border-primary/40 transition-all duration-500 h-full shadow-2xl">
                <div className="flex items-start justify-between mb-8">
                  {/* Icon with Gradient Glow */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} p-[1px] shadow-lg shadow-primary/10`}>
                    <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center">
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  {/* Step Number */}
                  <span className="text-5xl font-black text-white/[0.03] group-hover:text-primary/10 transition-colors duration-500">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  {item.description}
                </p>

                {/* Bottom Highlight Effect */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
