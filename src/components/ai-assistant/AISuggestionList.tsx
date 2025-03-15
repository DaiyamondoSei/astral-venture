
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAssistant } from '@/hooks/useAssistant';
import { Loader2, CheckCircle, Code } from 'lucide-react';
import { AssistantSuggestion } from '@/services/ai/types';

interface AISuggestionListProps {
  onSelect?: (suggestion: AssistantSuggestion) => void;
}

export const AISuggestionList: React.FC<AISuggestionListProps> = ({ onSelect }) => {
  const { 
    suggestions,
    isFixing,
    isAnalyzing,
    applyAutoFix,
    applyFix 
  } = useAssistant();

  const handleFixClick = async (suggestion: AssistantSuggestion) => {
    await applyFix(suggestion);
    if (onSelect) {
      onSelect(suggestion);
    }
  };

  const handleQuickFixClick = async (suggestionId: string) => {
    await applyAutoFix(suggestionId);
  };

  if (isAnalyzing) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Code Analysis</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Analyzing your code...</p>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Code Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No suggestions found. Your code looks great!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">Enhancement Suggestions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{suggestion.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {suggestion.description}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {suggestion.status === 'implemented' ? (
                    <CheckCircle className="text-green-500 h-5 w-5" />
                  ) : (
                    <>
                      {suggestion.autoFixAvailable && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleQuickFixClick(suggestion.id)}
                          disabled={isFixing}
                        >
                          {isFixing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>Quick Fix</>
                          )}
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => handleFixClick(suggestion)}
                        disabled={isFixing}
                      >
                        {isFixing ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Code className="h-4 w-4 mr-2" />
                        )}
                        Fix
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {/* Show code example if available */}
              {suggestion.codeExample && (
                <div className="mt-2 p-2 bg-muted/50 rounded-md">
                  <pre className="text-xs overflow-x-auto">
                    <code>{suggestion.codeExample}</code>
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AISuggestionList;
