
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UserFlowTestRunner from './UserFlowTestRunner';
import EnhancedDataFlowVisualization from './EnhancedDataFlowVisualization';

const ApplicationTestDashboard: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Application Test Dashboard</CardTitle>
          <CardDescription>
            Test and analyze the application's data flow and environment interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This dashboard allows you to test user flows, analyze data flow between components, 
            and examine environment interactions to identify synchronization issues.
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

export default ApplicationTestDashboard;
