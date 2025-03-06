
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PersonalizationMetrics } from '@/services/personalization';
import { usePersonalization } from '@/hooks/usePersonalization';
import { Settings, Star, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PersonalizationMetricsCard from './PersonalizationMetricsCard';
import RecommendationsDisplay from './RecommendationsDisplay';

interface PersonalizationSummaryProps {
  onSelectRecommendation?: (recommendationId: string) => void;
}

const PersonalizationSummary: React.FC<PersonalizationSummaryProps> = ({ 
  onSelectRecommendation 
}) => {
  const { preferences, recommendations, metrics } = usePersonalization();
  const navigate = useNavigate();
  
  const handleRecommendationSelect = (recommendation: any) => {
    if (onSelectRecommendation) {
      onSelectRecommendation(recommendation.id);
    }
  };
  
  const navigateToSettings = () => {
    navigate('/preferences');
  };
  
  // Show a message if personalization is disabled
  if (preferences && !preferences.privacySettings.allowRecommendations) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles size={18} />
            Personalization
          </CardTitle>
          <CardDescription>
            Personalized recommendations are currently disabled
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Sparkles size={40} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Enable Personalization</h3>
          <p className="text-muted-foreground mb-4">
            Turn on personalization to get recommendations tailored to your preferences and activity.
          </p>
          <Button onClick={navigateToSettings}>
            <Settings size={16} className="mr-2" />
            Go to Preferences
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-medium">Your Personalized Experience</h2>
        <Button variant="ghost" size="sm" onClick={navigateToSettings}>
          <Settings size={16} className="mr-2" />
          Preferences
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecommendationsDisplay 
            onSelectRecommendation={handleRecommendationSelect}
            limit={3}
          />
        </div>
        <div className="lg:col-span-1">
          <PersonalizationMetricsCard compact />
        </div>
      </div>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star size={18} />
            Personalization Benefits
          </CardTitle>
          <CardDescription>
            How personalization enhances your experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BenefitCard 
              title="Tailored Content"
              description="Discover content aligned with your preferences and goals"
              icon={<Sparkles className="h-5 w-5 text-primary" />}
            />
            <BenefitCard 
              title="Progress Tracking"
              description="See how personalization improves your growth journey"
              icon={<Star className="h-5 w-5 text-primary" />}
            />
            <BenefitCard 
              title="Privacy Control"
              description="Full control over how your data is used"
              icon={<Settings className="h-5 w-5 text-primary" />}
            />
          </div>
          
          <div className="mt-6 text-center">
            <Button onClick={navigateToSettings}>
              Customize Your Experience
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface BenefitCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const BenefitCard: React.FC<BenefitCardProps> = ({
  title,
  description,
  icon
}) => {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-2">{icon}</div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default PersonalizationSummary;
