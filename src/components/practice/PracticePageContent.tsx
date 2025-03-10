
import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { usePracticeSystem } from '@/hooks/usePracticeSystem';
import PracticeList from '@/components/practice/PracticeList';
import PracticeDetail from '@/components/practice/PracticeDetail';
import { usePerformanceTracking } from '@/hooks/usePerformanceTracking';
import { ErrorBoundary } from '@/components/error-handling';

const LoadingIndicator = () => (
  <div className="flex items-center justify-center h-screen">
    <Loader className="h-8 w-8 text-purple-500 animate-spin" />
  </div>
);

const ErrorDisplay = ({ error }: { error: string }) => (
  <div className="flex items-center justify-center h-screen text-center">
    <div>
      <h2 className="text-xl font-semibold text-red-500 mb-2">Error Loading Practices</h2>
      <p className="text-gray-700">{error}</p>
    </div>
  </div>
);

const PracticePageContent: React.FC = () => {
  const { startInteractionTiming } = usePerformanceTracking('PracticePageContent', {
    autoStart: true,
    logSlowRenders: true,
    trackInteractions: true
  });
  
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
  
  // Handle practice selection with performance tracking
  const handleSelectPractice = async (id: string) => {
    const endTiming = startInteractionTiming('select-practice');
    try {
      await selectPractice(id);
      setShowDetail(true);
    } finally {
      endTiming();
    }
  };
  
  // Handle practice completion with performance tracking
  const handleComplete = async (duration: number, reflection?: string) => {
    if (!selectedPractice) return;
    
    const endTiming = startInteractionTiming('complete-practice');
    try {
      const success = await completePractice(selectedPractice.id, duration, reflection);
      if (success) {
        // Briefly delay going back to list to show completion
        setTimeout(() => {
          setShowDetail(false);
          // Refresh data to show updated completions
          refreshData();
        }, 1000);
      }
    } finally {
      endTiming();
    }
  };
  
  // Handle back navigation
  const handleBack = () => {
    const endTiming = startInteractionTiming('navigation-back');
    setShowDetail(false);
    endTiming();
  };
  
  // Get completed practice IDs
  const completedPracticeIds = completedPractices.map(c => c.practiceId);
  
  // Loading state
  if (isLoading && !showDetail) {
    return <LoadingIndicator />;
  }
  
  // Error state
  if (error && !showDetail) {
    return <ErrorDisplay error={error} />;
  }
  
  return (
    <ErrorBoundary fallback={<ErrorDisplay error="Something went wrong displaying practices" />}>
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
    </ErrorBoundary>
  );
};

export default PracticePageContent;
