import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Zap, Menu, X, LayoutDashboard } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Logic for changing navbar background on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled 
          ? 'bg-background/80 backdrop-blur-xl border-b border-white/5 py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => navigate('/')}
        >
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5 text-black fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">Aflows</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {['how-it-works', 'faq', 'contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors capitalize"
              >
                {item.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 border-l border-white/10 pl-6">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button 
                onClick={() => navigate('/dashboard')} 
                variant="hero" 
                size="sm"
                className="rounded-full px-5"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => scrollToSection('login')}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-primary transition-colors"
                >
                  Log In
                </Button>
                <Button
                  onClick={() => scrollToSection('register')}
                  variant="hero"
                  size="sm"
                  className="rounded-full px-6 font-bold text-black shadow-lg shadow-primary/10"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Action Bar: THE FIX */}
        <div className="flex md:hidden items-center gap-3">
          <ThemeToggle />
          
          {!isAuthenticated && (
            <button 
              onClick={() => scrollToSection('login')}
              className="text-sm font-bold text-primary px-2 py-1 active:scale-95 transition-transform"
            >
              Log In
            </button>
          )}

          <button
            className="p-2 text-white bg-white/5 rounded-lg border border-white/10 active:bg-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-2xl border-b border-white/5"
          >
            <div className="flex flex-col gap-4 p-6 pt-2">
              {['how-it-works', 'faq', 'contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="text-lg font-medium text-muted-foreground text-left py-2 border-b border-white/5"
                >
                  {item.replace(/-/g, ' ')}
                </button>
              ))}
              
              {!isAuthenticated ? (
                <Button
                  onClick={() => scrollToSection('register')}
                  variant="hero"
                  className="w-full py-6 text-black font-bold mt-2"
                >
                  Create Free Account
                </Button>
              ) : (
                <Button onClick={() => navigate('/dashboard')} variant="hero" className="w-full py-6">
                  Dashboard
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
