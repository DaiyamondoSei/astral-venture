
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPersonalizedRecommendations } from '@/services/ai/aiService';
import { ContentRecommendation } from '@/components/ai-assistant/types';
import { Sparkles, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export interface PersonalizedInsightsProps {
  limit?: number;
  category?: string;
}

export const PersonalizedInsights: React.FC<PersonalizedInsightsProps> = ({
  limit = 3,
  category
}) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const data = await getPersonalizedRecommendations(user.id, {
          limit,
          category
        });
        
        setRecommendations(data);
      } catch (err) {
        console.error('Error fetching personalized insights:', err);
        setError('Unable to load personalized insights');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [user?.id, limit, category]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Personalized Insights</CardTitle>
          <CardDescription>Based on your activity</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Personalized Insights</CardTitle>
          <CardDescription>Based on your activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Sparkles className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">
              Complete more activities to receive personalized insights
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((recommendation) => (
        <Card key={recommendation.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">{recommendation.title}</CardTitle>
              <span className="text-xs px-2 py-1 bg-muted rounded">
                {recommendation.type}
              </span>
            </div>
            <CardDescription className="flex items-center gap-1 text-xs">
              <BookOpen className="h-3 w-3" />
              {recommendation.category}
              <span className="mx-1">•</span>
              <Clock className="h-3 w-3" />
              {recommendation.estimatedDuration} min
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-3">{recommendation.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {recommendation.tags.slice(0, 3).map((tag) => (
                  <span 
                    key={tag} 
                    className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Button size="sm" variant="outline" className="text-xs">
                Explore
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PersonalizedInsights;
