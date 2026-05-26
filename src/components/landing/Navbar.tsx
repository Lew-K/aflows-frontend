// Navbar.tsx

import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
      return;
    }

    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }

    setMobileOpen(false);
    setMegaMenuOpen(false);
  };

  const features = [
    {
      title: 'Analytics',
      desc: 'Track revenue and performance live',
      icon: BarChart3,
      id: 'analytics',
    },
    {
      title: 'Receipts',
      desc: 'Generate branded receipts instantly',
      icon: Receipt,
      id: 'receipts',
    },
    {
      title: 'Sales',
      desc: 'Manage sales and transactions',
      icon: ShoppingCart,
      id: 'sales',
    },
    {
      title: 'Inventory',
      desc: 'Monitor products and stock levels',
      icon: Package,
      id: 'inventory',
    },
    {
      title: 'Customers',
      desc: 'Build customer relationships',
      icon: Users,
      id: 'customers',
    },
    {
      title: 'Documents',
      desc: 'Store invoices and business files',
      icon: FileUp,
      id: 'documents',
    },
  ];

  const navLinks = [
    {
      label: 'Features',
      megaMenu: true,
    },
    {
      label: 'About',
      action: () => navigate('/about'),
    },
    {
      label: 'Pricing',
      action: () => scrollToSection('pricing'),
    },
    {
      label: 'Contact',
      action: () => scrollToSection('contact'),
    },
  ];

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'border-b border-border/60 bg-background/80 backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => navigate('/')}
              className="flex shrink-0 items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Zap className="h-5 w-5 fill-current" />
              </div>

              <div className="flex flex-col items-start">
                <span className="text-lg font-extrabold tracking-tight text-foreground">
                  Aflows
                </span>

                <span className="text-xs font-medium text-muted-foreground">
                  Business Automation
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-2 lg:flex">
              {navLinks.map((item) => {
                if (item.megaMenu) {
                  return (
                    <div
                      key={item.label}
                      className="relative"
                      onMouseEnter={() => setMegaMenuOpen(true)}
                      onMouseLeave={() => setMegaMenuOpen(false)}
                    >
                      <button
                        className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        {item.label}

                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            megaMenuOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {megaMenuOpen && (
                          <motion.div
                            initial={
                              shouldReduceMotion
                                ? false
                                : {
                                    opacity: 0,
                                    y: 10,
                                  }
                            }
                            animate={
                              shouldReduceMotion
                                ? {}
                                : {
                                    opacity: 1,
                                    y: 0,
                                  }
                            }
                            exit={
                              shouldReduceMotion
                                ? {}
                                : {
                                    opacity: 0,
                                    y: 10,
                                  }
                            }
                            transition={{ duration: 0.2 }}
                            className="absolute left-1/2 top-full mt-4 w-[760px] -translate-x-1/2 overflow-hidden rounded-3xl border border-border bg-background/95 p-6 shadow-2xl backdrop-blur-xl"
                          >
                            <div className="grid grid-cols-2 gap-4">
                              {features.map((feature) => (
                                <button
                                  key={feature.title}
                                  onClick={() =>
                                    scrollToSection(feature.id)
                                  }
                                  className="group flex items-start gap-4 rounded-2xl border border-transparent p-4 text-left transition-all hover:border-primary/20 hover:bg-muted/50"
                                >
                                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                                    <feature.icon className="h-6 w-6 text-primary" />
                                  </div>

                                  <div>
                                    <h3 className="mb-1 text-sm font-semibold text-foreground">
                                      {feature.title}
                                    </h3>

                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                      {feature.desc}
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden items-center gap-3 lg:flex">
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="rounded-full px-5 text-foreground hover:bg-muted"
              >
                Sign In
              </Button>

              <Button
                variant="hero"
                onClick={() => navigate('/register')}
                className="h-11 rounded-full px-6 shadow-lg shadow-primary/20"
              >
                Start Free
              </Button>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background text-foreground lg:hidden"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: 0,
                    }
              }
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      opacity: 1,
                    }
              }
              exit={
                shouldReduceMotion
                  ? {}
                  : {
                      opacity: 0,
                    }
              }
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      x: '100%',
                    }
              }
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      x: 0,
                    }
              }
              exit={
                shouldReduceMotion
                  ? {}
                  : {
                      x: '100%',
                    }
              }
              transition={{ type: 'spring', damping: 24, stiffness: 240 }}
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-border bg-background p-6 shadow-2xl lg:hidden"
            >
              <div className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <Zap className="h-5 w-5 fill-current" />
                  </div>

                  <span className="text-lg font-bold text-foreground">
                    Aflows
                  </span>
                </div>

                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border"
                >
                  <X className="h-5 w-5 text-foreground" />
                </button>
              </div>

              <div className="flex flex-1 flex-col">
                <div className="space-y-2">
                  <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Features
                  </p>

                  {features.map((feature) => (
                    <button
                      key={feature.title}
                      onClick={() => scrollToSection(feature.id)}
                      className="flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-colors hover:bg-muted"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-foreground">
                          {feature.title}
                        </h3>

                        <p className="text-sm text-muted-foreground">
                          {feature.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-8 space-y-2 border-t border-border pt-8">
                  <button
                    onClick={() => {
                      navigate('/about');
                      setMobileOpen(false);
                    }}
                    className="w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    About
                  </button>

                  <button
                    onClick={() => scrollToSection('pricing')}
                    className="w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    Pricing
                  </button>

                  <button
                    onClick={() => scrollToSection('contact')}
                    className="w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    Contact
                  </button>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate('/login');
                    setMobileOpen(false);
                  }}
                  className="h-12 rounded-full"
                >
                  Sign In
                </Button>

                <Button
                  variant="hero"
                  onClick={() => {
                    navigate('/register');
                    setMobileOpen(false);
                  }}
                  className="h-12 rounded-full shadow-lg shadow-primary/20"
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


// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Button } from '@/components/ui/button';
// import { useAuth } from '@/contexts/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import { Zap, Menu, X, LayoutDashboard } from 'lucide-react';
// import { ThemeToggle } from '@/components/ThemeToggle';

// export const Navbar = () => {
//   const { isAuthenticated } = useAuth();
//   const navigate = useNavigate();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);

//   // Logic for changing navbar background on scroll
//   useEffect(() => {
//     const handleScroll = () => setScrolled(window.scrollY > 20);
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);



//   return (
//     <motion.nav
//       initial={{ y: -100 }}
//       animate={{ y: 0 }}
//       className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
//         scrolled 
//           ? 'bg-background/80 backdrop-blur-xl border-b border-white/5 py-3' 
//           : 'bg-transparent py-5'
//       }`}
//     >
//       <div className="container mx-auto px-6 flex items-center justify-between">
//         {/* Logo */}
//         <div 
//           className="flex items-center gap-2 cursor-pointer group" 
//           onClick={() => navigate('/')}
//         >
//           <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
//             <Zap className="w-5 h-5 text-black fill-current" />
//           </div>
//           <span className="text-xl font-bold tracking-tighter text-white">Aflows</span>
//         </div>

//         {/* Desktop Navigation */}
//         <div className="hidden md:flex items-center gap-8">
//           <div className="flex items-center gap-6">
//             <button
//               onClick={() => navigate('/about')}
//               className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
//             >
//               About
//             </button>
//           </div>
          
//           <div className="flex items-center gap-3 border-l border-white/10 pl-6">
//             <ThemeToggle />
//             {isAuthenticated ? (
//               <Button 
//                 onClick={() => navigate('/dashboard')} 
//                 variant="hero" 
//                 size="sm"
//                 className="rounded-full px-5"
//               >
//                 <LayoutDashboard className="w-4 h-4 mr-2" />
//                 Dashboard
//               </Button>
//             ) : (
//               <div className="flex items-center gap-2">
//                 <Button
//                   onClick={() => navigate('/login')}
//                   variant="ghost"
//                   size="sm"
//                   className="text-white hover:text-primary transition-colors"
//                 >
//                   Log In
//                 </Button>
//                 <Button
//                   onClick={() => navigate('/register')}
//                   variant="hero"
//                   size="sm"
//                   className="rounded-full px-6 font-bold text-black shadow-lg shadow-primary/10"
//                 >
//                   Get Started
//                 </Button>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Mobile Action Bar: THE FIX */}
//         <div className="flex md:hidden items-center gap-3">
//           <ThemeToggle />
          
//           {!isAuthenticated && (
//             <button 
//               onClick={() => navigate('/login')}
//               className="text-sm font-bold text-primary px-2 py-1 active:scale-95 transition-transform"
//             >
//               Log In
//             </button>
//           )}

//           <button
//             className="p-2 text-white bg-white/5 rounded-lg border border-white/10 active:bg-white/10"
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//           >
//             {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//           </button>
//         </div>
//       </div>

//       {/* Mobile Menu Overlay */}
//       <AnimatePresence>
//         {mobileMenuOpen && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//             className="md:hidden bg-background/95 backdrop-blur-2xl border-b border-white/5"
//           >
//             <div className="flex flex-col gap-4 p-6 pt-2">
//               <button
//                 onClick={() => { navigate('/about'); setMobileMenuOpen(false); }}
//                 className="text-lg font-medium text-muted-foreground text-left py-2 border-b border-white/5"
//               >
//                 About
//               </button>
              
//               {!isAuthenticated ? (
//                 <Button
//                   onClick={() => navigate('/register')}
//                   variant="hero"
//                   className="w-full py-6 text-black font-bold mt-2"
//                 >
//                   Create Free Account
//                 </Button>
//               ) : (
//                 <Button onClick={() => navigate('/dashboard')} variant="hero" className="w-full py-6">
//                   Dashboard
//                 </Button>
//               )}
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.nav>
//   );
// };
