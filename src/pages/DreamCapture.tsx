
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DreamCapture from '@/components/onboarding/DreamCapture';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const DreamCapturePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user should see this page
    const checkUserStatus = async () => {
      if (!user) {
        // Redirect to login if not logged in
        navigate('/login');
        return;
      }
      
      try {
        // Check if user already has a dream defined
        const { data: userPrefs } = await supabase
          .from('user_preferences')
          .select('preferences')
          .eq('user_id', user.id)
          .single();
          
        // If user already has a dream, navigate to home
        if (userPrefs?.preferences?.dream) {
          navigate('/');
          return;
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking user dream status:', error);
        setIsLoading(false);
      }
    };
    
    checkUserStatus();
  }, [user, navigate]);
  
  const handleDreamComplete = async (dreamText: string) => {
    if (!user) return;
    
    try {
      // Save the dream to user preferences
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({ 
          user_id: user.id,
          preferences: { 
            dream: dreamText,
            dreamCapturedAt: new Date().toISOString()
          }
        }, { onConflict: 'user_id' });
        
      if (error) throw error;
      
      // Set the flag in localStorage
      localStorage.setItem('dreamCaptureCompleted', 'true');
      
      // Give user energy points for defining their dream
      await supabase.rpc('add_energy_points', { 
        user_id: user.id, 
        points: 50,
        reason: 'Dream definition' 
      });
      
      toast({
        title: "Dream Integrated",
        description: "Your quantum journey has begun",
      });
      
      // Redirect to the entry animation
      navigate('/entry-animation');
      
    } catch (error) {
      console.error('Error saving dream:', error);
      toast({
        title: "Error Saving Dream",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };
  
  const handleSkip = async () => {
    if (!user) return;
    
    try {
      // Mark as skipped in user preferences
      await supabase
        .from('user_preferences')
        .upsert({ 
          user_id: user.id,
          preferences: { 
            dreamSkipped: true,
            dreamSkippedAt: new Date().toISOString() 
          }
        }, { onConflict: 'user_id' });
      
      // Set the flag in localStorage
      localStorage.setItem('dreamCaptureCompleted', 'true');
      
      // Redirect to the entry animation
      navigate('/entry-animation');
      
    } catch (error) {
      console.error('Error processing skip:', error);
      // Continue anyway
      navigate('/entry-animation');
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-quantum-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  return <DreamCapture onComplete={handleDreamComplete} onSkip={handleSkip} />;
};

export default DreamCapturePage;
