
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { askAIAssistant, AIResponse } from '@/services/ai/aiService';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, MessageCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmitQuestion = async () => {
    if (!question.trim() || !user) return;
    
    setLoading(true);
    try {
      const aiResponse = await askAIAssistant({
        question,
        context: reflectionContext,
        reflectionIds: selectedReflectionId ? [selectedReflectionId] : undefined
      }, user.id);
      
      setResponse(aiResponse);
    } catch (error) {
      console.error('Error submitting question:', error);
      toast({
        title: "Couldn't connect to AI assistant",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setQuestion('');
    setResponse(null);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) reset();
      onOpenChange(newOpen);
    }}>
      <DialogContent className="glass-card-dark max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-display flex items-center gap-2">
            <Sparkles size={18} className="text-quantum-400" />
            Quantum AI Guide
          </DialogTitle>
          <DialogDescription>
            Ask questions about your experiences or seek guidance for your practice
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {!response ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                What would you like to ask about your energy practice or experiences?
              </div>
              
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="E.g., What might be causing the tingling sensation during meditation? or What practices would help balance my throat chakra?"
                className="bg-black/20 border-white/10 min-h-[100px]"
              />
              
              {reflectionContext && (
                <div className="text-xs text-white/60 italic">
                  Your question will be analyzed in the context of the selected reflection.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                <div className="flex items-start gap-3">
                  <MessageCircle className="text-quantum-400 mt-1" size={18} />
                  <div className="text-white/90">{response.answer}</div>
                </div>
              </div>
              
              {response.suggestedPractices && response.suggestedPractices.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-white/80">Suggested Practices:</h4>
                  <ul className="space-y-1">
                    {response.suggestedPractices.map((practice, i) => (
                      <li key={i} className="text-sm text-white/70 flex items-center gap-2">
                        <Sparkles size={12} className="text-quantum-400" />
                        {practice}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <Button 
                variant="outline" 
                className="w-full border-white/10"
                onClick={reset}
              >
                Ask Another Question
              </Button>
            </div>
          )}
        </div>
        
        {!response && (
          <DialogFooter>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-quantum-400 to-quantum-700"
              onClick={handleSubmitQuestion}
              disabled={loading || !question.trim() || !user}
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
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AIAssistantDialog;
