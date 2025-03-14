
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  InfoIcon, 
  Play,
  RotateCcw,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

import { 
  userFlowSimulator, 
  registerAuthenticationFlow, 
  registerReflectionFlow,
  UserFlowResult 
} from '@/utils/test/UserFlowSimulator';
import { dataFlowAnalyzer } from '@/utils/test/DataFlowAnalyzer';
import { environmentAnalyzer } from '@/utils/test/EnvironmentAnalyzer';

// Initialize user flows
registerAuthenticationFlow();
registerReflectionFlow();

const UserFlowTestRunner: React.FC = () => {
  const [activeTab, setActiveTab] = useState('flows');
  const [results, setResults] = useState<UserFlowResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<string>('auth-flow');
  const [expandedResults, setExpandedResults] = useState<Record<string, boolean>>({});
  const [environmentReport, setEnvironmentReport] = useState<string>('');
  const [expandedResultsDetails, setExpandedResultsDetails] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    // Load existing results
    setResults(userFlowSimulator.getResults());
  }, []);
  
  const runSelectedFlow = async () => {
    setIsRunning(true);
    try {
      const result = await userFlowSimulator.runFlow(selectedFlow);
      setResults([result, ...results]);
      
      // Expand the new result
      setExpandedResults(prev => ({
        ...prev,
        [result.timestamp.toString()]: true
      }));
    } catch (error) {
      console.error('Error running flow:', error);
    } finally {
      setIsRunning(false);
    }
  };
  
  const runAllFlows = async () => {
    setIsRunning(true);
    try {
      const allResults = await userFlowSimulator.runAllFlows();
      setResults([...allResults, ...results]);
      
      // Expand the new results
      const newExpandedState = { ...expandedResults };
      allResults.forEach(result => {
        newExpandedState[result.timestamp.toString()] = true;
      });
      setExpandedResults(newExpandedState);
    } catch (error) {
      console.error('Error running all flows:', error);
    } finally {
      setIsRunning(false);
    }
  };
  
  const resetResults = () => {
    userFlowSimulator.clearResults();
    setResults([]);
    setExpandedResults({});
    setExpandedResultsDetails({});
  };
  
  const toggleResultExpanded = (resultId: string) => {
    setExpandedResults(prev => ({
      ...prev,
      [resultId]: !prev[resultId]
    }));
  };
  
  const toggleStepDetails = (resultId: string, stepIndex: number) => {
    const detailKey = `${resultId}-${stepIndex}`;
    setExpandedResultsDetails(prev => ({
      ...prev,
      [detailKey]: !prev[detailKey]
    }));
  };
  
  const generateEnvironmentReport = async () => {
    setIsRunning(true);
    try {
      const report = environmentAnalyzer.generateReport();
      setEnvironmentReport(report);
      setActiveTab('environment');
    } catch (error) {
      console.error('Error generating environment report:', error);
    } finally {
      setIsRunning(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>User Flow Test Runner</CardTitle>
          <CardDescription>
            Test user flows and analyze application data flow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="flows" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="flows">User Flows</TabsTrigger>
              <TabsTrigger value="dataflow">Data Flow Analysis</TabsTrigger>
              <TabsTrigger value="environment">Environment Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="flows">
              <div className="mb-4">
                <div className="flex items-center mb-4">
                  <div className="flex-1">
                    <select
                      className="border border-input bg-background px-3 py-2 rounded-md w-60"
                      value={selectedFlow}
                      onChange={(e) => setSelectedFlow(e.target.value)}
                      disabled={isRunning}
                    >
                      <option value="auth-flow">Authentication Flow</option>
                      <option value="reflection-flow">Reflection Flow</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={runSelectedFlow}
                      disabled={isRunning}
                      variant="outline"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Run Selected
                    </Button>
                    <Button
                      onClick={runAllFlows}
                      disabled={isRunning}
                      variant="default"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Run All Flows
                    </Button>
                    <Button
                      onClick={resetResults}
                      disabled={isRunning || results.length === 0}
                      variant="destructive"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4 mt-8">
                  {results.length === 0 && !isRunning ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No test results yet. Run a user flow to see results here.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {results.map((result) => (
                        <Card key={result.timestamp.toString()} className="overflow-hidden">
                          <div 
                            className={`p-4 ${result.success ? 'bg-green-50' : 'bg-red-50'} cursor-pointer flex items-center justify-between`}
                            onClick={() => toggleResultExpanded(result.timestamp.toString())}
                          >
                            <div className="flex items-center">
                              {result.success ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                              )}
                              <span className="font-semibold">{result.flowId}</span>
                              <span className="ml-4 text-sm text-muted-foreground">
                                {new Date(result.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="mr-2 text-sm">
                                {result.duration.toFixed(0)}ms
                              </span>
                              {expandedResults[result.timestamp.toString()] ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </div>
                          </div>
                          
                          {expandedResults[result.timestamp.toString()] && (
                            <div className="p-4">
                              {result.steps.map((step, index) => (
                                <div key={step.stepId} className="mb-2">
                                  <div 
                                    className="flex items-start cursor-pointer p-2 hover:bg-muted/50 rounded"
                                    onClick={() => toggleStepDetails(result.timestamp.toString(), index)}
                                  >
                                    <div className="mt-0.5">
                                      {step.success ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                                      ) : (
                                        <XCircle className="h-4 w-4 text-red-500 mr-2" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium">{step.stepId}</div>
                                      {step.error && (
                                        <div className="text-sm text-red-500 mt-1">
                                          Error: {step.error}
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      {expandedResultsDetails[`${result.timestamp.toString()}-${index}`] ? (
                                        <ChevronDown className="h-4 w-4" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4" />
                                      )}
                                    </div>
                                  </div>
                                  
                                  {expandedResultsDetails[`${result.timestamp.toString()}-${index}`] && step.data && (
                                    <div className="ml-8 mt-2 p-2 bg-muted rounded">
                                      <pre className="text-xs overflow-x-auto">
                                        {JSON.stringify(step.data, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                  
                  {isRunning && (
                    <Alert>
                      <AlertTitle>Running tests...</AlertTitle>
                      <AlertDescription>
                        Please wait while the tests are running.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="dataflow">
              <div className="mb-4">
                <Alert className="mb-4">
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Data Flow Analysis</AlertTitle>
                  <AlertDescription>
                    This analysis shows how data flows through the application components.
                    Run user flows to generate data flow information.
                  </AlertDescription>
                </Alert>
                
                <div className="overflow-auto max-h-96 bg-muted/20 p-4 rounded">
                  <pre className="text-xs">
                    {dataFlowAnalyzer.getVisualRepresentation() || 'No data flow information yet. Run user flows to generate data.'}
                  </pre>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="environment">
              <div className="mb-4">
                <div className="flex justify-end mb-4">
                  <Button 
                    onClick={generateEnvironmentReport}
                    disabled={isRunning}
                  >
                    Generate Environment Report
                  </Button>
                </div>
                
                {environmentReport ? (
                  <div className="overflow-auto max-h-96 bg-muted/20 p-4 rounded">
                    <pre className="text-xs whitespace-pre-wrap">
                      {environmentReport}
                    </pre>
                  </div>
                ) : (
                  <Alert>
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>Environment Analysis</AlertTitle>
                    <AlertDescription>
                      Click "Generate Environment Report" to analyze the application environments.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserFlowTestRunner;
