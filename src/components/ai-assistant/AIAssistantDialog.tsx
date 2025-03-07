
import React, { useEffect } from 'react';
import { 
  Dialog, 
  DialogContent
} from '@/components/ui/dialog';
import DialogHeader from './dialog/DialogHeader';
import QuestionForm from './dialog/QuestionForm';
import AIResponse from './dialog/AIResponse';
import useAIAssistant from './hooks/useAIAssistant';

interface AIAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedReflectionId?: string;
  reflectionContext?: string;
}

const AIAssistantDialog: React.FC<AIAssistantDialogProps> = ({
  open,
  onOpenChange,
  selectedReflectionId,
  reflectionContext
}) => {
  const {
    question,
    setQuestion,
    response,
    loading,
    error,
    handleSubmitQuestion,
    reset,
    user,
    streamingResponse,
    modelInfo
  } = useAIAssistant({
    reflectionContext,
    selectedReflectionId,
    open
  });

  // Handle escape key to close dialog when not loading
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onOpenChange(false);
      }
    };
    
    if (open) {
      window.addEventListener('keydown', handleEscapeKey);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [open, loading, onOpenChange]);

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
    }
  };

  // Check if we're in offline mode
  const isOffline = !navigator.onLine;

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!newOpen && !loading) {
          handleClose();
        }
      }}
    >
      <DialogContent className="glass-card-dark max-w-md sm:max-w-lg">
        <DialogHeader onClose={handleClose} loading={loading} />
        
        <div className="space-y-4 py-2">
          {/* Show warning if offline */}
          {isOffline && (
            <div className="bg-amber-800/20 border border-amber-600/30 text-amber-200 px-3 py-2 rounded-md text-sm flex items-center space-x-2 mb-4">
              <span className="flex-shrink-0">⚠️</span>
              <span>You're offline. Limited functionality is available.</span>
            </div>
          )}
          
          {!response ? (
            <QuestionForm
              question={question}
              onQuestionChange={setQuestion}
              onSubmit={handleSubmitQuestion}
              loading={loading}
              error={error}
              reflectionContext={reflectionContext}
              isUserLoggedIn={!!user}
              streamingResponse={streamingResponse}
            />
          ) : (
            <AIResponse
              response={response}
              onReset={reset}
              loading={loading}
              modelInfo={modelInfo}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIAssistantDialog;
