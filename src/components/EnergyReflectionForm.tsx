
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Lightbulb, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface EnergyReflectionFormProps {
  onReflectionComplete?: (pointsEarned: number) => void;
}

const EnergyReflectionForm = ({ onReflectionComplete }: EnergyReflectionFormProps) => {
  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const calculateEnergyPoints = (text: string): number => {
    // Base points for any reflection
    let points = 5;
    
    // Additional points based on depth (word count as a basic metric)
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    
    if (wordCount > 50) points += 5;
    if (wordCount > 100) points += 5;
    if (wordCount > 200) points += 5;
    
    // Additional points for energy-related keywords
    const keywords = [
      'meditation', 'energy', 'chakra', 'breath', 'awareness', 
      'consciousness', 'presence', 'mindfulness', 'intuition', 'vibration'
    ];
    
    let keywordMatches = 0;
    keywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        keywordMatches++;
      }
    });
    
    // Add points based on keyword usage (capped)
    points += Math.min(keywordMatches * 2, 10);
    
    return Math.min(points, 30); // Cap at 30 points max
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Not signed in",
        description: "You need to be signed in to submit a reflection",
        variant: "destructive"
      });
      return;
    }
    
    if (reflection.trim().length < 20) {
      toast({
        title: "Reflection too short",
        description: "Please share more about your energy practice (at least 20 characters)",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate points based on reflection content
      const pointsEarned = calculateEnergyPoints(reflection);
      
      // Save reflection to database
      const { error } = await supabase
        .from('energy_reflections')
        .insert({
          user_id: user.id,
          content: reflection,
          points_earned: pointsEarned
        });
        
      if (error) throw error;
      
      // Update user's energy points
      const { data: userData, error: fetchError } = await supabase
        .from('user_profiles')
        .select('energy_points')
        .eq('id', user.id)
        .single();
        
      if (fetchError) throw fetchError;
      
      const currentPoints = userData?.energy_points || 0;
      const newPoints = currentPoints + pointsEarned;
      
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          energy_points: newPoints,
          last_active_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Show success message
      toast({
        title: "Reflection Submitted",
        description: `Thank you for your energy reflection! You earned ${pointsEarned} energy points.`,
      });
      
      // Clear form
      setReflection('');
      
      // Notify parent component
      if (onReflectionComplete) {
        onReflectionComplete(pointsEarned);
      }
      
    } catch (error: any) {
      console.error('Error submitting reflection:', error);
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card p-5">
      <div className="mb-4">
        <h3 className="text-xl font-display mb-2">Energy Integration Journal</h3>
        <p className="text-white/80">
          Reflect on your energy practices, insights, and awareness expansion. Your authentic 
          reflections contribute directly to your astral body development.
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
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
    </div>
  );
};

export default EnergyReflectionForm;
