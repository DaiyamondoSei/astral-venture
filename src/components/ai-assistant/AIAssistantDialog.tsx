
import React from 'react';
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
    user
  } = useAIAssistant({
    reflectionContext,
    selectedReflectionId,
    open
  });

  const handleClose = () => {
    onOpenChange(false);
  };

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
          {!response ? (
            <QuestionForm
              question={question}
              onQuestionChange={setQuestion}
              onSubmit={handleSubmitQuestion}
              loading={loading}
              error={error}
              reflectionContext={reflectionContext}
              isUserLoggedIn={!!user}
            />
          ) : (
            <AIResponse
              response={response}
              onReset={reset}
              loading={loading}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIAssistantDialog;
