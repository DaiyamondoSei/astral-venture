
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Timer, TrendingUp } from 'lucide-react';

interface MeditationStatsWidgetProps {
  onClick?: () => void;
}

const MeditationStatsWidget: React.FC<MeditationStatsWidgetProps> = ({ onClick }) => {
  // In a real implementation, this would come from a hook or API
  const stats = {
    totalSessions: 42,
    totalMinutes: 630,
    currentStreak: 5,
    longestStreak: 14
  };
  
  // Format minutes as hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  return (
    <Card 
      className="border-quantum-700 bg-quantum-800/50 transition-all hover:shadow-lg hover:shadow-purple-900/20 cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-quantum-900">
            <Timer className="h-4 w-4 text-purple-400" />
          </div>
          Meditation Stats
        </CardTitle>
        <CardDescription>Your meditation journey</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Sessions</p>
            <p className="text-2xl font-bold">{stats.totalSessions}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Time</p>
            <p className="text-2xl font-bold">{formatTime(stats.totalMinutes)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Current Streak</p>
            <div className="flex items-center">
              <p className="text-2xl font-bold">{stats.currentStreak}</p>
              <p className="text-xs ml-1 text-muted-foreground">days</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Longest Streak</p>
            <div className="flex items-center">
              <p className="text-2xl font-bold">{stats.longestStreak}</p>
              <p className="text-xs ml-1 text-muted-foreground">days</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-quantum-700 flex items-center">
          <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
          <span className="text-xs text-muted-foreground">15% increase this week</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default MeditationStatsWidget;
