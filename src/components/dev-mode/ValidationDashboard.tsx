
import React, { useState, useEffect } from 'react';
import { useErrorPrevention } from '@/contexts/ErrorPreventionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ValidationDashboard: React.FC = () => {
  const { 
    isEnabled, 
    enableErrorPrevention, 
    errorComponents, 
    warnComponents,
    validateAllComponents 
  } = useErrorPrevention();
  
  const [activeTab, setActiveTab] = useState('errors');
  
  useEffect(() => {
    if (isEnabled) {
      validateAllComponents();
    }
  }, [isEnabled, validateAllComponents]);

  return (
    <Card className="bg-background border shadow-md">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Component Validation</CardTitle>
          <div>
            <button
              onClick={() => enableErrorPrevention(!isEnabled)}
              className={`px-3 py-1 text-xs rounded ${
                isEnabled ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'
              }`}
            >
              {isEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="errors" className="text-sm">
              Errors ({errorComponents.length})
            </TabsTrigger>
            <TabsTrigger value="warnings" className="text-sm">
              Warnings ({warnComponents.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <TabsContent value="errors" className="mt-2">
          {errorComponents.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No errors detected
            </p>
          ) : (
            <div className="space-y-2">
              {errorComponents.map((component, index) => (
                <div key={index} className="p-2 bg-red-50 border border-red-200 rounded-md">
                  <h3 className="font-medium text-red-800">{component.name || 'Unknown component'}</h3>
                  <p className="text-sm text-red-600">{component.message || 'Error in component'}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="warnings" className="mt-2">
          {warnComponents.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No warnings detected
            </p>
          ) : (
            <div className="space-y-2">
              {warnComponents.map((component, index) => (
                <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h3 className="font-medium text-yellow-800">{component.name || 'Unknown component'}</h3>
                  <p className="text-sm text-yellow-600">{component.message || 'Warning in component'}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </CardContent>
    </Card>
  );
};

export default ValidationDashboard;
