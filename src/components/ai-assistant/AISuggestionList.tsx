
import { useState, useEffect } from 'react';
import { useAssistant } from '@/hooks/useAssistant';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, AlertTriangle, Code, Zap, RefreshCw, Wrench } from 'lucide-react';
import { AssistantSuggestion } from './types';

export interface AISuggestionListProps {
  componentId?: string;
  limit?: number;
}

/**
 * Get color based on suggestion priority
 */
function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high':
      return 'text-red-500';
    case 'medium':
      return 'text-amber-500';
    case 'low':
      return 'text-blue-500';
    default:
      return 'text-gray-500';
  }
}

export const AISuggestionList = ({ componentId, limit = 10 }: AISuggestionListProps) => {
  const [selectedSuggestion, setSelectedSuggestion] = useState<AssistantSuggestion | null>(null);
  
  const { 
    suggestions, 
    currentComponent, 
    isAnalyzing, 
    analyzeComponent, 
    isFixing, 
    applyFix,
    applyAutoFix
  } = useAssistant({ componentName: componentId });
  
  useEffect(() => {
    if (componentId && componentId !== currentComponent) {
      analyzeComponent(componentId);
    }
  }, [componentId, currentComponent]);
  
  const handleRefresh = () => {
    if (componentId) {
      analyzeComponent(componentId);
    }
  };
  
  const handleApplyFix = async (suggestion: AssistantSuggestion) => {
    if (suggestion.autoFixAvailable) {
      await applyAutoFix(suggestion);
    }
  };
  
  const displayedSuggestions = suggestions.slice(0, limit);
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return <Zap className="h-4 w-4 mr-1" />;
      case 'optimization':
        return <Zap className="h-4 w-4 mr-1" />;
      case 'bugfix':
        return <AlertTriangle className="h-4 w-4 mr-1" />;
      case 'refactoring':
        return <Code className="h-4 w-4 mr-1" />;
      default:
        return <Code className="h-4 w-4 mr-1" />;
    }
  };
  
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <RefreshCw className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-center text-muted-foreground">
          Analyzing component code...
        </p>
      </div>
    );
  }
  
  if (displayedSuggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Check className="h-8 w-8 text-green-500 mb-2" />
        <p className="text-center text-muted-foreground">
          No suggestions found for this component.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={handleRefresh}
          disabled={isAnalyzing}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Analysis
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="text-sm font-medium">Suggestions for: </span>
          <span className="text-sm text-muted-foreground">{componentId || 'Current Component'}</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isAnalyzing}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>
      
      {displayedSuggestions.map((suggestion) => (
        <Card key={suggestion.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center">
                  {getTypeIcon(suggestion.type)}
                  <h3 className="text-sm font-medium">{suggestion.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                
                {suggestion.codeExample && (
                  <pre className="mt-2 bg-secondary p-2 rounded text-xs overflow-x-auto">
                    <code>{suggestion.codeExample}</code>
                  </pre>
                )}
                
                <div className="flex mt-2 space-x-2">
                  <Badge variant="outline" className={`text-xs ${getPriorityColor(suggestion.priority)}`}>
                    {suggestion.priority} priority
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {suggestion.type}
                  </Badge>
                </div>
              </div>
              
              {suggestion.autoFixAvailable && (
                <Button 
                  size="sm" 
                  onClick={() => handleApplyFix(suggestion)}
                  disabled={isFixing}
                  className="ml-2 shrink-0"
                >
                  <Wrench className="h-4 w-4 mr-1" />
                  Fix
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AISuggestionList;
