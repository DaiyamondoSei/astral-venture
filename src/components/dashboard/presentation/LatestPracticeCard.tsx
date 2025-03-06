
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LatestPracticeCardProps {
  latestPractice?: {
    title: string;
    completedAt: string;
    category: string;
  } | null;
  isLoading?: boolean;
}

const LatestPracticeCard: React.FC<LatestPracticeCardProps> = ({ 
  latestPractice,
  isLoading = false
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Latest Practice</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-24 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        ) : latestPractice ? (
          <div className="space-y-2">
            <h3 className="font-medium">{latestPractice.title}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarIcon size={16} className="mr-2" />
              <span>
                {formatDistanceToNow(new Date(latestPractice.completedAt), { addSuffix: true })}
              </span>
            </div>
            <div className="text-sm">
              Category: <span className="text-primary">{latestPractice.category}</span>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">
            You haven't completed any practices yet. Start with today's challenge!
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default LatestPracticeCard;
