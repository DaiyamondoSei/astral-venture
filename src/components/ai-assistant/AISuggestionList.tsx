
import React from 'react';
import { useAssistant } from '@/hooks/useAssistant';
import { AssistantSuggestion } from './types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, RefreshCw, Code, Wrench } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export interface AISuggestionListProps {
  componentId?: string;
  limit?: number;
}

export const AISuggestionList: React.FC<AISuggestionListProps> = ({
  componentId,
  limit = 5
}) => {
  const { 
    suggestions, 
    isAnalyzing, 
    analyzeComponent, 
    implementSuggestion, 
    dismissSuggestion,
    applyFix,
    loading,
    applyAutoFix,
    lastUpdated
  } = useAssistant();

  // Filter suggestions by component if provided
  const filteredSuggestions = componentId 
    ? suggestions.filter(s => s.context.component === componentId) 
    : suggestions;

  // Limit the number of suggestions shown
  const limitedSuggestions = filteredSuggestions.slice(0, limit);

  const handleAnalyze = () => {
    if (componentId) {
      analyzeComponent(componentId);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (isAnalyzing || loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Analyzing...</h3>
          <RefreshCw className="animate-spin h-5 w-5" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="mb-4">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-3/4" />
            </CardContent>
            <CardFooter className="pt-0">
              <Skeleton className="h-9 w-20 mr-2" />
              <Skeleton className="h-9 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredSuggestions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Suggestions</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAnalyze}
          >
            Analyze Component
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No suggestions available for this component.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Run analysis to generate improvement suggestions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Suggestions</h3>
        <div className="flex gap-2 items-center">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAnalyze}
          >
            Refresh Analysis
          </Button>
        </div>
      </div>
      
      {limitedSuggestions.map((suggestion) => (
        <SuggestionCard 
          key={suggestion.id} 
          suggestion={suggestion} 
          onImplement={implementSuggestion}
          onDismiss={dismissSuggestion}
          onApplyFix={applyFix}
          onApplyAutoFix={applyAutoFix}
        />
      ))}
      
      {filteredSuggestions.length > limit && (
        <div className="text-center mt-2">
          <Button variant="link" size="sm">
            Show {filteredSuggestions.length - limit} more suggestions
          </Button>
        </div>
      )}
    </div>
  );
};

interface SuggestionCardProps {
  suggestion: AssistantSuggestion;
  onImplement: (suggestion: AssistantSuggestion) => Promise<void>;
  onDismiss: (suggestionId: string) => void;
  onApplyFix: (suggestion: AssistantSuggestion) => Promise<boolean>;
  onApplyAutoFix?: (suggestion: AssistantSuggestion) => Promise<boolean>;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  onImplement,
  onDismiss,
  onApplyFix,
  onApplyAutoFix
}) => {
  const [isImplementing, setIsImplementing] = React.useState(false);
  const [isApplying, setIsApplying] = React.useState(false);
  
  const handleImplement = async () => {
    setIsImplementing(true);
    try {
      await onImplement(suggestion);
    } catch (error) {
      console.error('Error implementing suggestion:', error);
    } finally {
      setIsImplementing(false);
    }
  };
  
  const handleApplyFix = async () => {
    setIsApplying(true);
    try {
      await onApplyFix(suggestion);
    } catch (error) {
      console.error('Error applying fix:', error);
    } finally {
      setIsApplying(false);
    }
  };
  
  const handleApplyAutoFix = async () => {
    if (!onApplyAutoFix) return;
    
    setIsApplying(true);
    try {
      await onApplyAutoFix(suggestion);
    } catch (error) {
      console.error('Error applying auto fix:', error);
    } finally {
      setIsApplying(false);
    }
  };
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{suggestion.title}</CardTitle>
          <Badge className={`${getPriorityColor(suggestion.priority)} text-white`}>
            {suggestion.priority}
          </Badge>
        </div>
        <CardDescription>
          {suggestion.component && (
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded mr-2">
              {suggestion.component}
            </span>
          )}
          <span className="text-xs">{suggestion.type}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{suggestion.description}</p>
        {suggestion.codeExample && (
          <div className="bg-muted p-2 rounded mt-2 text-xs font-mono overflow-x-auto">
            <pre>{suggestion.codeExample}</pre>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex gap-2">
          {suggestion.autoFixAvailable && onApplyAutoFix && (
            <Button 
              variant="default" 
              size="sm"
              onClick={handleApplyAutoFix}
              disabled={isApplying || isImplementing}
            >
              {isApplying ? <RefreshCw className="mr-1 h-3 w-3 animate-spin" /> : <Wrench className="mr-1 h-3 w-3" />}
              Auto Fix
            </Button>
          )}
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleApplyFix}
            disabled={isApplying || isImplementing}
          >
            {isApplying ? <RefreshCw className="mr-1 h-3 w-3 animate-spin" /> : <Code className="mr-1 h-3 w-3" />}
            Apply Fix
          </Button>
          <Button 
            variant={suggestion.status === 'implemented' ? 'ghost' : 'outline'}
            size="sm"
            onClick={handleImplement}
            disabled={isImplementing || suggestion.status === 'implemented'}
          >
            {isImplementing ? (
              <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
            ) : suggestion.status === 'implemented' ? (
              <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
            ) : (
              <CheckCircle className="mr-1 h-3 w-3" />
            )}
            {suggestion.status === 'implemented' ? 'Implemented' : 'Implement'}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDismiss(suggestion.id)}
            disabled={isImplementing}
          >
            <AlertCircle className="mr-1 h-3 w-3" />
            Dismiss
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AISuggestionList;
