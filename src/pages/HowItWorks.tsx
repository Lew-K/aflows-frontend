import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { Footer } from '@/components/landing/Footer';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20"> 
        <HowItWorksSection />
      <Footer />
    </div>
  );
};

export default About;
