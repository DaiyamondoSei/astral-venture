import React, { useState, useEffect } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import StreakTracker from '@/components/StreakTracker';
import ReflectionTab from '@/components/ReflectionTab';
import CategoryExperienceTab from '@/components/CategoryExperience';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Import new AI components
import AIDashboardWidget from '@/components/ai-assistant/AIDashboardWidget';
import AIGuidedPractice from '@/components/ai-assistant/AIGuidedPractice';
import AIAssistantDialog from '@/components/ai-assistant/AIAssistantDialog';

// Placeholder components until they are created
const TodaysChallengeCard = ({ challenge, onComplete }: any) => (
  <div className="glass-card p-4">
    <h3>Today's Challenge: {challenge?.title || 'Loading...'}</h3>
    <p>{challenge?.description}</p>
    <button onClick={() => onComplete(10)}>Complete Challenge</button>
  </div>
);

const MostRecentPracticeCard = () => (
  <div className="glass-card p-4">
    <h3>Most Recent Practice</h3>
    <p>You haven't completed any practices yet.</p>
  </div>
);

const CategoryGrid = ({ userProfile, onSelectCategory }: any) => (
  <div className="grid grid-cols-2 gap-2">
    <div className="glass-card p-2 cursor-pointer" onClick={() => onSelectCategory('meditation')}>Meditation</div>
    <div className="glass-card p-2 cursor-pointer" onClick={() => onSelectCategory('yoga')}>Yoga</div>
    <div className="glass-card p-2 cursor-pointer" onClick={() => onSelectCategory('breathwork')}>Breathwork</div>
    <div className="glass-card p-2 cursor-pointer" onClick={() => onSelectCategory('journaling')}>Journaling</div>
  </div>
);

const PhilosophicalTab = ({ onReflectionComplete }: { onReflectionComplete?: (points: number) => void }) => (
  <div className="glass-card p-4">
    <h3>Philosophical Reflection</h3>
    <p>Coming soon...</p>
  </div>
);

// Mock challenge service function
const getTodaysChallenge = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error('Error fetching challenge:', error);
    return null;
  }
};

interface MainContentProps {
  userProfile: any;
  onChallengeComplete: (pointsEarned: number) => void;
}

const MainContent = ({ userProfile, onChallengeComplete }: MainContentProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [todayChallenge, setTodayChallenge] = useState(null);
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loadingChallenge, setLoadingChallenge] = useState(true);
  const [latestReflection, setLatestReflection] = useState<any>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [selectedReflection, setSelectedReflection] = useState<{ id?: string, content?: string } | null>(null);

  useEffect(() => {
    const loadChallenge = async () => {
      if (user) {
        setLoadingChallenge(true);
        try {
          const challenge = await getTodaysChallenge(user.id);
          setTodayChallenge(challenge);
        } catch (error) {
          console.error('Error fetching today\'s challenge:', error);
        } finally {
          setLoadingChallenge(false);
        }
      }
    };

    loadChallenge();
  }, [user]);

  // Fetch latest reflection when component mounts
  useEffect(() => {
    if (user) {
      const fetchLatestReflection = async () => {
        try {
          const { data, error } = await supabase
            .from('energy_reflections')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (data && !error) {
            setLatestReflection(data);
          }
        } catch (error) {
          console.error('Error fetching latest reflection:', error);
        }
      };
      
      fetchLatestReflection();
    }
  }, [user]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setActiveTab('category-experience');
  };

  const handleChallengeComplete = (pointsEarned) => {
    setTodayChallenge(null);
    onChallengeComplete(pointsEarned);
  };

  const handleOpenAiAssistant = (reflectionId?: string, reflectionContent?: string) => {
    setSelectedReflection({ id: reflectionId, content: reflectionContent });
    setAiDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayChallenge && (
              <div className="lg:col-span-2">
                <TodaysChallengeCard
                  challenge={todayChallenge}
                  onComplete={handleChallengeComplete}
                />
              </div>
            )}
            
            {/* Add AI Dashboard Widget to make AI more prominent */}
            <AIDashboardWidget 
              latestReflection={latestReflection}
              onOpenAssistant={handleOpenAiAssistant}
            />
            
            {/* Add AI Guided Practice widget */}
            <div className="lg:col-span-2">
              <AIGuidedPractice 
                practiceType="meditation"
                duration={5}
                chakraFocus={latestReflection?.chakras_activated?.[0]}
              />
            </div>
            
            {/* Keep other existing cards */}
            <div className="col-span-1">
              <MostRecentPracticeCard />
            </div>
          </div>
          
          {/* Keep existing content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-display text-lg mb-4">Energy Categories</h3>
              <CategoryGrid 
                userProfile={userProfile} 
                onSelectCategory={handleCategorySelect}
              />
            </div>
            
            <div>
              <h3 className="font-display text-lg mb-4">Streaks & Progress</h3>
              <StreakTracker 
                currentStreak={3}
                longestStreak={7}
                activatedChakras={[0, 1, 3]}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reflection' && (
        <ReflectionTab onReflectionComplete={onChallengeComplete} />
      )}

      {activeTab === 'philosophical' && (
        <PhilosophicalTab onReflectionComplete={onChallengeComplete} />
      )}

      {activeTab === 'category-experience' && (
        <CategoryExperienceTab 
          category={selectedCategory}
        />
      )}
      
      {/* Add AI Assistant Dialog */}
      <AIAssistantDialog 
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        selectedReflectionId={selectedReflection?.id}
        reflectionContext={selectedReflection?.content}
      />
    </div>
  );
};

export default MainContent;
