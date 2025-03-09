import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { usePerfConfig } from '@/hooks/usePerfConfig';

// Correct import for ComponentExtractor
import { ComponentExtractor } from '@/utils/ai/codeAnalysis/ComponentExtractor';

interface CodeAnalysisResult {
  componentName: string;
  complexity: number;
  dependencies: string[];
  hooks: string[];
  childComponents: string[];
}

const CodeAnalysisDashboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('analysis');
  const [analysisResults, setAnalysisResults] = useState<CodeAnalysisResult[]>([]);
  const config = usePerfConfig();

  // Skip in production or when feature is disabled
  if (process.env.NODE_ENV === 'production' || !config.enableValidation) {
    return null;
  }

  // Placeholder function to simulate code analysis
  const analyzeCode = async (code: string): Promise<CodeAnalysisResult> => {
    // Use ComponentExtractor to extract component information
    const extractor = new ComponentExtractor(code);
    const componentName = extractor.getComponentName() || 'UnknownComponent';
    const complexity = extractor.getComplexityScore() || 0;
    const dependencies = extractor.getDependencies() || [];
    const hooks = extractor.getHooks() || [];
    const childComponents = extractor.getChildComponents() || [];

    return {
      componentName,
      complexity,
      dependencies,
      hooks,
      childComponents
    };
  };

  // Simulate fetching code and analyzing it
  useEffect(() => {
    const fetchAndAnalyze = async () => {
      // Simulate fetching code from a file or component
      const codeSnippet = `
        function MyComponent({ title, description }) {
          const [count, setCount] = useState(0);
          useEffect(() => {
            document.title = \`Count: \${count}\`;
          }, [count]);

          const handleClick = () => {
            setCount(count + 1);
          };

          return (
            <div>
              <h1>{title}</h1>
              <p>{description}</p>
              <button onClick={handleClick}>Click me</button>
            </div>
          );
        }
      `;

      const result = await analyzeCode(codeSnippet);
      setAnalysisResults([result]);
    };

    fetchAndAnalyze();
  }, []);

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-80 z-50 shadow-xl overflow-hidden opacity-90 hover:opacity-100">
      <CardHeader className="p-3 bg-orange-700 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Code Analysis Dashboard</CardTitle>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-7 w-7 p-0 text-white">
              ✕
            </Button>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-1">
          <TabsList className="bg-orange-800/50 h-8">
            <TabsTrigger value="analysis" className="text-xs h-7">Analysis</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs h-7">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="p-0 h-[calc(100%-88px)]">
        <TabsContent value="analysis" className="h-full mt-0">
          <ScrollArea className="h-full p-3">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Component Analysis Results</h3>
              {analysisResults.length > 0 ? (
                analysisResults.map((result, index) => (
                  <div key={index} className="border rounded p-2 space-y-1 text-sm">
                    <div className="font-medium">{result.componentName}</div>
                    <div className="grid grid-cols-2 gap-y-1">
                      <span className="text-muted-foreground">Complexity:</span>
                      <span>{result.complexity}</span>
                      <span className="text-muted-foreground">Dependencies:</span>
                      <span>{result.dependencies.join(', ') || 'None'}</span>
                      <span className="text-muted-foreground">Hooks:</span>
                      <span>{result.hooks.join(', ') || 'None'}</span>
                      <span className="text-muted-foreground">Child Components:</span>
                      <span>{result.childComponents.join(', ') || 'None'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  No components analyzed yet
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="settings" className="h-full mt-0">
          <ScrollArea className="h-full p-3">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Settings</h3>
              <p className="text-sm text-muted-foreground">
                Configuration options for code analysis will go here.
              </p>
            </div>
          </ScrollArea>
        </TabsContent>
      </CardContent>
    </Card>
  );
};

export default CodeAnalysisDashboard;
