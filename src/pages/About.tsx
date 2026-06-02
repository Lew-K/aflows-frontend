import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 container mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-6">
          About Aflows
        </h1>

        <p className="text-muted-foreground max-w-3xl">
          Aflows helps small businesses manage sales, inventory,
          customers, analytics, staff, and growth from a single platform.
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default About;



// import React from 'react';
// import { Navbar } from '@/components/landing/Navbar';
// import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
// import { FAQSection } from '@/components/landing/FAQSection';
// import { ContactSection } from '@/components/landing/ContactSection';
// import { Footer } from '@/components/landing/Footer';

// const About = () => {
//   return (
//     <div className="min-h-screen bg-background">
//       <Navbar />
//       <HowItWorksSection />
//       <FAQSection />
//       <ContactSection />
//       <Footer />
//     </div>
//   );
// };

// export default About;
