import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { ContactSection } from '@/components/landing/ContactSection';
import { Footer } from '@/components/landing/Footer';

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20"> {/* offset for fixed navbar */}
        <ContactSection />
      <Footer />
    </div>
  );
};

export default Contact;
