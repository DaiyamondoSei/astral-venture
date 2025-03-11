import React from 'react';
import Layout from '@/components/Layout';
import UserProfilePanel from '@/components/panels/UserProfilePanel';
import AchievementsPanel from '@/components/panels/AchievementsPanel';
import ReflectionsPanel from '@/components/panels/ReflectionsPanel';
import LogoutButton from '@/components/LogoutButton';
import { useAuth } from '@/hooks/auth/useAuth';

interface UserDashboardViewProps {
  onLogout: () => void;
}

const UserDashboardView: React.FC<UserDashboardViewProps> = ({ onLogout }) => {
  const { logout } = useAuth();

  // Fix for line 37 where handleLogout is called with an argument but expects none
  const handleUserLogout = async () => {
    await logout();
  }

  return (
    <Layout className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-semibold text-white mb-6">Your Astral Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UserProfilePanel />
          <AchievementsPanel />
          <ReflectionsPanel />
        </div>
      </div>

      <footer className="container mx-auto px-4 py-4 text-center text-gray-500">
        <LogoutButton onClick={handleUserLogout} />
        <p>&copy; {new Date().getFullYear()} Quantum Leap. All rights reserved.</p>
      </footer>
    </Layout>
  );
};

export default UserDashboardView;
