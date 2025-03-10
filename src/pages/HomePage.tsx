
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import UserWelcome from '@/components/UserWelcome';
import SacredHomePage from '@/components/home/SacredHomePage';
import SwipeablePanel from '@/components/panels/SwipeablePanelController';

/**
 * HomePage component that shows the main application page
 */
const HomePage: React.FC = () => {
  const { user, userProfile, isAuthenticated, userStreak, handleLogout } = useAuth();
  
  const userName = userProfile?.displayName || user?.email?.split('@')[0] || 'Explorer';
  const astralLevel = 3; // Placeholder - to be replaced with actual level calculation
  
  return (
    <Layout>
      <div className="container px-4 py-6 mx-auto">
        {isAuthenticated && (
          <UserWelcome 
            username={userName} 
            onLogout={handleLogout}
            astralLevel={astralLevel}
          />
        )}
        
        <SacredHomePage />
        
        {/* Bottom panel with placeholder content */}
        <SwipeablePanel position="bottom" initialState={false}>
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Panel content</h2>
            <p>This is a swipeable panel from the bottom.</p>
          </div>
        </SwipeablePanel>
      </div>
    </Layout>
  );
};

export default HomePage;
