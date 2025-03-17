
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardOverview from '@/features/dashboard/components/DashboardOverview';
import ChakraBalanceWidget from '@/features/chakras/components/ChakraBalanceWidget';
import RecentReflectionsWidget from '@/features/journal/components/RecentReflectionsWidget';
import MeditationStatsWidget from '@/features/meditation/components/MeditationStatsWidget';
import AstralProgressWidget from '@/features/astral/components/AstralProgressWidget';
import { useAuth } from '@/shared/hooks/useAuth';

const DashboardPage: React.FC = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  
  return (
    <div className="space-y-8">
      <DashboardOverview 
        username={userProfile?.username || user?.email?.split('@')[0] || 'Explorer'} 
        energyPoints={userProfile?.energyPoints || 0}
        astralLevel={userProfile?.astralLevel || 1}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ChakraBalanceWidget onClick={() => navigate('/chakras')} />
        <RecentReflectionsWidget onClick={() => navigate('/journal')} />
        <MeditationStatsWidget onClick={() => navigate('/meditation')} />
        <AstralProgressWidget onClick={() => navigate('/astral')} />
      </div>
    </div>
  );
};

export default DashboardPage;
