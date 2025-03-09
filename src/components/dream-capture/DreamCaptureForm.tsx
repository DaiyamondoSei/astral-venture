
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useConsciousness } from '@/contexts/ConsciousnessContext';
import { toast } from '@/components/ui/use-toast';

/**
 * Dream Capture Form component
 */
export const DreamCaptureForm: React.FC = () => {
  const [dreamContent, setDreamContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { saveDream } = useConsciousness();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dreamContent.trim()) {
      toast({
        title: 'Dream content required',
        description: 'Please enter your dream to continue.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const savedDream = await saveDream(dreamContent);
      
      if (savedDream) {
        toast({
          title: 'Dream captured',
          description: 'Your dream has been saved and analyzed.',
        });
        setDreamContent('');
      } else {
        toast({
          title: 'Error saving dream',
          description: 'Please try again later.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error saving dream',
        description: 'Please try again later.',
        variant: 'destructive'
      });
      console.error('Dream capture error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold mb-4">Capture Your Dream</h2>
        <p className="text-muted-foreground mb-4">
          Record your dream to receive insights about your subconscious and chakra activations.
        </p>
        
        <Textarea 
          value={dreamContent}
          onChange={(e) => setDreamContent(e.target.value)}
          placeholder="Describe your dream in detail..."
          className="min-h-[150px] mb-4"
        />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Analyzing Dream...' : 'Save & Analyze Dream'}
        </Button>
      </form>
    </Card>
  );
};
