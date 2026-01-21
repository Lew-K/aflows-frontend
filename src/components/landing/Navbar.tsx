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
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Aflows</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            FAQ
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact
          </button>
          <ThemeToggle />
          {isAuthenticated && <NotificationCenter />}
          {isAuthenticated ? (
            <Button onClick={() => navigate('/dashboard')} variant="hero">
              Dashboard
            </Button>
          ) : (
            <>
              <Button
                onClick={() => scrollToSection('login')}
                variant="ghost"
              >
                Login
              </Button>
              <Button
                onClick={() => scrollToSection('register')}
                variant="hero"
              >
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-background border-b border-border p-4"
        >
          <div className="flex flex-col gap-3">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-left py-2 text-muted-foreground hover:text-foreground"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-left py-2 text-muted-foreground hover:text-foreground"
            >
              FAQ
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-left py-2 text-muted-foreground hover:text-foreground"
            >
              Contact
            </button>
            {isAuthenticated ? (
              <Button onClick={() => navigate('/dashboard')} variant="hero" className="w-full">
                Dashboard
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => scrollToSection('login')}
                  variant="outline"
                  className="w-full"
                >
                  Login
                </Button>
                <Button
                  onClick={() => scrollToSection('register')}
                  variant="hero"
                  className="w-full"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};
