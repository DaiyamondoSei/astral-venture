
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useLogout = (userId?: string) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();

  const handleLogout = async () => {
    if (!userId) return;
    
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      localStorage.removeItem(`entry-animation-shown-${userId}`);
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return {
    handleLogout,
    isLoggingOut
  };
};
