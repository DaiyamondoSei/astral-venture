
import React from 'react';
import useAuth from '@/hooks/auth/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onClick?: () => Promise<void> | void;
}

const LogoutButton = ({ 
  variant = 'ghost',
  size = 'default',
  className,
  onClick
}: LogoutButtonProps) => {
  const { logout } = useAuth();
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
        await logout();
        navigate('/login');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Use default logout as fallback if custom handler fails
      await logout();
      navigate('/login');
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={false}
      className={className}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
};

export default LogoutButton;
