
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Zap } from 'lucide-react';

interface TodaysChallengeProps {
  challenge: {
    id: string;
    title: string;
    description: string;
    duration_minutes: number;
    energy_points: number;
  } | null;
  isLoading: boolean;
  onComplete: (challengeId: string) => void;
}

const TodaysChallenge: React.FC<TodaysChallengeProps> = ({ 
  challenge, 
  isLoading, 
  onComplete 
}) => {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="animate-pulse">
          <div className="h-6 bg-muted rounded-md w-1/2 mb-2"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-4 bg-muted rounded-md w-3/4"></div>
          <div className="h-4 bg-muted rounded-md w-full"></div>
          <div className="h-10 bg-muted rounded-md w-1/3 mt-4"></div>
        </CardContent>
      </Card>
    );
  }

  if (!challenge) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Today's Challenge</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No challenges available today. Check back tomorrow!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Today's Challenge</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-medium">{challenge.title}</h3>
          <p className="text-muted-foreground mt-2">{challenge.description}</p>
          
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock size={16} className="mr-2" />
              <span>{challenge.duration_minutes} minutes</span>
            </div>
            <div className="flex items-center text-sm text-primary">
              <Zap size={16} className="mr-2" />
              <span>+{challenge.energy_points} energy points</span>
            </div>
          </div>
          
          <Button 
            onClick={() => onComplete(challenge.id)} 
            className="w-full mt-4"
            variant="default"
          >
            <CheckCircle size={16} className="mr-2" />
            Complete Challenge
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default TodaysChallenge;
