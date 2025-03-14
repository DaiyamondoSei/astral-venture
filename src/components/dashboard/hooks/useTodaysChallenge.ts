
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { getTodaysChallenge } from '@/services/challengeService';

export function useTodaysChallenge() {
  const [todayChallenge, setTodayChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadChallenge = async () => {
      if (user) {
        setLoading(true);
        try {
          const challenge = await getTodaysChallenge(user.id);
          setTodayChallenge(challenge);
        } catch (error) {
          console.error('Error fetching today\'s challenge:', error);
          toast({
            title: "Error",
            description: "Could not load today's challenge",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      }
    };

    loadChallenge();
  }, [user, toast]);

  const handleChallengeComplete = async (challengeId: string, onComplete: (pointsEarned: number) => void) => {
    if (!todayChallenge) return;
    
    // This would normally call an API to mark the challenge as complete
    // For now we'll just return the points and let the parent component handle the rest
    onComplete(todayChallenge.energy_points);
    
    toast({
      title: "Challenge Completed!",
      description: `Great job! You've earned ${todayChallenge.energy_points} energy points.`,
    });
  };

  return {
    todayChallenge,
    loading,
    handleChallengeComplete
  };
}
