
import React from 'react';
import { Outlet } from 'react-router-dom';
import MainNavigation from '@/shared/components/navigation/MainNavigation';
import Footer from '@/shared/components/navigation/Footer';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-quantum-900 to-quantum-950 text-white flex flex-col">
      <MainNavigation />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MainLayout;
