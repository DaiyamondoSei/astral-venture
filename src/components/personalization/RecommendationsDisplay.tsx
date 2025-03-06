
import React from 'react';
import { ContentRecommendation } from '@/services/personalization';
import { usePersonalization } from '@/hooks/usePersonalization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RotateCw, Sparkles, BookOpen, Trophy, Flame } from 'lucide-react';

interface RecommendationsDisplayProps {
  onSelectRecommendation?: (recommendation: ContentRecommendation) => void;
  limit?: number;
  showRefresh?: boolean;
}

const RecommendationsDisplay: React.FC<RecommendationsDisplayProps> = ({
  onSelectRecommendation,
  limit = 5,
  showRefresh = true
}) => {
  const { recommendations, refreshRecommendations, trackContentView, isLoading, isUpdating } = usePersonalization();
  
  const displayedRecommendations = recommendations.slice(0, limit);
  
  const handleRecommendationClick = (recommendation: ContentRecommendation) => {
    // Track the view for future personalization
    trackContentView(recommendation.id);
    
    // Call the provided callback if available
    if (onSelectRecommendation) {
      onSelectRecommendation(recommendation);
    }
  };
  
  // Function to get icon based on content type
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'meditation':
        return <Sparkles size={16} className="text-purple-400" />;
      case 'practice':
        return <Flame size={16} className="text-orange-400" />;
      case 'lesson':
        return <BookOpen size={16} className="text-blue-400" />;
      case 'reflection':
        return <Trophy size={16} className="text-green-400" />;
      default:
        return <Sparkles size={16} className="text-purple-400" />;
    }
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="animate-pulse bg-card-foreground/10 h-6 w-1/3 rounded"></CardTitle>
          <CardDescription className="animate-pulse bg-card-foreground/10 h-4 w-2/3 rounded mt-2"></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-md space-y-2 animate-pulse">
              <div className="bg-card-foreground/10 h-5 w-2/3 rounded"></div>
              <div className="bg-card-foreground/10 h-4 w-1/3 rounded"></div>
              <div className="bg-card-foreground/10 h-4 w-full rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  
  if (recommendations.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles size={18} />
            Personalized Recommendations
          </CardTitle>
          <CardDescription>
            Enable personalized recommendations in your privacy settings to see content tailored for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center">
            <Sparkles size={24} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No recommendations available</p>
            <Button onClick={() => refreshRecommendations()} disabled={isUpdating}>
              Enable Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Sparkles size={18} />
            Personalized For You
          </CardTitle>
          <CardDescription>
            Content tailored to your preferences and usage patterns
          </CardDescription>
        </div>
        {showRefresh && (
          <Button size="sm" variant="ghost" onClick={() => refreshRecommendations()} disabled={isUpdating}>
            <RotateCw size={16} className={isUpdating ? "animate-spin" : ""} />
            <span className="sr-only">Refresh recommendations</span>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        {displayedRecommendations.map((recommendation) => (
          <div 
            key={recommendation.id}
            className="p-4 border rounded-md cursor-pointer hover:border-primary transition-colors"
            onClick={() => handleRecommendationClick(recommendation)}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10">
                {getContentTypeIcon(recommendation.type)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{recommendation.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {recommendation.type.charAt(0).toUpperCase() + recommendation.type.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {recommendation.category.charAt(0).toUpperCase() + recommendation.category.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {recommendation.recommendationReason}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecommendationsDisplay;
