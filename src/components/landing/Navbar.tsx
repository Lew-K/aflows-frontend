// Navbar.tsx
import { ThemeToggle } from '@/components/ThemeToggle';
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Menu,
  X,
  ChevronDown,
  BarChart3,
  Receipt,
  ShoppingCart,
  Package,
  Users,
  FileUp,
  Zap,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  // Ref to manage hover intent — prevents flicker when moving
  // cursor from trigger button into the mega menu panel
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Scroll listener (unchanged logic) ───────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ─── Lock body scroll when mobile drawer is open ──────────────────────────
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // ─── Close mobile menu on route change ───────────────────────────────────
  useEffect(() => {
    setMobileOpen(false);
    setMegaMenuOpen(false);
  }, [location.pathname]);

  // ─── Mega menu hover helpers (delayed close prevents flicker) ────────────
  const handleMegaEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaMenuOpen(true);
  };

  const handleMegaLeave = () => {
    closeTimer.current = setTimeout(() => setMegaMenuOpen(false), 120);
  };

  // ─── scrollToSection (unchanged logic) ───────────────────────────────────
  const scrollToSection = (id: string) => {
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileOpen(false);
    setMegaMenuOpen(false);
  };

  // ─── Data (unchanged) ────────────────────────────────────────────────────
  const features = [
    { title: 'Analytics',  desc: 'Track revenue and performance live',       icon: BarChart3,   id: 'analytics'  },
    { title: 'Receipts',   desc: 'Generate branded receipts instantly',       icon: Receipt,     id: 'receipts'   },
    { title: 'Sales',      desc: 'Manage sales and transactions',             icon: ShoppingCart,id: 'sales'      },
    { title: 'Inventory',  desc: 'Monitor products and stock levels',         icon: Package,     id: 'inventory'  },
    { title: 'Customers',  desc: 'Build customer relationships',              icon: Users,       id: 'customers'  },
    { title: 'Documents',  desc: 'Store invoices and business files',         icon: FileUp,      id: 'documents'  },
  ];

  const navLinks = [
    { label: 'Features', megaMenu: true },
    { label: 'About',    action: () => navigate('/about') },
    { label: 'Pricing',  action: () => scrollToSection('pricing') },
    { label: 'Contact',  action: () => scrollToSection('contact') },
  ];

  // Determine active link for highlight indicator
  const isActive = (label: string) => {
    if (label === 'About' && location.pathname === '/about') return true;
    if (label === 'Features' && location.pathname === '/') return true;
    return false;
  };

  return (
    <>
      {/* ─────────────────────────────── HEADER ──────────────────────────── */}
      <header
        className={[
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          isScrolled
            ? 'border-b border-border/60 bg-background/80 backdrop-blur-xl shadow-sm'
            : 'bg-transparent',
        ].join(' ')}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-18 items-center justify-between gap-4 py-3">

            {/* ── Logo ─────────────────────────────────────────────────── */}
            <button
              onClick={() => navigate('/')}
              aria-label="Aflows — go to homepage"
              className="flex shrink-0 items-center gap-3 rounded-xl p-1 outline-none
                         focus-visible:ring-2 focus-visible:ring-primary/60
                         transition-opacity duration-200 hover:opacity-80"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl
                              bg-primary text-primary-foreground
                              shadow-lg shadow-primary/25
                              transition-transform duration-200 hover:scale-105">
                <Zap className="h-5 w-5 fill-current" aria-hidden="true" />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[17px] font-extrabold tracking-tight text-foreground">
                  Aflows
                </span>
                <span className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                  Business Automation
                </span>
              </div>
            </button>

            {/* ── Desktop nav ──────────────────────────────────────────── */}
            <nav
              className="hidden items-center gap-1 lg:flex"
              aria-label="Main navigation"
            >
              {navLinks.map((item) => {
                if (item.megaMenu) {
                  return (
                    <div
                      key={item.label}
                      ref={megaMenuRef}
                      className="relative"
                      onMouseEnter={handleMegaEnter}
                      onMouseLeave={handleMegaLeave}
                    >
                      <button
                        aria-expanded={megaMenuOpen}
                        aria-haspopup="true"
                        className={[
                          'flex items-center gap-1.5 rounded-full px-4 py-2',
                          'text-sm font-medium transition-colors duration-150 outline-none',
                          'focus-visible:ring-2 focus-visible:ring-primary/60',
                          megaMenuOpen
                            ? 'bg-muted text-foreground'
                            : 'text-foreground/80 hover:bg-muted hover:text-foreground',
                        ].join(' ')}
                      >
                        {item.label}
                        <ChevronDown
                          className={[
                            'h-3.5 w-3.5 transition-transform duration-200',
                            megaMenuOpen ? 'rotate-180' : '',
                          ].join(' ')}
                          aria-hidden="true"
                        />
                      </button>

                      <AnimatePresence>
                        {megaMenuOpen && (
                          // Invisible bridge fills the gap between trigger and panel,
                          // preventing accidental close when moving the cursor down.
                          <div
                            onMouseEnter={handleMegaEnter}
                            onMouseLeave={handleMegaLeave}
                            className="absolute left-1/2 top-full -translate-x-1/2 pt-2 w-[760px]"
                            style={{ maxWidth: 'min(760px, calc(100vw - 2rem))' }}
                          >
                            <motion.div
                              initial={shouldReduceMotion ? false : { opacity: 0, y: 6, scale: 0.98 }}
                              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
                              exit={shouldReduceMotion ? {} : { opacity: 0, y: 6, scale: 0.98 }}
                              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden rounded-3xl border border-border
                                         bg-background/95 p-5 shadow-2xl
                                         backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/5"
                            >
                              <div className="grid grid-cols-2 gap-2">
                                {features.map((feature) => (
                                  <button
                                    key={feature.title}
                                    onClick={() => scrollToSection(feature.id)}
                                    className="group flex items-start gap-4 rounded-2xl
                                               border border-transparent p-4 text-left
                                               transition-all duration-200 outline-none
                                               hover:border-primary/20 hover:bg-muted/60
                                               focus-visible:ring-2 focus-visible:ring-primary/50"
                                  >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center
                                                    rounded-xl bg-primary/10
                                                    transition-transform duration-200
                                                    group-hover:scale-110 group-hover:bg-primary/15">
                                      <feature.icon
                                        className="h-5 w-5 text-primary"
                                        aria-hidden="true"
                                      />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="mb-0.5 text-sm font-semibold text-foreground">
                                        {feature.title}
                                      </p>
                                      <p className="text-sm leading-relaxed text-muted-foreground">
                                        {feature.desc}
                                      </p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className={[
                      'relative rounded-full px-4 py-2 text-sm font-medium outline-none',
                      'transition-colors duration-150',
                      'focus-visible:ring-2 focus-visible:ring-primary/60',
                      isActive(item.label)
                        ? 'text-foreground'
                        : 'text-foreground/80 hover:bg-muted hover:text-foreground',
                    ].join(' ')}
                  >
                    {item.label}
                    {/* Active dot indicator */}
                    {isActive(item.label) && (
                      <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2
                                       rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* ── Desktop CTA ──────────────────────────────────────────── */}
            <div className="hidden items-center gap-2 lg:flex">
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="rounded-full px-5 text-sm font-medium
                           text-foreground/80 hover:text-foreground hover:bg-muted
                           transition-colors duration-150"
              >
                Sign In
              </Button>

              <ThemeToggle />
              
              <Button
                variant="hero"
                onClick={() => navigate('/register')}
                className="h-10 rounded-full px-5 text-sm font-semibold
                           shadow-lg shadow-primary/20
                           transition-all duration-200 hover:shadow-primary/30 hover:scale-[1.02]
                           active:scale-[0.98]"
              >
                Start Free
              </Button>
            </div>

            {/* ── Mobile toggle ─────────────────────────────────────────── */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="flex h-10 w-10 items-center justify-center rounded-xl
                         border border-border bg-background/80
                         text-foreground transition-colors duration-150
                         hover:bg-muted outline-none
                         focus-visible:ring-2 focus-visible:ring-primary/60
                         lg:hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span
                    key="close"
                    initial={shouldReduceMotion ? false : { opacity: 0, rotate: -90 }}
                    animate={shouldReduceMotion ? {} : { opacity: 1, rotate: 0 }}
                    exit={shouldReduceMotion ? {} : { opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={shouldReduceMotion ? false : { opacity: 0, rotate: 90 }}
                    animate={shouldReduceMotion ? {} : { opacity: 1, rotate: 0 }}
                    exit={shouldReduceMotion ? {} : { opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

          </div>
        </div>
      </header>

      {/* ─────────────────────────────── MOBILE MENU ─────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={shouldReduceMotion ? {} : { opacity: 1 }}
              exit={shouldReduceMotion ? {} : { opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={shouldReduceMotion ? false : { x: '100%' }}
              animate={shouldReduceMotion ? {} : { x: 0 }}
              exit={shouldReduceMotion ? {} : { x: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 240 }}
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col
                         border-l border-border bg-background p-5 shadow-2xl lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* Drawer header */}
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl
                                  bg-primary text-primary-foreground">
                    <Zap className="h-4.5 w-4.5 fill-current" aria-hidden="true" />
                  </div>
                  <span className="text-base font-extrabold tracking-tight text-foreground">
                    Aflows
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <button
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close menu"
                    className="flex h-9 w-9 items-center justify-center rounded-xl
                               border border-border bg-muted/60
                               text-foreground transition-colors hover:bg-muted
                               outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    <X className="h-4.5 w-4.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Scrollable content */}
              <div className="flex flex-1 flex-col overflow-y-auto">
                {/* Features section */}
                <div className="space-y-1">
                  <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Features
                  </p>
                  {features.map((feature) => (
                    <button
                      key={feature.title}
                      onClick={() => scrollToSection(feature.id)}
                      className="flex w-full items-center gap-4 rounded-2xl p-3.5
                                 text-left transition-colors duration-150
                                 hover:bg-muted outline-none
                                 focus-visible:ring-2 focus-visible:ring-primary/50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center
                                      rounded-xl bg-primary/10">
                        <feature.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {feature.title}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {feature.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Secondary links */}
                <div className="mt-6 space-y-0.5 border-t border-border pt-6">
                  {[
                    { label: 'About',   action: () => { navigate('/about'); setMobileOpen(false); } },
                    { label: 'Pricing', action: () => scrollToSection('pricing') },
                    { label: 'Contact', action: () => scrollToSection('contact') },
                  ].map((link) => (
                    <button
                      key={link.label}
                      onClick={link.action}
                      className={[
                        'w-full rounded-xl px-4 py-3 text-left text-sm font-medium',
                        'transition-colors duration-150 outline-none',
                        'hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary/50',
                        isActive(link.label)
                          ? 'text-foreground font-semibold'
                          : 'text-foreground/80',
                      ].join(' ')}
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA buttons */}
              <div className="mt-6 flex flex-col gap-2.5 border-t border-border pt-5">
                <Button
                  variant="outline"
                  onClick={() => { navigate('/login'); setMobileOpen(false); }}
                  className="h-12 rounded-full text-sm font-medium
                             border-border hover:bg-muted transition-colors duration-150"
                >
                  Sign In
                </Button>
                <Button
                  variant="hero"
                  onClick={() => { navigate('/register'); setMobileOpen(false); }}
                  className="h-12 rounded-full text-sm font-semibold
                             shadow-lg shadow-primary/20
                             transition-all duration-200 hover:shadow-primary/30
                             active:scale-[0.98]"
                >
                  Start Free
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
