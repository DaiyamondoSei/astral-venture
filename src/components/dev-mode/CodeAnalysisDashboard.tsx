
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { patternAnalyzer } from '@/utils/ai/codeAnalysis/PatternAnalyzer';
import { codePatternRegistry } from '@/utils/ai/codeAnalysis/CodePatternRegistry';
import { aiLearningSystem } from '@/utils/ai/AIAssistantLearningSystem';
import { componentExtractor } from '@/utils/ai/codeAnalysis/ComponentExtractor';

interface CodeAnalysisDashboardProps {
  onSelectFile?: (file: string) => void;
  selectedFile?: string;
  fileContent?: string;
}

const CodeAnalysisDashboard: React.FC<CodeAnalysisDashboardProps> = ({
  onSelectFile,
  selectedFile,
  fileContent
}) => {
  const [activeTab, setActiveTab] = useState('issues');
  const [analysisResults, setAnalysisResults] = useState<any>({
    matches: [],
    suggestions: [],
    categories: { architecture: [], performance: [], style: [], quality: [] },
    mostCommon: []
  });
  const [extractionSuggestions, setExtractionSuggestions] = useState<any[]>([]);
  
  // Run analysis when file content changes
  useEffect(() => {
    if (selectedFile && fileContent) {
      // Analyze the file for patterns
      const matches = patternAnalyzer.analyzeCode(selectedFile, fileContent);
      
      // Get matches by category
      const categories = patternAnalyzer.getMatchesByCategory();
      
      // Get most common patterns
      const mostCommon = patternAnalyzer.getMostCommonPatterns();
      
      // Generate human-readable suggestions
      const suggestions = matches.map(match => {
        const pattern = codePatternRegistry.getPattern(match.patternId);
        if (!pattern) return '';
        
        return `${pattern.name}: ${pattern.description}`;
      }).filter(Boolean);
      
      setAnalysisResults({
        matches,
        suggestions,
        categories,
        mostCommon
      });
      
      // Generate component extraction suggestions if it's a React component
      if (selectedFile.endsWith('.tsx') || selectedFile.endsWith('.jsx')) {
        const extractionOptions = componentExtractor.suggestExtractions(fileContent);
        setExtractionSuggestions(extractionOptions);
      } else {
        setExtractionSuggestions([]);
      }
    }
  }, [selectedFile, fileContent]);
  
  const renderPatternSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500'
    };
    
    return (
      <span className={`inline-block w-3 h-3 rounded-full ${colors[severity] || 'bg-gray-500'} mr-2`} />
    );
  };
  
  const getLearningStats = () => {
    return aiLearningSystem.getSummaryStats();
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Code Analysis</span>
          {selectedFile && (
            <Badge variant="outline" className="ml-2">
              {selectedFile.split('/').pop()}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          AI-powered code analysis and suggestions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="issues">
              Issues
              {analysisResults.matches.length > 0 && (
                <Badge className="ml-2">{analysisResults.matches.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="extraction">
              Component Extraction
              {extractionSuggestions.length > 0 && (
                <Badge className="ml-2">{extractionSuggestions.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="learning">Learning Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="issues" className="space-y-4">
            {analysisResults.matches.length === 0 ? (
              <div className="text-center p-6 text-muted-foreground">
                No issues detected in the current file
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm">Architecture</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      {analysisResults.categories.architecture.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No issues</p>
                      ) : (
                        <ul className="space-y-2 text-sm">
                          {analysisResults.categories.architecture.map((match: any, i: number) => {
                            const pattern = codePatternRegistry.getPattern(match.patternId);
                            return pattern ? (
                              <li key={i} className="flex items-start">
                                {renderPatternSeverityBadge(pattern.severity)}
                                {pattern.name}
                              </li>
                            ) : null;
                          })}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm">Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      {analysisResults.categories.performance.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No issues</p>
                      ) : (
                        <ul className="space-y-2 text-sm">
                          {analysisResults.categories.performance.map((match: any, i: number) => {
                            const pattern = codePatternRegistry.getPattern(match.patternId);
                            return pattern ? (
                              <li key={i} className="flex items-start">
                                {renderPatternSeverityBadge(pattern.severity)}
                                {pattern.name}
                              </li>
                            ) : null;
                          })}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm">Code Style</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      {analysisResults.categories.style.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No issues</p>
                      ) : (
                        <ul className="space-y-2 text-sm">
                          {analysisResults.categories.style.map((match: any, i: number) => {
                            const pattern = codePatternRegistry.getPattern(match.patternId);
                            return pattern ? (
                              <li key={i} className="flex items-start">
                                {renderPatternSeverityBadge(pattern.severity)}
                                {pattern.name}
                              </li>
                            ) : null;
                          })}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm">Code Quality</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      {analysisResults.categories.quality.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No issues</p>
                      ) : (
                        <ul className="space-y-2 text-sm">
                          {analysisResults.categories.quality.map((match: any, i: number) => {
                            const pattern = codePatternRegistry.getPattern(match.patternId);
                            return pattern ? (
                              <li key={i} className="flex items-start">
                                {renderPatternSeverityBadge(pattern.severity)}
                                {pattern.name}
                              </li>
                            ) : null;
                          })}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="extraction">
            {extractionSuggestions.length === 0 ? (
              <div className="text-center p-6 text-muted-foreground">
                {selectedFile ? 
                  "No component extraction suggestions for this file" :
                  "Select a component file to see extraction suggestions"}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  These sections of code could be extracted into separate components:
                </p>
                
                <div className="space-y-3">
                  {extractionSuggestions.map((suggestion, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{suggestion.componentName}</h4>
                            <p className="text-sm text-muted-foreground">
                              Lines {suggestion.startLine}-{suggestion.endLine}
                            </p>
                            {suggestion.props.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium">Required props:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {suggestion.props.map((prop: string) => (
                                    <Badge key={prop} variant="outline" className="text-xs">
                                      {prop}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <Button size="sm" variant="outline">
                            Extract
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="learning">
            {(() => {
              const stats = getLearningStats();
              
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-muted-foreground text-sm">Total Events</p>
                        <p className="text-3xl font-bold">{stats.totalEvents}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-muted-foreground text-sm">Acceptance Rate</p>
                        <p className="text-3xl font-bold">{(stats.acceptanceRate * 100).toFixed(0)}%</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-muted-foreground text-sm">Effective Patterns</p>
                        <p className="text-3xl font-bold">{stats.mostEffectivePatterns.length}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Most Effective Patterns</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {stats.mostEffectivePatterns.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Not enough data collected yet
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {stats.mostEffectivePatterns.map((pattern, i) => {
                            const patternDef = codePatternRegistry.getPattern(pattern.patternId);
                            return (
                              <li key={i} className="text-sm flex justify-between">
                                <span>{patternDef?.name || pattern.patternId}</span>
                                <span>{(pattern.acceptanceRate * 100).toFixed(0)}% acceptance</span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Behavior Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {stats.userBehaviorInsights.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No user behavior insights available yet
                        </p>
                      ) : (
                        <ul className="space-y-1">
                          {stats.userBehaviorInsights.map((insight, i) => (
                            <li key={i} className="text-sm">• {insight}</li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CodeAnalysisDashboard;
