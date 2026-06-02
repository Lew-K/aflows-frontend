// src/pages/FAQ.tsx
import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { FAQSection } from '@/components/landing/FAQSection';

const FAQ = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-20"> {/* offset for fixed navbar */}
      <FAQSection />
    </div>
    <Footer />
  </div>
);
export default FAQ;
