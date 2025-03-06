
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { PlayCircle, Clock } from 'lucide-react';

interface AIGuidedPracticeCardProps {
  practiceType: string;
  duration: number;
  chakraFocus?: number;
  onStartPractice?: () => void;
}

const AIGuidedPracticeCard: React.FC<AIGuidedPracticeCardProps> = ({ 
  practiceType, 
  duration, 
  chakraFocus,
  onStartPractice = () => {}
}) => {
  // Map chakra index to name
  const chakraNames = ['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown'];
  const chakraName = chakraFocus !== undefined && chakraFocus >= 0 && chakraFocus < 7 
    ? chakraNames[chakraFocus] 
    : null;

  // Title based on practice type
  const title = `${practiceType.charAt(0).toUpperCase() + practiceType.slice(1)} Practice`;
  
  // Description based on chakra focus
  const description = chakraName 
    ? `A guided ${duration}-minute ${practiceType} focused on your ${chakraName} chakra.`
    : `A guided ${duration}-minute ${practiceType} to center your energy.`;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <p className="text-muted-foreground">{description}</p>
          
          <div className="flex items-center text-sm text-muted-foreground mt-4">
            <Clock size={16} className="mr-2" />
            <span>{duration} minutes</span>
          </div>
          
          <Button 
            onClick={onStartPractice} 
            className="w-full mt-2"
            variant="default"
          >
            <PlayCircle size={16} className="mr-2" />
            Begin Practice
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default AIGuidedPracticeCard;
