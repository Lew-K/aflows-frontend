import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { Footer } from '@/components/landing/Footer';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HowItWorksSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default About;
