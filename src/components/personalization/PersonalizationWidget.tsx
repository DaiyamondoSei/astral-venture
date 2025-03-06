
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePersonalization } from '@/hooks/usePersonalization';
import { Sparkles, Settings, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

interface PersonalizationWidgetProps {
  onRecommendationSelect?: (recommendationId: string) => void;
}

const PersonalizationWidget: React.FC<PersonalizationWidgetProps> = ({ 
  onRecommendationSelect 
}) => {
  const { recommendations, preferences, isLoading } = usePersonalization();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  
  // Only show if user has enabled recommendations and there are recommendations
  const showRecommendations = 
    preferences?.privacySettings?.allowRecommendations && 
    recommendations.length > 0;
  
  // Get current recommendation
  const currentRecommendation = showRecommendations ? 
    recommendations[currentIndex % recommendations.length] : null;
  
  // Change recommendation every 10 seconds
  React.useEffect(() => {
    if (!showRecommendations || recommendations.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % recommendations.length);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [showRecommendations, recommendations.length]);
  
  const handleRecommendationClick = () => {
    if (currentRecommendation && onRecommendationSelect) {
      onRecommendationSelect(currentRecommendation.id);
    }
  };
  
  const navigateToSettings = () => {
    navigate('/preferences');
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="bg-card-foreground/10 h-4 w-1/3 rounded"></div>
            <div className="bg-card-foreground/10 h-16 w-full rounded"></div>
            <div className="bg-card-foreground/10 h-8 w-1/2 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // If personalization is disabled, show a simple card
  if (!showRecommendations) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <Sparkles size={16} />
            <span className="text-sm font-medium">Personalization</span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            Enable personalization to get recommendations tailored to your preferences.
          </p>
          
          <Button size="sm" variant="outline" onClick={navigateToSettings}>
            <Settings size={14} className="mr-1" />
            Enable
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles size={16} />
            <span className="text-sm font-medium">For You</span>
          </div>
          
          {recommendations.length > 1 && (
            <div className="flex gap-1">
              {recommendations.slice(0, 3).map((_, i) => (
                <span 
                  key={i}
                  className={`block w-2 h-2 rounded-full ${
                    i === currentIndex % recommendations.length ? 'bg-primary' : 'bg-muted'
                  }`}
                ></span>
              ))}
            </div>
          )}
        </div>
        
        <AnimatePresence mode="wait">
          {currentRecommendation && (
            <motion.div
              key={currentRecommendation.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="cursor-pointer"
              onClick={handleRecommendationClick}
            >
              <h3 className="font-medium mb-1">{currentRecommendation.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {currentRecommendation.recommendationReason}
              </p>
              
              <Button size="sm" variant="outline" className="w-full">
                <span>Explore</span>
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default PersonalizationWidget;
