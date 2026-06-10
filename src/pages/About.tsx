import React from 'react';
import { Lightbulb, BarChart3, TrendingUp } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

const VALUES = [
  {
    title: 'Simplicity',
    description:
      'Software should make work easier, not more complicated.',
    icon: Lightbulb,
  },
  {
    title: 'Clarity',
    description:
      'Business decisions are better when backed by accurate data.',
    icon: BarChart3,
  },
  {
    title: 'Growth',
    description:
      'We build tools that help businesses scale with confidence.',
    icon: TrendingUp,
  },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20">
        <div className="max-w-5xl mx-auto px-6 py-16 space-y-12 md:space-y-16">
          {/* Hero */}
          <div className="text-center space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              About Aflows
            </p>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black">
              Helping growing businesses spend less time managing records and more time growing.
            </h1>

            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Aflows brings sales, inventory, customers, and insights together in one place.
            </p>
          </div>

          {/* Why We Built Aflows */}
          <div className="rounded-2xl border border-border p-8 md:p-10">
            <div className="space-y-6 max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                Why We Built Aflows
              </p>

              <p className="text-muted-foreground leading-8">
                Many businesses rely on notebooks, spreadsheets,WhatsApp, 
                and disconnected tools to run daily operations.As they 
                grow, keeping track of sales, inventory, customers,
                and performance becomes increasingly difficult.
              </p>

              <p className="text-muted-foreground leading-8">
                Information becomes scattered, making it harder to
                understand what's happening in the business and
                where improvements are needed.
              </p>

              <p className="text-muted-foreground leading-8">
                We built Aflows to bring everything together in one place,
                helping business owners make informed 
                decisions with confidence.
              </p>
            </div>
          </div>

          {/* Mission */}
          <div className="rounded-2xl border border-border p-8 md:p-10">
            <div className="space-y-4 max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                Our Mission
              </p>

              <h2 className="text-xl md:text-2xl font-bold">
                Making business insights accessible to every business.
              </h2>

              <p className="text-muted-foreground leading-8">
                WWe believe every business owner deserves clear insights and powerful
                tools without the complexity or cost of enterprise software.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                What We Value
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {VALUES.map((value) => {
                const Icon = value.icon;

                return (
                  <div
                    key={value.title}
                    className="rounded-2xl border border-border p-6"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>

                    <h3 className="font-bold text-lg mb-2">
                      {value.title}
                    </h3>

                    <p className="text-sm text-muted-foreground leading-7">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;

// import React from 'react';
// import { Navbar } from '@/components/landing/Navbar';
// import { Footer } from '@/components/landing/Footer';

// const About = () => {
//   return (
//     <div className="min-h-screen bg-background">
//       <Navbar />

//       <div className="pt-20 container mx-auto px-6 py-16">
//         <h1 className="text-4xl font-bold mb-6">
//           About Aflows
//         </h1>

//         <p className="text-muted-foreground max-w-3xl">
//           Aflows helps small businesses manage sales, inventory,
//           customers, analytics, staff, and growth from a single platform.
//         </p>
//       </div>

//       <Footer />
//     </div>
//   );
// };

// export default About;
