
import React from 'react';
import { useReflectionForm } from '@/hooks/useReflectionForm';
import ReflectionInstructions from './reflection/ReflectionInstructions';
import ReflectionFormInput from './reflection/ReflectionFormInput';
import ReflectionPromptSuggestions from './reflection/ReflectionPromptSuggestions';
import ReflectionAnalytics from './reflection/ReflectionAnalytics';

interface EnergyReflectionFormProps {
  onReflectionComplete?: (pointsEarned: number, emotionalInsights?: any) => void;
}

const EnergyReflectionForm = ({ onReflectionComplete }: EnergyReflectionFormProps) => {
  const {
    reflection,
    setReflection,
    isSubmitting,
    promptVisible,
    togglePromptVisibility,
    handlePromptSelect,
    handleSubmit,
    showAnalytics,
    lastReflection,
    setShowAnalytics
  } = useReflectionForm(onReflectionComplete);

  return (
    <div className="glass-card p-5">
      <ReflectionInstructions />
      
      <div className="mb-4 flex justify-end">
        <button 
          type="button"
          onClick={togglePromptVisibility}
          className="text-xs text-quantum-400 hover:underline flex items-center"
        >
          {promptVisible ? "Hide Prompts" : "Need Inspiration?"}
        </button>
      </div>
      
      {promptVisible && (
        <ReflectionPromptSuggestions onSelectPrompt={handlePromptSelect} />
      )}
      
      <ReflectionFormInput
        reflection={reflection}
        setReflection={setReflection}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
      
      {showAnalytics && lastReflection && (
        <div className="mt-5">
          <ReflectionAnalytics 
            reflections={[lastReflection]} 
            onRefresh={() => setShowAnalytics(false)}
          />
        </div>
      )}
    </div>
  );
};

export default EnergyReflectionForm;
