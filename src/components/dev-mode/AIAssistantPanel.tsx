
import React, { useState } from 'react';
import { useAICodeAssistant } from '@/hooks/useAICodeAssistant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AISuggestionList from '@/components/ai-assistant/AISuggestionList';
import { 
  RefreshCw, 
  Zap, 
  List, 
  Code, 
  Lightbulb, 
  XCircle 
} from 'lucide-react';

interface AIAssistantPanelProps {
  onClose?: () => void;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ onClose }) => {
  const [activeComponent, setActiveComponent] = useState<string>('');
  const [intentDescription, setIntentDescription] = useState<string>('');
  
  const { 
    intents, 
    suggestions, 
    registerIntent,
    refreshSuggestions,
    markIntentImplemented,
    markIntentAbandoned
  } = useAICodeAssistant(activeComponent);
  
  const handleCreateIntent = () => {
    if (intentDescription.trim()) {
      registerIntent(intentDescription, activeComponent ? [activeComponent] : []);
      setIntentDescription('');
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-medium">AI Code Assistant</h2>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XCircle className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="p-4 border-b">
        <div className="flex gap-2 mb-4">
          <Input 
            placeholder="Focused component name..."
            value={activeComponent}
            onChange={e => setActiveComponent(e.target.value)}
            className="flex-1"
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refreshSuggestions()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Input 
            placeholder="What are you working on?"
            value={intentDescription}
            onChange={e => setIntentDescription(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleCreateIntent}>
            <Zap className="h-4 w-4 mr-2" />
            Track Intent
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="suggestions" className="h-full">
          <TabsList className="w-full grid grid-cols-3 mb-2">
            <TabsTrigger value="suggestions">
              <Lightbulb className="h-4 w-4 mr-2" />
              Suggestions
            </TabsTrigger>
            <TabsTrigger value="intents">
              <List className="h-4 w-4 mr-2" />
              Intents
            </TabsTrigger>
            <TabsTrigger value="implementations">
              <Code className="h-4 w-4 mr-2" />
              Code Actions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="suggestions" className="p-4 h-full overflow-auto">
            <AISuggestionList 
              componentName={activeComponent || undefined} 
              maxItems={10}
            />
          </TabsContent>
          
          <TabsContent value="intents" className="p-4 h-full overflow-auto">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Development Intents</h3>
              
              {intents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No development intents registered yet</p>
                  <p className="text-sm">Use "Track Intent" to document what you're working on</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {intents.map(intent => (
                    <li key={intent.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{intent.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            Created: {new Date(intent.createdAt).toLocaleString()}
                          </p>
                          {intent.relatedComponents.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {intent.relatedComponents.map(comp => (
                                <span 
                                  key={comp} 
                                  className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded"
                                >
                                  {comp}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => markIntentImplemented(intent.id)}
                            disabled={intent.status !== 'pending'}
                          >
                            Complete
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => markIntentAbandoned(intent.id)}
                            disabled={intent.status !== 'pending'}
                          >
                            Abandon
                          </Button>
                        </div>
                      </div>
                      
                      {intent.status !== 'pending' && (
                        <div className="mt-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            intent.status === 'implemented' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          }`}>
                            {intent.status.replace('-', ' ')}
                          </span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="implementations" className="p-4 h-full overflow-auto">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Available Code Actions</h3>
              
              {suggestions.filter(s => s.autoFixAvailable).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No automated code actions available</p>
                  <p className="text-sm">Actions will appear here when auto-fixes are available</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {suggestions
                    .filter(s => s.autoFixAvailable)
                    .map(suggestion => (
                      <li key={suggestion.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{suggestion.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Component: {suggestion.context.component || 'Global'}
                            </p>
                          </div>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => refreshSuggestions()}
                          >
                            Apply Fix
                          </Button>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIAssistantPanel;
