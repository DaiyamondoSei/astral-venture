
import React from 'react';
import { Card } from '@/components/ui/card';

/**
 * A simple dashboard wrapper for testing purposes
 */
const TestDashboardWrapper: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Dashboard</h1>
      <Card className="p-6">
        <p>This is a test dashboard for development and testing purposes.</p>
      </Card>
    </div>
  );
};

export default TestDashboardWrapper;
