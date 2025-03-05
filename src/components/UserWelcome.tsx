
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import EnergyAvatar from '@/components/EnergyAvatar';

interface UserWelcomeProps {
  username: string;
  onLogout: () => void;
  astralLevel: number;
}

const UserWelcome = ({ username, onLogout, astralLevel }: UserWelcomeProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center mb-8">
      <div className="flex-1">
        <h1 className="text-2xl md:text-3xl font-display font-medium text-white">
          Welcome, {username}
        </h1>
        <p className="text-white/70 mt-1">Continue your quantum journey</p>
      </div>
      <div className="mt-4 md:mt-0 flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onLogout}
          className="text-white/70 hover:text-white border border-white/20 hover:border-white/40"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
        <EnergyAvatar level={astralLevel} />
      </div>
    </div>
  );
};

export default UserWelcome;
