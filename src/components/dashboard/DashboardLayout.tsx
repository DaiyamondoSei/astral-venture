
import React, { ReactNode } from 'react';
import UserWelcome from '@/components/UserWelcome';

interface DashboardLayoutProps {
  username: string;
  astralLevel: number;
  onLogout: () => void;
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  username,
  astralLevel,
  onLogout,
  children
}) => {
  return (
    <>
      <UserWelcome 
        username={username} 
        onLogout={onLogout}
        astralLevel={astralLevel}
      />
      
      {children}
    </>
  );
};

export default DashboardLayout;
