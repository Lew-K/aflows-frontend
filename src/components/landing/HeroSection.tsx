import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3, FileUp, Receipt, Zap } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';

export const HeroSection = () => {
  const scrollToRegister = () => {
    const element = document.getElementById('register');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center pt-32 pb-20 overflow-hidden bg-background">
      {/* Updated: Refined background radial glows for that "SaaS" depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-20%] w-[70%] h-[70%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-20%] w-[60%] h-[60%] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Automate Your Business Today
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-foreground mb-8 tracking-tight leading-[1.1]"
          >
            Streamline Your Business with <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-emerald-400 to-primary animate-gradient">
              Smart Automation
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Track sales, generate receipts, upload documents, and gain powerful analytics insights — all in one platform designed for modern businesses.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
          >
            <Button onClick={scrollToRegister} variant="hero" size="xl" className="rounded-full px-10 h-14 text-lg shadow-lg shadow-primary/20 group">
              Start Free Today
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              variant="outline"
              size="xl"
              className="rounded-full px-10 h-14 text-lg border-white/10 hover:bg-white/5"
            >
              See How It Works
            </Button>
          </motion.div>

          {/* Feature Cards: Bento Grid Style */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24"
          >
            {[
              { icon: BarChart3, title: 'Real-time Analytics', desc: 'Track your sales and revenue with live dashboards' },
              { icon: Receipt, title: 'Auto Receipts', desc: 'Generate professional receipts automatically' },
              { icon: FileUp, title: 'Smart File Management', desc: 'Organize invoices, statements, and documents' },
            ].map((f, i) => (
              <div
                key={f.title}
                className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-primary/50 hover:bg-white/[0.04] transition-all duration-500 text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* Dashboard Preview Image with refined "Glow-up" */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-[2.5rem] blur-2xl opacity-50" />
            <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-slate-900 shadow-2xl">
              <img src={heroBg} alt="Aflows Dashboard" className="w-full h-auto transform hover:scale-[1.02] transition-transform duration-700" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
