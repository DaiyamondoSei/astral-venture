
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIAnalysisContext } from '@/contexts/AIAnalysisContext';
import { Badge } from '@/components/ui/badge';
import { ApiKeyForm } from './ApiKeyForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, RefreshCw, Zap } from 'lucide-react';

export function AiAnalysisDemo() {
  const [activeTab, setActiveTab] = useState<string>('chakra');
  const [showApiKeyForm, setShowApiKeyForm] = useState<boolean>(false);
  const { 
    analyzeChakraSystem, 
    analyzePerformanceMetrics,
    isLoading, 
    hasApiKey, 
    isOnline,
    lastChakraAnalysis,
    lastPerformanceAnalysis,
    error
  } = useAIAnalysisContext();

  // Demo data
  const demoChakraData = {
    activatedChakras: [3, 4, 6], // Solar Plexus, Heart, Third Eye
    emotionalData: {
      'joy': 0.8,
      'peace': 0.7,
      'stress': 0.3,
      'curiosity': 0.9
    },
    reflectionContent: "I've been feeling more confident lately and enjoying moments of clarity. My meditation practice is helping me feel more balanced."
  };

  const demoPerformanceData = {
    componentRenderTimes: {
      'ChakraVisualization': 150,
      'EmotionalInsights': 80,
      'DashboardLayout': 30,
      'ReflectionEditor': 220,
      'AstralProgressTracker': 45
    },
    memoryUsage: 84.5,
    fps: 58,
    networkRequests: [
      { url: '/api/reflections', time: 320, size: 15400 },
      { url: '/api/chakra', time: 180, size: 5200 },
      { url: '/api/user/stats', time: 90, size: 1800 }
    ]
  };

  const runChakraAnalysis = async () => {
    try {
      await analyzeChakraSystem(demoChakraData);
    } catch (err) {
      console.error('Chakra analysis failed:', err);
    }
  };

  const runPerformanceAnalysis = async () => {
    try {
      await analyzePerformanceMetrics(demoPerformanceData);
    } catch (err) {
      console.error('Performance analysis failed:', err);
    }
  };

  const renderApiKeySection = () => {
    if (showApiKeyForm) {
      return (
        <ApiKeyForm 
          onSuccess={() => setShowApiKeyForm(false)}
          showCancel={true}
          onCancel={() => setShowApiKeyForm(false)}
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-4">
        <Badge variant={hasApiKey ? "success" : "destructive"} className="mb-2">
          {hasApiKey ? "API Key Set" : "API Key Required"}
        </Badge>
        <p className="text-center text-sm text-muted-foreground">
          {hasApiKey 
            ? "Your OpenAI API key is set. You can update it if needed."
            : "To use AI-powered analysis features, you need to set your OpenAI API key."}
        </p>
        <Button onClick={() => setShowApiKeyForm(true)}>
          {hasApiKey ? "Update API Key" : "Set API Key"}
        </Button>
      </div>
    );
  };

  const renderAnalysisResult = (type: 'chakra' | 'performance') => {
    const result = type === 'chakra' ? lastChakraAnalysis : lastPerformanceAnalysis;
    
    if (isLoading) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-20 w-full mt-4" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message || "An error occurred during analysis"}
          </AlertDescription>
        </Alert>
      );
    }

    if (!result) {
      return (
        <div className="flex flex-col items-center justify-center p-6">
          <p className="text-center text-sm text-muted-foreground">
            No analysis results yet. Run an analysis to see the results.
          </p>
        </div>
      );
    }

    if (type === 'chakra') {
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Dominant Chakras</h3>
            <p>{result.dominantChakras.join(', ')}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium">Activation Levels</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(result.activationLevels).map(([chakra, level]) => (
                <div key={chakra} className="flex justify-between">
                  <span>{chakra}:</span>
                  <span>{level}/10</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium">Blockages</h3>
            <ul className="list-disc list-inside">
              {result.blockages.map((blockage, i) => (
                <li key={i}>{blockage}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-medium">Overall Balance</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${result.overallBalance}%` }}
              ></div>
            </div>
            <p className="text-right text-xs mt-1">{result.overallBalance}/100</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium">Recommendations</h3>
            <ul className="list-disc list-inside">
              {result.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Identified Issues</h3>
            {result.issues.map((issue, i) => (
              <div key={i} className="mb-3 p-2 border rounded">
                <div className="flex items-center">
                  <span className="font-medium">{issue.component}</span>
                  <Badge 
                    variant={
                      issue.severity === 'high' ? 'destructive' : 
                      issue.severity === 'medium' ? 'default' : 
                      'outline'
                    }
                    className="ml-2"
                  >
                    {issue.severity}
                  </Badge>
                </div>
                <p className="text-sm">{issue.description}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-medium">Recommendation:</span> {issue.recommendation}
                </p>
              </div>
            ))}
          </div>
          
          <div>
            <h3 className="text-sm font-medium">Major Bottlenecks</h3>
            <ul className="list-disc list-inside">
              {result.bottlenecks.map((bottleneck, i) => (
                <li key={i}>{bottleneck}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-medium">Optimization Score</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
              <div 
                className={`h-2.5 rounded-full ${
                  result.optimizationScore > 70 ? 'bg-green-600' : 
                  result.optimizationScore > 40 ? 'bg-yellow-500' : 
                  'bg-red-600'
                }`}
                style={{ width: `${result.optimizationScore}%` }}
              ></div>
            </div>
            <p className="text-right text-xs mt-1">{result.optimizationScore}/100</p>
          </div>
        </div>
      );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI-Powered Analysis</CardTitle>
        <CardDescription>
          Offload complex analysis to OpenAI API for detailed insights
        </CardDescription>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge variant={isOnline ? "outline" : "destructive"}>
            {isOnline ? "Online" : "Offline"}
          </Badge>
          <Badge variant={hasApiKey ? "success" : "destructive"}>
            {hasApiKey ? "API Key Set" : "API Key Required"}
          </Badge>
        </div>
      </CardHeader>
      
      {!hasApiKey && (
        <CardContent>
          {renderApiKeySection()}
        </CardContent>
      )}
      
      {hasApiKey && (
        <>
          <CardContent>
            <Tabs defaultValue="chakra" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chakra">Chakra Analysis</TabsTrigger>
                <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chakra" className="space-y-4 mt-4">
                {renderAnalysisResult('chakra')}
              </TabsContent>
              
              <TabsContent value="performance" className="space-y-4 mt-4">
                {renderAnalysisResult('performance')}
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            {!isOnline && (
              <Alert variant="warning" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Offline Mode</AlertTitle>
                <AlertDescription>
                  You're currently offline. Analysis will use local fallbacks with limited accuracy.
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => setShowApiKeyForm(true)}
              size="sm"
            >
              Update API Key
            </Button>
            
            <Button
              onClick={activeTab === 'chakra' ? runChakraAnalysis : runPerformanceAnalysis}
              disabled={isLoading}
              className="ml-auto"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Run {activeTab === 'chakra' ? 'Chakra' : 'Performance'} Analysis
                </>
              )}
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
}

export default AiAnalysisDemo;
