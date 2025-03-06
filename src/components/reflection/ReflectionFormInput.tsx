
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FormLabel } from '@/components/ui/form-label';
import { Lightbulb, Send } from 'lucide-react';

interface ReflectionFormInputProps {
  reflection: string;
  setReflection: (value: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  error?: string;
}

const ReflectionFormInput = ({ 
  reflection, 
  setReflection, 
  isSubmitting, 
  onSubmit,
  error
}: ReflectionFormInputProps) => {
  const minReflectionLength = 20;
  const isValid = reflection.trim().length >= minReflectionLength;
  
  return (
    <form onSubmit={onSubmit} aria-label="Reflection form">
      <div className="mb-4">
        <FormLabel 
          htmlFor="reflection-input" 
          variant="contrast" 
          className="mb-2 block"
        >
          Share your reflection
        </FormLabel>
        
        <Textarea
          id="reflection-input"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Share your energy work, meditative insights, or consciousness expansion experiences..."
          className="min-h-[120px] bg-black/30 border-quantum-500/30 placeholder:text-white/40 focus-visible:border-quantum-400/50"
          error={!!error}
          errorMessage={error}
          aria-describedby="reflection-hint"
        />
        
        <div id="reflection-hint" className="mt-1 text-xs text-white/60">
          {reflection.length} / {minReflectionLength}+ characters recommended
        </div>
      </div>
      
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center text-xs text-white/60">
          <Lightbulb size={14} className="mr-1 text-primary/70" />
          <span>Deeper reflections yield more energy points</span>
        </div>
        
        <Button 
          type="submit" 
          disabled={isSubmitting || !isValid}
          loading={isSubmitting}
          variant="quantum"
          className="transition-all duration-200"
          size="default"
        >
          <Send size={16} className="mr-2" />
          Submit Reflection
        </Button>
      </div>
    </form>
  );
};

export default ReflectionFormInput;
