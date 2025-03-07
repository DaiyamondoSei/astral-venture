
import React, { useState } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReflectionTab from '@/components/ReflectionTab';
import CategoryExperienceTab from '@/components/CategoryExperience';
import AIAssistantDialog from '@/components/ai-assistant/AIAssistantDialog';
import DashboardContent from '@/components/dashboard/DashboardContent';
import PhilosophicalTab from '@/components/dashboard/PhilosophicalTab';
import { useAuth } from '@/contexts/AuthContext';

interface MainContentProps {
  userProfile: any;
  onChallengeComplete: (pointsEarned: number) => void;
}

const MainContent = ({ userProfile, onChallengeComplete }: MainContentProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [selectedReflection, setSelectedReflection] = useState<{ id?: string, content?: string } | null>(null);
  const { user } = useAuth();

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setActiveTab('category-experience');
  };

  const handleOpenAiAssistant = (reflectionId?: string, reflectionContent?: string) => {
    setSelectedReflection({ id: reflectionId, content: reflectionContent });
    setAiDialogOpen(true);
  };

  const handleCloseAiAssistant = () => {
    setAiDialogOpen(false);
    // Reset selected reflection after dialog closes
    setTimeout(() => {
      setSelectedReflection(null);
    }, 300);
  };

  // Ensure userProfile has a fallback value
  const safeUserProfile = userProfile || {};
  const userId = user?.id || '';

  return (
    <div className="space-y-6">
      {activeTab === 'dashboard' && (
        <DashboardContent 
          userId={userId}
        />
      )}

      {activeTab === 'reflection' && (
        <ReflectionTab onReflectionComplete={onChallengeComplete} />
      )}

      {activeTab === 'philosophical' && (
        <PhilosophicalTab onReflectionComplete={onChallengeComplete} />
      )}

      {activeTab === 'category-experience' && selectedCategory && (
        <CategoryExperienceTab 
          category={selectedCategory}
        />
      )}
      
      {/* Add AI Assistant Dialog */}
      <AIAssistantDialog 
        open={aiDialogOpen}
        onOpenChange={handleCloseAiAssistant}
        selectedReflectionId={selectedReflection?.id}
        reflectionContext={selectedReflection?.content}
      />
    </div>
  );
};

export default MainContent;
