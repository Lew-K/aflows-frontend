import React from 'react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What is Aflows?',
    answer: 'Aflows is a comprehensive business automation platform that helps you track sales, generate receipts, manage documents, and gain insights through powerful analytics — all in one place.',
  },
  {
    question: 'How do I get started?',
    answer: 'Simply register your business using our quick signup form. Once registered, you can immediately log in and start using all features including sales tracking, file uploads, and receipt generation.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use enterprise-grade encryption for all data transmission and storage. Your business information and documents are protected with the highest security standards.',
  },
  {
    question: 'What file types can I upload?',
    answer: 'Aflows supports a wide range of business documents including invoices, receipts, bank statements, M-Pesa statements, contracts, tax documents, and more.',
  },
  {
    question: 'How does receipt generation work?',
    answer: 'When you record a sale in Aflows, the system automatically generates a professional PDF receipt that you can download and share with your customers instantly.',
  },
  {
    question: 'Can I access Aflows on mobile?',
    answer: 'Yes! Aflows is fully responsive and works seamlessly on desktop, tablet, and mobile devices. Manage your business from anywhere.',
  },
];

export const FAQSection = () => {
  return (
    <section id="faq" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-4 block">Support</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know about Aflows and how it simplifies your business operations.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="group bg-card/40 border border-white/5 rounded-2xl px-6 data-[state=open]:border-primary/40 data-[state=open]:bg-primary/5 transition-all duration-300"
              >
                <AccordionTrigger className="text-left font-bold text-white hover:no-underline py-6 text-lg group-hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-base pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
