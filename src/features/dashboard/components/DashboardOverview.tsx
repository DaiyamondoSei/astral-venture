
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Zap, LineChart } from 'lucide-react';

interface DashboardOverviewProps {
  username: string;
  energyPoints: number;
  astralLevel: number;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  username,
  energyPoints,
  astralLevel
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {username}</h1>
        <p className="text-muted-foreground">
          Continue your journey through consciousness and energy mastery
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-quantum-700 bg-quantum-800/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-quantum-700">
                <Zap className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Energy Points</p>
                <h2 className="text-3xl font-bold">{energyPoints.toLocaleString()}</h2>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-quantum-700 bg-quantum-800/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-quantum-700">
                <Crown className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Astral Level</p>
                <h2 className="text-3xl font-bold">{astralLevel}</h2>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-quantum-700 bg-quantum-800/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-quantum-700">
                <LineChart className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Progress</p>
                <div className="text-3xl font-bold">
                  {Math.min(Math.floor((energyPoints / 10000) * 100), 100)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
