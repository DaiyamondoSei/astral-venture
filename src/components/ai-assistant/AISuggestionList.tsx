
import React from 'react';
import { useAICodeAssistant } from '@/hooks/useAICodeAssistant';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Lightbulb, 
  Code, 
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader,
  CardTitle 
} from '@/components/ui/card';

interface AISuggestionListProps {
  componentName?: string;
  maxItems?: number;
  compact?: boolean;
}

export const AISuggestionList: React.FC<AISuggestionListProps> = ({
  componentName,
  maxItems = 5,
  compact = false
}) => {
  const { 
    suggestions, 
    loading,
    lastUpdated,
    applyAutoFix,
    refreshSuggestions
  } = useAICodeAssistant(componentName, {
    autoRefresh: true,
    refreshInterval: 30000 // 30 seconds
  });
  
  const getIconForType = (type: string) => {
    switch (type) {
      case 'performance':
        return <AlertTriangle className="text-amber-500" />;
      case 'quality':
        return <Lightbulb className="text-blue-500" />;
      case 'architecture':
        return <Code className="text-purple-500" />;
      case 'refactoring':
        return <ArrowRight className="text-green-500" />;
      default:
        return <Lightbulb className="text-blue-500" />;
    }
  };
  
  const displayedSuggestions = suggestions.slice(0, maxItems);
  
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">AI Suggestions</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refreshSuggestions}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
        
        {loading ? (
          <div className="animate-pulse space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 dark:bg-gray-800 rounded"></div>
            ))}
          </div>
        ) : displayedSuggestions.length === 0 ? (
          <div className="text-sm text-muted-foreground p-2">
            No suggestions for this component
          </div>
        ) : (
          <ul className="space-y-1">
            {displayedSuggestions.map(suggestion => (
              <li key={suggestion.id} className="flex items-center gap-2 p-2 text-sm hover:bg-secondary rounded-md">
                {getIconForType(suggestion.type)}
                <span className="flex-1 truncate">{suggestion.title}</span>
                {suggestion.autoFixAvailable && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => applyAutoFix(suggestion.id)}
                  >
                    Apply
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>AI Code Suggestions</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshSuggestions}
            disabled={loading}
          >
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          {componentName 
            ? `Suggestions for ${componentName}` 
            : "Suggestions for your codebase"}
          {lastUpdated && (
            <span className="text-xs ml-2 text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : displayedSuggestions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500 opacity-50" />
            <p>No suggestions available for {componentName || "your codebase"}</p>
            <p className="text-sm">Everything looks good!</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {displayedSuggestions.map(suggestion => (
              <li key={suggestion.id} className="border rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getIconForType(suggestion.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{suggestion.title}</h4>
                    <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                    
                    {suggestion.codeExample && (
                      <pre className="mt-2 p-2 text-xs bg-muted rounded overflow-x-auto">
                        <code>{suggestion.codeExample}</code>
                      </pre>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      disabled={!suggestion.autoFixAvailable}
                      onClick={() => suggestion.autoFixAvailable && applyAutoFix(suggestion.id)}
                    >
                      Apply Fix
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      
      {displayedSuggestions.length > 0 && (
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {displayedSuggestions.length} of {suggestions.length} suggestions
          </div>
          {suggestions.length > maxItems && (
            <Button variant="link" size="sm">
              View All
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default AISuggestionList;
