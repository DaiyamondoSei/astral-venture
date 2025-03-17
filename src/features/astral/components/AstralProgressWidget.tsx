
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Moon, Star } from 'lucide-react';

interface AstralProgressWidgetProps {
  onClick?: () => void;
}

const AstralProgressWidget: React.FC<AstralProgressWidgetProps> = ({ onClick }) => {
  // In a real implementation, this would come from a hook or API
  const stats = {
    level: 3,
    progress: 65, // percentage to next level
    journeys: 7,
    nextMilestone: 'Astral Communication'
  };
  
  return (
    <Card 
      className="border-quantum-700 bg-quantum-800/50 transition-all hover:shadow-lg hover:shadow-purple-900/20 cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-quantum-900">
            <Moon className="h-4 w-4 text-purple-400" />
          </div>
          Astral Progress
        </CardTitle>
        <CardDescription>Your astral projection journey</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Astral Level</p>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{stats.level}</span>
                <span className="text-quantum-400 ml-2 text-sm">/ 10</span>
              </div>
            </div>
            <div className="flex space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  className={i < stats.level ? "fill-purple-500 text-purple-500" : "text-quantum-600"} 
                />
              ))}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Progress to Level {stats.level + 1}</span>
              <span>{stats.progress}%</span>
            </div>
            <div className="h-2 bg-quantum-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs text-quantum-400">Journeys</p>
              <p className="text-xl font-bold">{stats.journeys}</p>
            </div>
            <div>
              <p className="text-xs text-quantum-400">Next Milestone</p>
              <p className="text-sm font-medium line-clamp-2">{stats.nextMilestone}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AstralProgressWidget;
