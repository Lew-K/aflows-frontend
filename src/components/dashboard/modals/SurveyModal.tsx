import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/apiFetch';

interface SurveyModalProps {
  businessId: string;
  onClose: () => void;
}

const FEATURE_OPTIONS = ['Sales & Receipts', 'Inventory', 'Analytics', 'Customer CRM', 'File Uploads'];
const NPS_OPTIONS = ['Yes, definitely', 'Maybe', 'Probably not'];

export const SurveyModal = ({ businessId, onClose }: SurveyModalProps) => {
  const [step, setStep] = useState(0);
  const [topFeature, setTopFeature] = useState('');
  const [friction, setFriction] = useState('');
  const [nps, setNps] = useState('');
  const [wishlist, setWishlist] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await apiFetch('https://api.aflows.uk/api/v1/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, topFeature, friction, nps, wishlist }),
      });
    } catch {}
    setSubmitting(false);
    onClose();
  };

  const steps = [
    {
      question: "Which feature did you find most useful during your trial?",
      content: (
        <div className="grid grid-cols-2 gap-2 mt-3">
          {FEATURE_OPTIONS.map(f => (
            <button key={f}
              className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${topFeature === f ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'}`}
              onClick={() => setTopFeature(f)}>
              {f}
            </button>
          ))}
        </div>
      ),
      canNext: !!topFeature,
    },
    {
      question: "Would you recommend Aflows to another business owner?",
      content: (
        <div className="flex flex-col gap-2 mt-3">
          {NPS_OPTIONS.map(o => (
            <button key={o}
              className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${nps === o ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'}`}
              onClick={() => setNps(o)}>
              {o}
            </button>
          ))}
        </div>
      ),
      canNext: !!nps,
    },
    {
      question: "Anything you wished Aflows had?",
      subtitle: "Optional — helps us build what matters to you.",
      content: (
        <textarea
          className="w-full mt-3 p-3 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
          rows={3}
          placeholder="E.g. better reports, M-Pesa integration..."
          value={wishlist}
          onChange={e => setWishlist(e.target.value)}
        />
      ),
      canNext: true,
    },
  ];

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl p-6">
        <div className="flex justify-between items-start mb-1">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Quick feedback · {step + 1} of {steps.length}</p>
            <h3 className="text-base font-bold mt-1">{current.question}</h3>
            {current.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{current.subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground ml-4 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {current.content}

        <div className="flex gap-3 mt-5">
          {step > 0 && (
            <Button variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>Back</Button>
          )}
          {step < steps.length - 1 ? (
            <Button className="flex-1" disabled={!current.canNext} onClick={() => setStep(s => s + 1)}>Next</Button>
          ) : (
            <Button className="flex-1" disabled={submitting} onClick={handleSubmit}>
              {submitting ? 'Sending...' : 'Submit Feedback'}
            </Button>
          )}
        </div>

        <button onClick={onClose} className="w-full text-center text-xs text-muted-foreground mt-3 hover:text-foreground">
          Skip — I'll do this later
        </button>
      </div>
    </div>
  );
};
