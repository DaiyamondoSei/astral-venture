
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Lightbulb, Send } from 'lucide-react';

interface ReflectionFormInputProps {
  reflection: string;
  setReflection: (value: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const ReflectionFormInput = ({ 
  reflection, 
  setReflection, 
  isSubmitting, 
  onSubmit 
}: ReflectionFormInputProps) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="mb-4">
        <Textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Share your energy work, meditative insights, or consciousness expansion experiences..."
          className="min-h-[120px] bg-black/30 border-quantum-500/30 placeholder:text-white/40"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center text-xs text-white/60">
          <Lightbulb size={14} className="mr-1 text-primary/70" />
          <span>Deeper reflections yield more energy points</span>
        </div>
        
        <Button 
          type="submit" 
          disabled={isSubmitting || reflection.trim().length < 20}
          className="bg-gradient-to-r from-quantum-400 to-quantum-600 hover:opacity-90"
        >
          <Send size={16} className="mr-2" />
          Submit Reflection
        </Button>
      </div>
    </form>
  );
};

export default ReflectionFormInput;
