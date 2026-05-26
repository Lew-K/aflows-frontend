// Footer.tsx

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const Footer = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  return (
    <footer className="relative overflow-hidden border-t border-border/50 bg-zinc-950">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Bottom CTA Section */}
      <section className="relative border-b border-white/5 py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
            whileInView={
              shouldReduceMotion
                ? {}
                : {
                    opacity: 1,
                    y: 0,
                  }
            }
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl">
              Ready to automate your business?
            </h2>

            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-zinc-400">
              Join businesses using Aflows to manage sales, inventory,
              receipts, analytics, and customer operations in one place.
            </p>

            <Button
              onClick={() => navigate('/register')}
              variant="hero"
              size="xl"
              className="group h-14 w-full rounded-full px-10 text-lg shadow-lg shadow-primary/20 sm:w-auto"
            >
              Start Free Today
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Main Footer */}
      <div className="relative py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:items-center">
            {/* Left */}
            <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary">
                  <Zap className="h-5 w-5 text-primary-foreground" />
                </div>

                <span className="text-2xl font-bold text-white">
                  Aflows
                </span>
              </div>

              <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
                Smart business automation for modern businesses.
              </p>
            </div>

            {/* Center */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              <button
                onClick={() => navigate('/features')}
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Product
              </button>

              <button
                onClick={() => navigate('/pricing')}
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Pricing
              </button>

              <button
                onClick={() => navigate('/about')}
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                About
              </button>

              <button
                onClick={() => navigate('/contact')}
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Contact
              </button>
            </div>

            {/* Right */}
            <div className="flex flex-col items-center gap-4 text-center md:items-end md:text-right">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>

                <span className="text-xs font-medium text-emerald-300">
                  All Systems Operational
                </span>
              </div>

              <p className="text-sm text-zinc-500">
                © {new Date().getFullYear()} Aflows. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};



// import React from 'react';
// import { Zap } from 'lucide-react';

// export const Footer = () => {
//   return (
//     <footer className="bg-foreground py-12">
//       <div className="container mx-auto px-4">
//         <div className="flex flex-col md:flex-row items-center justify-between gap-6">
//           <div className="flex items-center gap-2">
//             <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
//               <Zap className="w-5 h-5 text-primary-foreground" />
//             </div>
//             <span className="text-xl font-bold text-background">Aflows</span>
//           </div>
          
//           <p className="text-background/60 text-sm">
//             © {new Date().getFullYear()} Aflows. All rights reserved.
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// };
