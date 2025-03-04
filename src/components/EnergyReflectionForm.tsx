
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { calculateEnergyPoints } from '@/utils/energyPointsCalculator';
import { saveReflection, updateUserPoints } from '@/services/reflectionService';
import ReflectionInstructions from './reflection/ReflectionInstructions';
import ReflectionFormInput from './reflection/ReflectionFormInput';

interface EnergyReflectionFormProps {
  onReflectionComplete?: (pointsEarned: number) => void;
}

const EnergyReflectionForm = ({ onReflectionComplete }: EnergyReflectionFormProps) => {
  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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
      await saveReflection(user.id, reflection, pointsEarned);
      
      // Update user's energy points and get new total
      await updateUserPoints(user.id, pointsEarned);
      
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
      <ReflectionInstructions />
      <ReflectionFormInput
        reflection={reflection}
        setReflection={setReflection}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default EnergyReflectionForm;
