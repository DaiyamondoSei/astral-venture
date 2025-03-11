
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onClick?: () => Promise<void> | void; // Updated to support both async and sync handlers
}

const LogoutButton = ({ 
  variant = 'ghost',
  size = 'default',
  className,
  onClick
}: LogoutButtonProps) => {
  const { signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      if (onClick) {
        // Handle both async and sync onClick handlers
        const result = onClick();
        if (result instanceof Promise) {
          await result;
        }
      } else {
        await signOut();
        navigate('/login');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Use default logout as fallback if custom handler fails
      await signOut();
      navigate('/login');
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
};

export default LogoutButton;
