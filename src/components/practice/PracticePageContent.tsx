
import React, { useState } from 'react';
import { Loader } from 'lucide-react';
import { usePracticeSystem } from '@/hooks/usePracticeSystem';
import PracticeList from '@/components/practice/PracticeList';
import PracticeDetail from '@/components/practice/PracticeDetail';

const PracticePageContent: React.FC = () => {
  const { 
    practices, 
    selectedPractice, 
    progress, 
    completedPractices,
    isLoading, 
    error, 
    selectPractice, 
    completePractice,
    refreshData
  } = usePracticeSystem();
  
  const [showDetail, setShowDetail] = useState(false);
  
  // Handle practice selection
  const handleSelectPractice = async (id: string) => {
    await selectPractice(id);
    setShowDetail(true);
  };
  
  // Handle practice completion
  const handleComplete = async (duration: number, reflection?: string) => {
    if (selectedPractice) {
      const success = await completePractice(duration, reflection);
      if (success) {
        // Briefly delay going back to list to show completion
        setTimeout(() => {
          setShowDetail(false);
          // Refresh data to show updated completions
          refreshData();
        }, 1000);
      }
    }
  };
  
  // Handle back navigation
  const handleBack = () => {
    setShowDetail(false);
  };
  
  // Get completed practice IDs
  const completedPracticeIds = completedPractices.map(c => c.practiceId);
  
  // Loading state
  if (isLoading && !showDetail) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-8 w-8 text-purple-500 animate-spin" />
      </div>
    );
  }
  
  // Error state
  if (error && !showDetail) {
    return (
      <div className="flex items-center justify-center h-screen text-center">
        <div>
          <h2 className="text-xl font-semibold text-red-500 mb-2">Error Loading Practices</h2>
          <p className="text-white/70">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {showDetail && selectedPractice ? (
        <PracticeDetail
          practice={selectedPractice}
          onBack={handleBack}
          onComplete={handleComplete}
        />
      ) : (
        <PracticeList
          practices={practices}
          completedPracticeIds={completedPracticeIds}
          progress={progress}
          onSelectPractice={handleSelectPractice}
        />
      )}
    </>
  );
};

export default PracticePageContent;
