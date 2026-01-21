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
    answer: 'Aflows supports a wide range of business documents including invoices, receipts, bank statements, M-Pesa statements, contracts, tax documents, and more. You can organize them by category for easy access.',
  },
  {
    question: 'How does receipt generation work?',
    answer: 'When you record a sale in Aflows, the system automatically generates a professional PDF receipt that you can download and share with your customers instantly.',
  },
  {
    question: 'Can I access Aflows on mobile?',
    answer: 'Yes! Aflows is fully responsive and works seamlessly on desktop, tablet, and mobile devices. Manage your business from anywhere.',
  },
  {
    question: 'What payment methods are supported?',
    answer: 'Aflows supports multiple payment method tracking including M-Pesa, bank transfers, cash, and card payments. You can record the payment reference for easy reconciliation.',
  },
];

export const FAQSection = () => {
  return (
    <section id="faq" className="section-padding">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium mb-4 block">FAQ</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find answers to common questions about Aflows and how it can help your business.
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
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/30 transition-colors"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
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
