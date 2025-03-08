
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Code, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAICodeAssistant } from '@/hooks/useAICodeAssistant';
import { AssistantSuggestion } from '@/utils/ai/AICodeAssistant';
import { aiLearningSystem } from '@/utils/ai/AIAssistantLearningSystem';
import { Skeleton } from '@/components/ui/skeleton';

interface AISuggestionListProps {
  componentName?: string;
  maxItems?: number;
  category?: 'performance' | 'quality' | 'architecture' | 'refactoring';
}

const AISuggestionList: React.FC<AISuggestionListProps> = ({
  componentName,
  maxItems = 5,
  category
}) => {
  const { 
    suggestions, 
    loading, 
    refreshSuggestions,
    applyAutoFix,
    lastUpdated
  } = useAICodeAssistant(componentName);
  
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  
  // Filter suggestions based on category if provided
  const filteredSuggestions = category 
    ? suggestions.filter(s => s.type === category)
    : suggestions;
  
  // Get top N suggestions
  const topSuggestions = filteredSuggestions.slice(0, maxItems);
  
  const handleApplyFix = (suggestionId: string) => {
    const success = applyAutoFix(suggestionId);
    
    if (success) {
      // Record the learning event
      aiLearningSystem.recordEvent('suggestion_accepted', {
        suggestionId,
        patternId: suggestionId.split('-')[0],
        componentName
      });
    }
  };
  
  const handleRejectSuggestion = (suggestionId: string) => {
    // Record the learning event
    aiLearningSystem.recordEvent('suggestion_rejected', {
      suggestionId,
      patternId: suggestionId.split('-')[0],
      componentName
    });
    
    // Hide the suggestion by setting state
    setExpanded(prev => ({
      ...prev,
      [suggestionId]: false
    }));
  };
  
  const toggleExpand = (suggestionId: string) => {
    setExpanded(prev => ({
      ...prev,
      [suggestionId]: !prev[suggestionId]
    }));
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (topSuggestions.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">No suggestions available</p>
        {componentName && (
          <p className="text-sm text-muted-foreground">
            There are no suggestions for component: {componentName}
          </p>
        )}
        <Button variant="outline" size="sm" onClick={refreshSuggestions}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Suggestions
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">
            AI Code Suggestions
            {componentName && <span className="text-sm text-muted-foreground ml-2">for {componentName}</span>}
          </h3>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={refreshSuggestions}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {topSuggestions.map((suggestion) => (
        <SuggestionCard 
          key={suggestion.id}
          suggestion={suggestion}
          expanded={expanded[suggestion.id] || false}
          onToggleExpand={() => toggleExpand(suggestion.id)}
          onApplyFix={() => handleApplyFix(suggestion.id)}
          onReject={() => handleRejectSuggestion(suggestion.id)}
        />
      ))}
      
      {filteredSuggestions.length > maxItems && (
        <div className="text-center pt-2">
          <Button variant="ghost" size="sm">
            Show {filteredSuggestions.length - maxItems} more suggestions
          </Button>
        </div>
      )}
    </div>
  );
};

interface SuggestionCardProps {
  suggestion: AssistantSuggestion;
  expanded: boolean;
  onToggleExpand: () => void;
  onApplyFix: () => void;
  onReject: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  expanded,
  onToggleExpand,
  onApplyFix,
  onReject
}) => {
  // Determine card color based on priority
  const getBorderColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500';
      case 'high': return 'border-orange-500';
      case 'medium': return 'border-yellow-500';
      case 'low': return 'border-green-500';
      default: return '';
    }
  };
  
  return (
    <Card className={`overflow-hidden ${getBorderColor(suggestion.priority)} border-l-4`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{suggestion.title}</CardTitle>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" onClick={onReject}>
              <ThumbsDown className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onToggleExpand}>
              {expanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
        <CardDescription>
          {suggestion.context.component && (
            <span className="text-xs bg-muted px-2 py-1 rounded">
              {suggestion.context.component}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{suggestion.description}</p>
        
        {expanded && suggestion.codeExample && (
          <div className="mt-4 bg-muted p-3 rounded text-xs font-mono overflow-x-auto">
            <pre>{suggestion.codeExample}</pre>
          </div>
        )}
      </CardContent>
      {expanded && (
        <CardFooter className="flex justify-between pt-0">
          <div className="text-xs text-muted-foreground">
            {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)} / 
            {suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1)} priority
          </div>
          {suggestion.autoFixAvailable && (
            <Button size="sm" onClick={onApplyFix}>
              <Zap className="h-4 w-4 mr-2" />
              Apply Fix
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default AISuggestionList;
