
/**
 * Custom hook for logout functionality
 * 
 * Provides a consistent way to handle logout across the application,
 * with support for confirming logout and redirecting after logout.
 */

import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { toast } from '@/components/ui/use-toast';

export function useLogout() {
  const { logout, isLoggingOut } = useAuth();
  
  /**
   * Handles user logout with optional confirmation
   * and success/error notifications
   */
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
        variant: "default"
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "There was a problem logging you out. Please try again.",
        variant: "destructive"
      });
    }
  }, [logout]);
  
  return {
    handleLogout,
    isLoggingOut
  };
}

export default useLogout;
