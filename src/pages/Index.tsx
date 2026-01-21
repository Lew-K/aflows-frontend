import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { LoginSection } from '@/components/landing/LoginSection';
import { RegisterSection } from '@/components/landing/RegisterSection';
import { Footer } from '@/components/landing/Footer';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <FAQSection />
      <ContactSection />
      
      {/* Only show auth sections if not authenticated */}
      {!isAuthenticated && (
        <>
          <LoginSection />
          <RegisterSection />
        </>
      )}
      
      <Footer />
    </div>
  );
};

export default Index;
