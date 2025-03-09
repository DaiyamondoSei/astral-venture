
import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useUser } from '@/hooks/useUser';
import { useLogout } from '@/hooks/useLogout';

const DashboardPage = () => {
  const user = useUser();
  const { logout } = useLogout();
  
  return (
    <DashboardLayout 
      username={user?.email || 'Explorer'} 
      astralLevel={1} 
      onLogout={logout}
    >
      {/* Dashboard content will be rendered by DashboardLayout */}
    </DashboardLayout>
  );
};

export default DashboardPage;
