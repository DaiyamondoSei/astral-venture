
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronRight, Code, Zap, FileCode, RefreshCw, Activity } from 'lucide-react';
import { patternAnalyzer, PatternMatch } from '@/utils/ai/codeAnalysis/PatternAnalyzer';
import { componentExtractor, ExtractComponentOptions } from '@/utils/ai/codeAnalysis/ComponentExtractor';
import { aiLearningSystem } from '@/utils/ai/AIAssistantLearningSystem';
import { devLogger } from '@/utils/debugUtils';

interface AICodeAnalysisDashboardProps {
  onClose?: () => void;
}

const AICodeAnalysisDashboard: React.FC<AICodeAnalysisDashboardProps> = ({
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('patterns');
  const [patternMatches, setPatternMatches] = useState<PatternMatch[]>([]);
  const [extractionSuggestions, setExtractionSuggestions] = useState<ExtractComponentOptions[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [learningStats, setLearningStats] = useState<any>(null);
  
  useEffect(() => {
    // Initial analysis on mount
    performAnalysis();
    
    // Get learning stats
    setLearningStats(aiLearningSystem.getSummaryStats());
  }, []);
  
  const performAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // This would actually analyze the codebase
      // For now, we'll just simulate some pattern matches
      await simulateAnalysis();
      
      // Update learning stats
      setLearningStats(aiLearningSystem.getSummaryStats());
    } catch (error) {
      devLogger.error('AICodeAnalysis', `Error performing analysis: ${error}`);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // This simulates analyzing the codebase
  // In a real implementation, this would scan files
  const simulateAnalysis = async () => {
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate finding some pattern matches
    const mockMatches: PatternMatch[] = [
      {
        patternId: 'large-component',
        file: 'src/components/SacredHomePage.tsx',
        lineStart: 120,
        lineEnd: 250,
        autoFixable: false
      },
      {
        patternId: 'excessive-usestate',
        file: 'src/hooks/useAICodeAssistant.ts',
        lineStart: 15,
        lineEnd: 30,
        autoFixable: false
      },
      {
        patternId: 'missing-memo',
        file: 'src/components/reflection/ReflectionHistoryInsights.tsx',
        autoFixable: true
      }
    ];
    
    // Simulate extraction suggestions
    const mockExtractions: ExtractComponentOptions[] = [
      {
        componentName: 'ChakraVisualization',
        startLine: 150,
        endLine: 220,
        props: ['activatedChakras', 'onChakraClick', 'energyPoints']
      },
      {
        componentName: 'ProfileHeader',
        startLine: 85,
        endLine: 125,
        props: ['userProfile', 'userStreak']
      }
    ];
    
    setPatternMatches(mockMatches);
    setExtractionSuggestions(mockExtractions);
  };
  
  const handleApplyFix = (match: PatternMatch) => {
    // In a real implementation, this would apply the fix
    console.log(`Applying fix for pattern ${match.patternId} in ${match.file}`);
    
    // Record learning event
    aiLearningSystem.recordEvent('recommendation_applied', {
      patternId: match.patternId,
      file: match.file
    });
    
    // Remove from list
    setPatternMatches(matches => 
      matches.filter(m => !(m.patternId === match.patternId && m.file === match.file))
    );
  };
  
  const handleExtractComponent = (extraction: ExtractComponentOptions) => {
    // In a real implementation, this would extract the component
    console.log(`Extracting component ${extraction.componentName} from lines ${extraction.startLine}-${extraction.endLine}`);
    
    // Record learning event
    aiLearningSystem.recordEvent('recommendation_applied', {
      patternId: 'component-extraction',
      componentName: extraction.componentName
    });
    
    // Remove from list
    setExtractionSuggestions(suggestions => 
      suggestions.filter(s => s.componentName !== extraction.componentName)
    );
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-medium flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          AI Code Analysis Dashboard
        </h2>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 pt-4 border-b">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="patterns">
              <Code className="h-4 w-4 mr-2" />
              Code Patterns
            </TabsTrigger>
            <TabsTrigger value="refactoring">
              <FileCode className="h-4 w-4 mr-2" />
              Refactoring
            </TabsTrigger>
            <TabsTrigger value="stats">
              <Activity className="h-4 w-4 mr-2" />
              Learning Stats
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-medium">
              {activeTab === 'patterns' && 'Code Pattern Analysis'}
              {activeTab === 'refactoring' && 'Suggested Refactorings'}
              {activeTab === 'stats' && 'AI Learning Statistics'}
            </h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={performAnalysis}
              disabled={isAnalyzing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
            </Button>
          </div>
          
          <TabsContent value="patterns" className="mt-0">
            {patternMatches.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No code patterns detected</p>
                <p className="text-sm">Run analysis to find potential improvements</p>
              </div>
            ) : (
              <div className="space-y-4">
                {patternMatches.map((match, idx) => {
                  const pattern = patternAnalyzer.getPattern(match.patternId);
                  return (
                    <Card key={`${match.patternId}-${idx}`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex justify-between">
                          <span>{pattern?.name || match.patternId}</span>
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            {pattern?.severity || 'medium'}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-2">{pattern?.description || 'Code pattern detected'}</p>
                        <div className="flex items-center text-sm text-muted-foreground mb-3">
                          <FileCode className="h-4 w-4 mr-1" />
                          <span>{match.file}</span>
                          {match.lineStart && match.lineEnd && (
                            <span className="ml-1">
                              (lines {match.lineStart}-{match.lineEnd})
                            </span>
                          )}
                        </div>
                        
                        {match.autoFixable && (
                          <Button size="sm" onClick={() => handleApplyFix(match)}>
                            <Zap className="h-4 w-4 mr-2" />
                            Apply Automatic Fix
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="refactoring" className="mt-0">
            {extractionSuggestions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No refactoring suggestions available</p>
                <p className="text-sm">Run analysis to find potential refactorings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {extractionSuggestions.map((extraction, idx) => (
                  <Card key={`${extraction.componentName}-${idx}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Extract {extraction.componentName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-2">
                        This section could be extracted into a separate component to improve maintainability.
                      </p>
                      <div className="text-sm text-muted-foreground mb-3">
                        <div className="flex items-center mb-1">
                          <FileCode className="h-4 w-4 mr-1" />
                          <span>Source: {selectedFile || 'SacredHomePage.tsx'}</span>
                        </div>
                        <div className="flex items-center mb-1">
                          <ChevronRight className="h-4 w-4 mr-1" />
                          <span>Lines: {extraction.startLine}-{extraction.endLine}</span>
                        </div>
                        <div className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-1" />
                          <span>Props: {extraction.props.join(', ')}</span>
                        </div>
                      </div>
                      
                      <Button size="sm" onClick={() => handleExtractComponent(extraction)}>
                        <FileCode className="h-4 w-4 mr-2" />
                        Extract Component
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="stats" className="mt-0">
            {!learningStats ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No learning statistics available yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">AI Learning Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Total Events</div>
                        <div className="text-xl font-semibold">{learningStats.totalEvents}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Acceptance Rate</div>
                        <div className="text-xl font-semibold">
                          {Math.round(learningStats.acceptanceRate * 100)}%
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Most Effective</div>
                        <div className="text-xl font-semibold">
                          {learningStats.mostEffectivePatterns.length} patterns
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {learningStats.mostEffectivePatterns.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Most Effective Patterns</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {learningStats.mostEffectivePatterns.map((pattern: any) => (
                          <li key={pattern.patternId} className="border-b pb-2 last:border-0">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{pattern.patternId}</span>
                              <span className="text-sm">
                                {Math.round(pattern.acceptanceRate * 100)}% effective
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Used {pattern.occurrences} times
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Learning Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {aiLearningSystem.getRecentEvents(5).map((event) => (
                        <li key={event.id} className="text-sm border-b pb-2 last:border-0">
                          <div className="flex justify-between">
                            <span className="capitalize">{event.type.replace('_', ' ')}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          {event.data.patternId && (
                            <div className="text-xs text-muted-foreground">
                              Pattern: {event.data.patternId}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AICodeAnalysisDashboard;
