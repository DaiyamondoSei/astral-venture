
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SeedOfLifePortal from '@/components/seed-of-life/SeedOfLifePortal';
import CosmicBackground from '@/components/visual-foundation/CosmicBackground';
import SwipeablePanelController from '@/components/panels/SwipeablePanelController';
import SwipeIndicator from '@/components/panels/SwipeIndicator';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <CosmicBackground className="absolute inset-0 z-0" />
      
      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <SeedOfLifePortal className="max-w-md w-full" />
      </main>
      
      {/* Swipeable panels controller */}
      {isAuthenticated && (
        <>
          <SwipeablePanelController />
          <SwipeIndicator position="top" />
          <SwipeIndicator position="bottom" />
        </>
      )}
    </div>
  );
};

export default HomePage;
