import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Zap, Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationCenter } from '@/components/NotificationCenter';

export const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      // Updated: Added subtle border-white/5 and saturated backdrop blur
      className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-white/5"
    >
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
          {/* Updated: Logo glow effect */}
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.3)] group-hover:shadow-primary/50 transition-all">
            <Zap className="w-5 h-5 text-primary-foreground fill-current" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground">Aflows</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {['how-it-works', 'faq', 'contact'].map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item)}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors capitalize"
            >
              {item.replace(/-/g, ' ')}
            </button>
          ))}
          
          <div className="h-6 w-[1px] bg-white/10 mx-2" /> {/* Divider */}
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated && <NotificationCenter />}
            {isAuthenticated ? (
              <Button onClick={() => navigate('/dashboard')} variant="hero" className="rounded-full px-6">
                Dashboard
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => scrollToSection('login')}
                  variant="ghost"
                  className="hover:bg-white/5 text-muted-foreground hover:text-foreground"
                >
                  Login
                </Button>
                <Button
                  onClick={() => scrollToSection('register')}
                  variant="hero"
                  className="rounded-full px-6 shadow-[0_0_20px_rgba(45,212,191,0.2)]"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden bg-background/95 backdrop-blur-lg border-b border-white/5 overflow-hidden p-6"
        >
          <div className="flex flex-col gap-5">
            {['how-it-works', 'faq', 'contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className="text-lg font-medium text-muted-foreground text-left capitalize"
              >
                {item.replace(/-/g, ' ')}
              </button>
            ))}
            <div className="pt-4 flex flex-col gap-3">
               <Button onClick={() => scrollToSection('login')} variant="outline" className="w-full py-6">Login</Button>
               <Button onClick={() => scrollToSection('register')} variant="hero" className="w-full py-6">Get Started</Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};
