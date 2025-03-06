
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { MessageSquareIcon } from 'lucide-react';

interface AIDashboardCardProps {
  latestReflection: any;
  onOpenAssistant: (reflectionId?: string, reflectionContent?: string) => void;
}

const AIDashboardCard: React.FC<AIDashboardCardProps> = ({ latestReflection, onOpenAssistant }) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>AI Sacred Guide</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <p className="text-muted-foreground">
            Your personal AI guide can help with your spiritual journey, meditation practice, and energy work.
          </p>
          
          {latestReflection ? (
            <div className="mt-4">
              <h4 className="text-sm font-medium">Based on your latest reflection:</h4>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {latestReflection.content}
              </p>
              <Button 
                onClick={() => onOpenAssistant(latestReflection.id, latestReflection.content)} 
                className="w-full mt-3"
                variant="default"
              >
                <MessageSquareIcon size={16} className="mr-2" />
                Ask for Insights
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => onOpenAssistant()} 
              className="w-full mt-2"
              variant="outline"
            >
              <MessageSquareIcon size={16} className="mr-2" />
              Ask AI Guide
            </Button>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default AIDashboardCard;
