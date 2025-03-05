
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Lightbulb, Send } from 'lucide-react';

interface ReflectionInputProps {
  reflection: string;
  setReflection: (value: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
}

const ReflectionInput: React.FC<ReflectionInputProps> = ({ 
  reflection, 
  setReflection, 
  isSubmitting, 
  onSubmit 
}) => {
  return (
    <>
      <div className="mt-4">
        <Textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Share your thoughts, insights, and realizations about consciousness..."
          className="min-h-[120px] bg-black/30 border-quantum-500/30 placeholder:text-white/40"
        />
      </div>
      
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center text-xs text-white/60">
          <Lightbulb size={14} className="mr-1 text-primary/70" />
          <span>Deeper reflections yield more consciousness points</span>
        </div>
        
        <Button 
          onClick={onSubmit} 
          disabled={isSubmitting || reflection.trim().length < 20}
          className="bg-gradient-to-r from-quantum-400 to-quantum-600 hover:opacity-90"
        >
          <Send size={16} className="mr-2" />
          Submit Reflection
        </Button>
      </div>
    </>
  );
};

export default ReflectionInput;
