
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onClick?: () => Promise<void>; // Added onClick prop to support external handlers
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
    if (onClick) {
      await onClick();
    } else {
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
