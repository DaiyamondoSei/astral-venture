
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2 } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';

interface QuestionFormProps {
  question: string;
  onQuestionChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  reflectionContext?: string;
  isUserLoggedIn: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  question,
  onQuestionChange,
  onSubmit,
  loading,
  error,
  reflectionContext,
  isUserLoggedIn
}) => {
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        What would you like to ask about your energy practice or experiences?
      </div>
      
      <Textarea
        value={question}
        onChange={(e) => onQuestionChange(e.target.value)}
        placeholder="E.g., What might be causing the tingling sensation during meditation? or What practices would help balance my throat chakra?"
        className="bg-black/20 border-white/10 min-h-[100px]"
        disabled={loading}
      />
      
      {reflectionContext && (
        <div className="text-xs text-white/60 italic">
          Your question will be analyzed in the context of the selected reflection.
        </div>
      )}
      
      {error && (
        <div className="text-sm text-red-400">
          {error}. Please try again.
        </div>
      )}

      <DialogFooter>
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-quantum-400 to-quantum-700"
          onClick={onSubmit}
          disabled={loading || !question.trim() || !isUserLoggedIn}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={16} className="mr-2" />
              Ask Quantum Guide
            </>
          )}
        </Button>
      </DialogFooter>
    </div>
  );
};

export default QuestionForm;
