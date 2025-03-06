
import React from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { PreferencesForm } from '@/components/personalization/preferences';
import RecommendationsDisplay from '@/components/personalization/RecommendationsDisplay';
import PersonalizationMetricsCard from '@/components/personalization/PersonalizationMetricsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LockIcon, Settings, Sparkles, BarChart3 } from 'lucide-react';

const PersonalizationPage: React.FC = () => {
  const { user } = useAuth();
  
  // Handle selection of a recommendation
  const handleRecommendationSelect = (recommendation: any) => {
    console.log('Selected recommendation:', recommendation);
    // Implementation can navigate to the content or open a modal
  };
  
  // If user is not logged in, show authentication required
  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-6 px-4">
          <Card className="w-full text-center py-12">
            <CardContent>
              <LockIcon size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-medium mb-2">Authentication Required</h2>
              <p className="text-muted-foreground">
                Please sign in to access personalization settings.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6 px-4">
        <h1 className="text-3xl font-display font-medium mb-6">Personalization</h1>
        
        <Tabs defaultValue="preferences" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings size={16} />
              <span>Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Sparkles size={16} />
              <span>Recommendations</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <BarChart3 size={16} />
              <span>Impact</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="preferences">
            <PreferencesForm />
          </TabsContent>
          
          <TabsContent value="recommendations">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Personalized Recommendations</CardTitle>
                  <CardDescription>
                    Content suggestions based on your preferences and activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecommendationsDisplay 
                    onSelectRecommendation={handleRecommendationSelect}
                    limit={10}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>How Recommendations Work</CardTitle>
                  <CardDescription>
                    Understanding how we personalize your content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Personal Preferences</h3>
                      <p className="text-sm text-muted-foreground">
                        We use your selected preferences to find content that aligns with your interests and goals. 
                        You can update these preferences anytime.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Activity Patterns</h3>
                      <p className="text-sm text-muted-foreground">
                        We analyze your engagement with different types of content to better understand what resonates with you.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Chakra Balance</h3>
                      <p className="text-sm text-muted-foreground">
                        Based on your activated chakras and emotional patterns from reflections, we suggest content to help 
                        maintain balance.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Privacy First</h3>
                      <p className="text-sm text-muted-foreground">
                        Your data is never shared with third parties. You can disable personalization or delete your data anytime 
                        through privacy settings.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="metrics">
            <div className="space-y-6">
              <PersonalizationMetricsCard />
              
              <Card>
                <CardHeader>
                  <CardTitle>Understanding Your Metrics</CardTitle>
                  <CardDescription>
                    How to interpret your personalization impact metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Engagement Score</h3>
                      <p className="text-sm text-muted-foreground">
                        Measures how actively you engage with personalized content. Higher engagement typically 
                        leads to more accurate recommendations.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Content Relevance</h3>
                      <p className="text-sm text-muted-foreground">
                        Shows how well our recommendations match your interests based on your completion rates and 
                        time spent with content.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Chakra Balance Improvement</h3>
                      <p className="text-sm text-muted-foreground">
                        Indicates changes in your energy balance over time. Positive values show improvement in chakra 
                        activation diversity.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Emotional Growth Rate</h3>
                      <p className="text-sm text-muted-foreground">
                        Tracks the depth and variety of emotional insights in your reflections over time.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Progress Acceleration</h3>
                      <p className="text-sm text-muted-foreground">
                        Compares your recent activity level with your earlier usage patterns to show how your 
                        growth journey is progressing.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default PersonalizationPage;
