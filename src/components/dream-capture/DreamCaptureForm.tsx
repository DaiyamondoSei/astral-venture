
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useConsciousness } from '@/contexts/ConsciousnessContext';
import { useUser } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { dreamService } from '@/services/consciousness/dreamService';
import type { DreamRecord, ChakraType } from '@/types/consciousness';

export function DreamCaptureForm() {
  const navigate = useNavigate();
  const user = useUser();
  const { saveDream } = useConsciousness();
  const { toast } = useToast();
  
  const [dreamContent, setDreamContent] = useState('');
  const [lucidity, setLucidity] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your dream record.",
        variant: "destructive"
      });
      return;
    }
    
    if (!dreamContent.trim()) {
      toast({
        title: "Empty Dream Content",
        description: "Please describe your dream before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Analyze dream content
      const analysis = dreamService.analyzeDreamContent(dreamContent);
      
      // Prepare dream record
      const dreamRecord: Omit<DreamRecord, 'id'> = {
        userId: user.id,
        date: new Date().toISOString(),
        content: dreamContent,
        lucidity,
        emotionalTone: analysis.emotionalTone,
        symbols: analysis.symbols,
        chakrasActivated: analysis.chakrasActivated as ChakraType[],
        consciousness: {
          depth: Math.min(10, Math.max(1, lucidity * 2)),
          insights: [],
          archetypes: []
        },
        analysis: {
          theme: analysis.theme,
          interpretation: `Your dream appears to reflect ${analysis.theme.toLowerCase()} themes.`,
          guidance: `Consider reflecting on ${analysis.theme.toLowerCase()} aspects of your life.`
        },
        tags: analysis.emotionalTone
      };
      
      // Save the dream
      const result = await saveDream(dreamRecord);
      
      if (result) {
        toast({
          title: "Dream Captured",
          description: "Your dream has been recorded successfully.",
        });
        
        // Store completion in localStorage
        localStorage.setItem('dreamCaptureCompleted', 'true');
        
        // Navigate to entry animation or dashboard
        navigate('/entry-animation');
      }
    } catch (error) {
      console.error('Error saving dream:', error);
      toast({
        title: "Error Saving Dream",
        description: "There was a problem saving your dream. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="dreamContent" className="block text-sm font-medium">
          Describe your dream in detail:
        </label>
        <Textarea
          id="dreamContent"
          value={dreamContent}
          onChange={(e) => setDreamContent(e.target.value)}
          placeholder="I found myself walking through a forest where the trees were glowing with blue light..."
          rows={8}
          className="w-full"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="lucidity" className="block text-sm font-medium">
          Lucidity Level: {lucidity}
        </label>
        <p className="text-xs text-gray-500">
          How aware were you that you were dreaming? (0 = not at all, 5 = completely lucid)
        </p>
        <Slider
          id="lucidity"
          min={0}
          max={5}
          step={1}
          value={[lucidity]}
          onValueChange={(value) => setLucidity(value[0])}
        />
        <div className="flex justify-between text-xs">
          <span>Not Lucid</span>
          <span>Fully Lucid</span>
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Capturing Dream...' : 'Capture Dream'}
      </Button>
    </form>
  );
}
