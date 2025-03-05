import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CHAKRA_COLORS, CHAKRA_NAMES } from '@/components/entry-animation/cosmic/types';
import { CalendarDays, Zap, RotateCcw, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  activatedChakras: number[];
  userId?: string; // Add userId as an optional prop
  onChakraActivation?: (chakraIndex: number) => void;
  onRecalibration?: () => void;
}
const StreakTracker = ({
  currentStreak = 0,
  longestStreak = 0,
  activatedChakras = [],
  userId,
  // Add userId parameter
  onChakraActivation,
  onRecalibration
}: StreakTrackerProps) => {
  const today = new Date();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDayIndex = today.getDay();

  // Days of the current week arranged from Sunday to Saturday
  const weekDaysArranged = Array.from({
    length: 7
  }, (_, i) => {
    const dayIndex = i;
    const isActive = activatedChakras.includes(dayIndex);
    const isCurrent = dayIndex === currentDayIndex;
    const isPast = dayIndex < currentDayIndex;
    const isMissed = isPast && !isActive;
    return {
      name: weekDays[dayIndex],
      chakraName: CHAKRA_NAMES[dayIndex],
      chakraColor: CHAKRA_COLORS[dayIndex],
      isActive,
      isCurrent,
      isPast,
      isMissed
    };
  });
  return <Card className="glass-card shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="text-xl font-display">Weekly Chakra Streak</span>
          <div className="flex items-center gap-2 text-sm font-normal">
            <CalendarDays size={16} className="text-primary" />
            <span>
              Current: <span className="font-semibold">{currentStreak}</span> days
            </span>
            <span className="text-muted-foreground">|</span>
            <span>
              Best: <span className="font-semibold">{longestStreak}</span> days
            </span>
          </div>
        </CardTitle>
        <CardDescription className="font-normal text-center">
          Activate all chakras to maintain your energy balance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDaysArranged.map((day, index) => <div key={index} className="flex flex-col items-center">
              <div className="text-xs mb-1 text-muted-foreground">{day.name}</div>
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white relative", day.isActive ? "bg-gradient-to-br from-quantum-400/80 to-quantum-700" : day.isMissed ? "bg-black/30 border border-red-500/30" : "bg-black/30 border border-white/10")} style={day.isActive ? {
            boxShadow: `0 0 15px ${day.chakraColor}80`
          } : {}}>
                {day.isActive ? <Check size={16} /> : day.isCurrent ? <div className="w-2 h-2 bg-white rounded-full animate-pulse" /> : <div className="w-2 h-2 bg-white/30 rounded-full" />}
                
                {day.isCurrent && !day.isActive && <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                  </div>}
              </div>
              <div className="text-xs mt-1 font-medium" style={{
            color: `${day.chakraColor}CC`
          }}>
                {day.chakraName}
              </div>
            </div>)}
        </div>
        
        {weekDaysArranged[currentDayIndex] && !weekDaysArranged[currentDayIndex].isActive ? <Button className="w-full bg-gradient-to-r from-quantum-400 to-quantum-700" onClick={() => onChakraActivation && onChakraActivation(currentDayIndex)}>
            <Zap size={16} className="mr-2" />
            Activate Today's Chakra
          </Button> : weekDaysArranged.some(day => day.isMissed) ? <Button variant="outline" className="w-full border-quantum-400/30 text-quantum-400" onClick={() => onRecalibration && onRecalibration()}>
            <RotateCcw size={16} className="mr-2" />
            Energy Recalibration
          </Button> : null}
      </CardContent>
    </Card>;
};
export default StreakTracker;