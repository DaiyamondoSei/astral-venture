
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
      <div className="dashboard-content">
        {/* Dashboard content will be rendered by DashboardLayout */}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
