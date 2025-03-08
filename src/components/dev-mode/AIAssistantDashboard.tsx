
import React, { useState } from 'react';
import { Lightbulb, X, Code, Settings, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIAssistantPanel from './AIAssistantPanel';
import AICodeAnalysisDashboard from './AICodeAnalysisDashboard';
import { aiLearningSystem } from '@/utils/ai/AIAssistantLearningSystem';

/**
 * AI Assistant Dashboard
 * 
 * A floating UI element that provides access to AI coding suggestions,
 * code analysis, and development assistance.
 */
const AIAssistantDashboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('assistant');
  
  // Skip in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  // Record the dashboard open event for learning
  const handleOpen = () => {
    setIsOpen(true);
    
    // Record this as a learning event
    aiLearningSystem.recordEvent('pattern_detected', {
      patternId: 'assistant-dashboard-open',
      timestamp: new Date()
    });
  };
  
  return (
    <>
      {!isOpen && (
        <Button
          className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 shadow-lg"
          onClick={handleOpen}
          variant="default"
        >
          <Lightbulb className="h-6 w-6" />
        </Button>
      )}
      
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[600px] h-[650px] bg-background border rounded-lg shadow-xl flex flex-col overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center">
              <Lightbulb className="h-5 w-5 mr-2" />
              <h2 className="text-lg font-medium">AI Code Assistant</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-2">
              <TabsTrigger value="assistant">
                <Code className="h-4 w-4 mr-2" />
                Assistant
              </TabsTrigger>
              <TabsTrigger value="analysis">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Code Analysis
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="assistant" className="flex-1 overflow-hidden mt-0">
              <AIAssistantPanel />
            </TabsContent>
            
            <TabsContent value="analysis" className="flex-1 overflow-hidden mt-0">
              <AICodeAnalysisDashboard />
            </TabsContent>
            
            <TabsContent value="settings" className="flex-1 overflow-auto mt-0 p-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">AI Assistant Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure how the AI assistant analyzes and improves your code.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Analysis Frequency</label>
                      <select className="w-full p-2 border rounded-md bg-background">
                        <option>On demand</option>
                        <option>Every 5 minutes</option>
                        <option>After code changes</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Suggestion Threshold</label>
                      <select className="w-full p-2 border rounded-md bg-background">
                        <option>All suggestions</option>
                        <option>Medium priority and above</option>
                        <option>High priority only</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Auto-Fix Mode</div>
                      <div className="text-sm text-muted-foreground">
                        Allow the assistant to automatically apply simple fixes
                      </div>
                    </div>
                    <div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Learning Mode</div>
                      <div className="text-sm text-muted-foreground">
                        Allow the assistant to learn from your preferences
                      </div>
                    </div>
                    <div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button className="w-full" variant="outline">
                      Reset Assistant Learning Data
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </>
  );
};

export default AIAssistantDashboard;
