
import React from 'react';
import { Card } from '@/components/ui/card';

const TestPage: React.FC = () => {
  return (
    <div className="container mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold">Test Page</h1>
      <p className="text-muted-foreground">
        This page is for testing components and features during development.
      </p>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Test Environment</h2>
        <pre className="bg-quantum-900 p-4 rounded overflow-auto">
          {JSON.stringify({
            environment: process.env.NODE_ENV,
            time: new Date().toISOString(),
            userAgent: navigator.userAgent,
          }, null, 2)}
        </pre>
      </Card>
    </div>
  );
};

export default TestPage;
