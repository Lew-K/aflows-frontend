import React from 'react';
import { Zap } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-background">Aflows</span>
          </div>
          
          <p className="text-background/60 text-sm">
            © {new Date().getFullYear()} Aflows. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
