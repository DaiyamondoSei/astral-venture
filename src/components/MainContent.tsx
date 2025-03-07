
import React, { useState, useCallback } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReflectionTab from '@/components/ReflectionTab';
import CategoryExperienceTab from '@/components/CategoryExperience';
import AIAssistantDialog from '@/components/ai-assistant/AIAssistantDialog';
import DashboardContent from '@/components/dashboard/DashboardContent';
import PhilosophicalTab from '@/components/dashboard/PhilosophicalTab';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardProvider } from '@/components/dashboard/DashboardContext';

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

  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
    setActiveTab('category-experience');
  }, []);

  const handleOpenAiAssistant = useCallback((reflectionId?: string, reflectionContent?: string) => {
    setSelectedReflection({ 
      id: reflectionId || undefined, 
      content: reflectionContent || undefined 
    });
    setAiDialogOpen(true);
  }, []);

  const handleCloseAiAssistant = useCallback(() => {
    setAiDialogOpen(false);
    // Reset selected reflection after dialog closes
    setTimeout(() => {
      setSelectedReflection(null);
    }, 300);
  }, []);

  // Ensure userProfile has a fallback value
  const safeUserProfile = userProfile || {};
  const userId = user?.id || '';

  return (
    <div className="space-y-6">
      {activeTab === 'dashboard' && (
        <DashboardProvider onOpenAIAssistant={handleOpenAiAssistant}>
          <DashboardContent userId={userId} />
        </DashboardProvider>
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
