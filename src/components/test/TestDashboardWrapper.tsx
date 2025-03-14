
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UserFlowTestRunner from './UserFlowTestRunner';
import EnhancedDataFlowVisualization from './EnhancedDataFlowVisualization';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePerformance } from '@/contexts/PerformanceContext';

/**
 * A wrapper component for the test dashboard that doesn't modify protected files
 */
const TestDashboardWrapper: React.FC = () => {
  // Use the performance context to track metrics
  const { trackMetric } = usePerformance();

  // Track component render
  React.useEffect(() => {
    trackMetric('TestDashboardWrapper', 'render', performance.now());
    return () => {
      trackMetric('TestDashboardWrapper', 'unmount', performance.now());
    };
  }, [trackMetric]);

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Application Test Dashboard</CardTitle>
          <CardDescription>
            Safely test and analyze the application's data flow and environment interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This wrapper component safely accesses the test dashboard functionality without modifying protected files.
            Use it to test user flows and visualize data flow between components.
          </p>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="userflows">
        <TabsList className="mb-4">
          <TabsTrigger value="userflows">User Flow Tests</TabsTrigger>
          <TabsTrigger value="dataflow">Data Flow Visualization</TabsTrigger>
        </TabsList>
        
        <TabsContent value="userflows">
          <UserFlowTestRunner />
        </TabsContent>
        
        <TabsContent value="dataflow">
          <EnhancedDataFlowVisualization />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestDashboardWrapper;
