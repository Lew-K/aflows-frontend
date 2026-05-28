// HeroSection.tsx

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  BarChart3,
  FileUp,
  Receipt,
  Zap,
  ShoppingCart,
  Package,
  Users,
} from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';
import { useNavigate } from 'react-router-dom';

export const HeroSection = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const features = [
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      desc: 'Monitor revenue, sales trends and business insights live',
    },
    {
      icon: Receipt,
      title: 'Auto Receipts',
      desc: 'Generate branded PDF receipts with your logo instantly',
    },
    {
      icon: ShoppingCart,
      title: 'Sales Tracking',
      desc: 'Record every sale with payment method and customer details',
    },
    {
      icon: Package,
      title: 'Inventory Management',
      desc: 'Track stock levels and manage your product catalogue',
    },
    {
      icon: Users,
      title: 'Customer Management',
      desc: 'Build customer profiles and track purchase history',
    },
    {
      icon: FileUp,
      title: 'Document Vault',
      desc: 'Upload and organize invoices, statements and business files',
    },
  ];

  return (
    <section className="relative min-h-screen min-h-[100svh] overflow-hidden bg-background pt-36 pb-24">

      {/* ── Background glows ─────────────────────────────────────────────────
          Using explicit color-stop classes so they inherit the current theme's
          --primary and --accent tokens correctly in both light and dark mode.
          pointer-events-none ensures they never block clicks.
      ────────────────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
        <div className="absolute top-[-10%] left-[-20%] h-[60%] w-[70%]
                        rounded-full bg-primary/10
                        blur-3xl md:blur-[120px]
                        transition-colors duration-300" />
        <div className="absolute bottom-[5%] right-[-20%] h-[50%] w-[60%]
                        rounded-full bg-accent/5
                        blur-3xl md:blur-[120px]
                        transition-colors duration-300" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">

          {/* ── Badge ──────────────────────────────────────────────────────── */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2
                             rounded-full border border-primary/20 bg-primary/10
                             px-4 py-1.5
                             text-xs font-bold uppercase tracking-[0.18em] text-primary
                             transition-colors duration-300">
              <Zap className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              Automate Your Business Today
            </span>
          </motion.div>

          {/* ── Headline ───────────────────────────────────────────────────── */}
          <motion.h1
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8
                       text-5xl font-extrabold leading-[1.06] tracking-[-0.04em] text-foreground
                       sm:text-6xl lg:text-7xl
                       [text-wrap:balance]"
          >
            Streamline Your Business with{' '}
            <span
              className="bg-gradient-to-r from-primary via-emerald-400 to-primary
                         bg-clip-text text-primary
                         supports-[background-clip:text]:text-transparent
                         transition-colors duration-300"
            >
              Smart Automation
            </span>
          </motion.h1>

          {/* ── Subtitle ───────────────────────────────────────────────────── */}
          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mb-12 max-w-2xl
                       text-lg leading-relaxed text-muted-foreground
                       md:text-xl
                       transition-colors duration-300"
          >
            One platform. Every tool your business needs. No complexity, no clutter.
          </motion.p>

          {/* ── CTA buttons ────────────────────────────────────────────────── */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mb-20 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button
              onClick={() => navigate('/register')}
              variant="hero"
              size="xl"
              className="group h-14 w-full rounded-full px-10 text-lg
                         shadow-lg shadow-primary/25
                         transition-all duration-200
                         hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]
                         active:scale-[0.98]
                         sm:w-auto"
            >
              Start Free Today
              <ArrowRight
                className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Button>

            <Button
              onClick={() => navigate('/about')}
              variant="outline"
              size="xl"
              className="h-14 w-full rounded-full px-10 text-lg
                         border-border
                         bg-background/60 backdrop-blur-sm
                         text-foreground
                         transition-all duration-200
                         hover:bg-muted/60 hover:border-border/80 hover:scale-[1.01]
                         active:scale-[0.99]
                         sm:w-auto"
            >
              See How It Works
            </Button>
          </motion.div>

          {/* ── Feature cards ──────────────────────────────────────────────── */}
          {/*
            Semantic: rendered as <ul>/<li> so screen readers understand
            this is a list of features, not just a visual grid.
            Cards are non-interactive (no onClick), so no role="button" needed.
          */}
          <ul
            className="mb-24 grid list-none grid-cols-1 gap-4 p-0
                       sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Platform features"
          >
            {features.map((feature, i) => (
              <motion.li
                key={feature.title}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
                whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group rounded-3xl border border-border
                           bg-card
                           p-7 text-left
                           shadow-sm
                           transition-[transform,border-color,background-color,box-shadow]
                           duration-300
                           hover:-translate-y-1.5
                           hover:border-primary/30
                           hover:bg-muted/40
                           hover:shadow-lg hover:shadow-primary/8"
              >
                {/* Icon container */}
                <div className="mb-5 flex h-12 w-12 items-center justify-center
                                rounded-2xl bg-primary/10
                                ring-1 ring-primary/10
                                transition-[transform,background-color] duration-300
                                group-hover:scale-110 group-hover:bg-primary/15
                                group-hover:ring-primary/20">
                  <feature.icon
                    className="h-6 w-6 text-primary"
                    aria-hidden="true"
                  />
                </div>

                <h3 className="mb-2.5 text-[17px] font-bold leading-snug text-foreground">
                  {feature.title}
                </h3>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.desc}
                </p>
              </motion.li>
            ))}
          </ul>

          {/* ── Dashboard preview ──────────────────────────────────────────── */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto max-w-6xl"
          >
            {/* Ambient glow behind the image — theme-aware */}
            <div
              className="absolute -inset-3 rounded-[2.5rem]
                         bg-gradient-to-r from-primary/20 to-emerald-400/20
                         blur-3xl opacity-50
                         transition-opacity duration-500
                         pointer-events-none"
              aria-hidden="true"
            />

            {/* Image card */}
            <div className="relative overflow-hidden rounded-[2rem]
                            border border-border/60
                            bg-card
                            shadow-2xl shadow-black/10
                            dark:shadow-black/40
                            ring-1 ring-black/5 dark:ring-white/5
                            transition-colors duration-300">
              {/*
                width/height are set to prevent CLS (Cumulative Layout Shift).
                These are the intrinsic proportions of a typical 16:9 dashboard screenshot.
                Adjust to match your actual heroBg dimensions.
                loading="eager" is correct here — this is above the fold.
              */}
              <img
                src={heroBg}
                alt="Aflows dashboard — real-time analytics, receipts, and sales management"
                width={1920}
                height={1080}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="h-auto w-full
                           transition-transform duration-700
                           md:hover:scale-[1.015]"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
