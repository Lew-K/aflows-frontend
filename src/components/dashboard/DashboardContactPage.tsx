import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

export const DashboardContactPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Message sent successfully! Our team will respond within 24 hours.');
    setFormData({ subject: '', message: '' });
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Contact Support</h1>
        <p className="text-muted-foreground">Get help from our support team</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Send a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="What do you need help with?"
                    required
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your issue or question in detail..."
                    rows={6}
                    required
                    className="mt-2"
                  />
                </div>

                <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Email Support</h3>
                  <p className="text-muted-foreground">support@aflows.uk</p>
                  <p className="text-sm text-muted-foreground mt-1">We respond within 24 hours</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Phone Support</h3>
                  <p className="text-muted-foreground">+254 700 000 000</p>
                  <p className="text-sm text-muted-foreground mt-1">Mon-Fri, 9am-6pm EAT</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Office Location</h3>
                  <p className="text-muted-foreground">Nairobi, Kenya</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="font-medium text-foreground mb-1">How do I generate a receipt?</p>
                  <p className="text-sm text-muted-foreground">Go to Sales → Record a sale → Receipt is auto-generated</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="font-medium text-foreground mb-1">What file types can I upload?</p>
                  <p className="text-sm text-muted-foreground">PDF, JPG, PNG, DOC, XLS and more</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="font-medium text-foreground mb-1">How do I export my data?</p>
                  <p className="text-sm text-muted-foreground">Contact support for data export requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
