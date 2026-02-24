import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from 'sonner';

export const ContactSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Logic Preserved: Simulate sending message
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Message sent successfully! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
    setIsLoading(false);
  };

  return (
    <section id="contact" className="py-24 bg-background relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-4 block">Get in Touch</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Let's Scale Your Business
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Have questions or need help with Aflows? Our team is ready to assist you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            {[
              { icon: Mail, label: 'Email Us', value: 'support@aflows.uk' },
              { icon: Phone, label: 'Call Us', value: '+254 700 000 000' },
              { icon: MapPin, label: 'Visit Us', value: 'Nairobi, Kenya' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-all duration-300">
                  <item.icon className="w-6 h-6 text-primary group-hover:text-black transition-colors" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-primary/60 uppercase tracking-widest mb-1">{item.label}</h3>
                  <p className="text-xl font-semibold text-white">{item.value}</p>
                </div>
              </motion.div>
            ))}

            <div className="p-8 rounded-[2rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/10">
              <MessageSquare className="w-8 h-8 text-primary mb-4" />
              <h4 className="text-white font-bold text-lg mb-1">Live Support</h4>
              <p className="text-muted-foreground text-sm">Our typical response time is under 2 hours during business hours.</p>
            </div>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card/50 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-white/5 shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contact-name" className="text-white/70 ml-1">Your Name</Label>
                  <Input
                    id="contact-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    required
                    className="h-12 bg-white/5 border-white/10 focus:border-primary transition-all rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="text-white/70 ml-1">Email Address</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                    className="h-12 bg-white/5 border-white/10 focus:border-primary transition-all rounded-xl"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact-message" className="text-white/70 ml-1">Message</Label>
                <Textarea
                  id="contact-message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help you?"
                  rows={5}
                  required
                  className="bg-white/5 border-white/10 focus:border-primary transition-all rounded-xl resize-none"
                />
              </div>

              <Button type="submit" variant="hero" className="w-full h-14 rounded-xl text-black font-bold text-lg" disabled={isLoading}>
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <div className="flex items-center gap-2">
                    Send Message
                    <Send className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
