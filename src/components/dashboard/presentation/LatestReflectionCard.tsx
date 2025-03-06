
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Sparkle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface LatestReflectionCardProps {
  latestReflection?: {
    content: string;
    created_at: string;
    points_earned: number;
    dominant_emotion?: string;
  } | null;
  isLoading?: boolean;
}

const LatestReflectionCard: React.FC<LatestReflectionCardProps> = ({ 
  latestReflection,
  isLoading = false
}) => {
  // Format the reflection content to a shorter excerpt
  const getExcerpt = (content: string, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Latest Reflection</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-24 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        ) : latestReflection ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {getExcerpt(latestReflection.content)}
            </p>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-muted-foreground">
                <CalendarIcon size={14} className="mr-1" />
                <span>
                  {formatDistanceToNow(new Date(latestReflection.created_at), { addSuffix: true })}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <Sparkle size={14} className="text-primary" />
                <span className="font-medium">+{latestReflection.points_earned} points</span>
              </div>
            </div>
            
            {latestReflection.dominant_emotion && (
              <div>
                <Badge variant="outline" className="text-xs">
                  {latestReflection.dominant_emotion}
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">
            You haven't written any reflections yet. Share your thoughts and earn energy points!
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default LatestReflectionCard;
