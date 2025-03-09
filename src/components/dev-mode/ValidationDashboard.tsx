
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useErrorPrevention } from '@/contexts/ErrorPreventionContext';
import { Button } from '@/components/ui/button';

const ValidationDashboard: React.FC = () => {
  const errorPrevention = useErrorPrevention();

  // Skip in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-blue-50 pb-2">
        <CardTitle className="text-sm font-medium">Validation Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Error Prevention</span>
            <span className={`px-2 py-1 text-xs rounded-full ${errorPrevention.isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {errorPrevention.isEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={errorPrevention.enableErrorPrevention}
              variant="outline" 
              size="sm" 
              className="text-xs"
              disabled={errorPrevention.isEnabled}
            >
              Enable
            </Button>
            <Button 
              onClick={errorPrevention.disableErrorPrevention}
              variant="outline" 
              size="sm" 
              className="text-xs"
              disabled={!errorPrevention.isEnabled}
            >
              Disable
            </Button>
          </div>
        </div>
        
        <div>
          <Button 
            onClick={() => {
              const result = errorPrevention.validateAllComponents();
              console.log('Validation result:', result);
            }}
            variant="outline" 
            size="sm" 
            className="text-xs w-full"
          >
            Run Validation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ValidationDashboard;
