
import React, { useState } from 'react';
import { useErrorPrevention, ValidationStatusIndicator } from '@/contexts/ErrorPreventionContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

/**
 * Component for configuring and managing the real-time validation system
 * Only available in development mode
 */
const ValidationDashboard: React.FC = () => {
  const {
    isStrictMode,
    enableStrictMode,
    disableStrictMode,
    isAutoFixEnabled,
    enableAutoFix,
    disableAutoFix,
    validationInterval,
    setValidationInterval,
    isMonitoring,
    pauseMonitoring,
    resumeMonitoring,
    runValidation,
    lastValidationResult
  } = useErrorPrevention();
  
  const [showDetails, setShowDetails] = useState(false);
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const handleRunValidation = () => {
    const results = runValidation();
    console.log('Validation Results:', results);
  };
  
  const validComponents = lastValidationResult?.valid || [];
  const invalidComponents = lastValidationResult?.invalid || [];
  
  return (
    <Card className="p-4 space-y-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold">Real-Time Validation Dashboard</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Validation Mode</h3>
          <div className="flex items-center space-x-2">
            <Switch
              checked={isStrictMode}
              onCheckedChange={(checked) => checked ? enableStrictMode() : disableStrictMode()}
            />
            <span>{isStrictMode ? 'Strict Mode' : 'Relaxed Mode'}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {isStrictMode 
              ? 'Validation errors will be treated as exceptions' 
              : 'Validation errors will be logged as warnings'}
          </p>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Auto-Fix</h3>
          <div className="flex items-center space-x-2">
            <Switch
              checked={isAutoFixEnabled}
              onCheckedChange={(checked) => checked ? enableAutoFix() : disableAutoFix()}
            />
            <span>{isAutoFixEnabled ? 'Enabled' : 'Disabled'}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {isAutoFixEnabled 
              ? 'System will attempt to fix validation issues automatically' 
              : 'No automatic fixes will be applied'}
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Validation Interval: {validationInterval}ms</h3>
        <Slider
          value={[validationInterval]}
          min={500}
          max={10000}
          step={500}
          onValueChange={(value) => setValidationInterval(value[0])}
        />
        <p className="text-xs text-muted-foreground">
          How frequently components will be validated
        </p>
      </div>
      
      <div className="flex items-center justify-between">
        <Button
          variant={isMonitoring ? "destructive" : "default"}
          onClick={isMonitoring ? pauseMonitoring : resumeMonitoring}
        >
          {isMonitoring ? 'Pause Monitoring' : 'Resume Monitoring'}
        </Button>
        
        <Button variant="outline" onClick={handleRunValidation}>
          Run Validation Now
        </Button>
      </div>
      
      {lastValidationResult && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Validation Results</h3>
            <Button 
              variant="ghost" 
              onClick={() => setShowDetails(!showDetails)}
              size="sm"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
          
          <div className="text-sm">
            <p>
              Last checked: {new Date(lastValidationResult.timestamp).toLocaleTimeString()}
            </p>
            <p>
              Valid components: {validComponents.length}
            </p>
            <p className={invalidComponents.length > 0 ? "text-red-500" : ""}>
              Invalid components: {invalidComponents.length}
            </p>
          </div>
          
          {showDetails && invalidComponents.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Invalid Components</h4>
              {invalidComponents.map((item, index) => (
                <div key={index} className="p-2 bg-red-100 rounded">
                  <p className="font-medium">{item.component}</p>
                  <ul className="list-disc list-inside text-xs">
                    {item.errors.map((error, errIndex) => (
                      <li key={errIndex}>{error}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <ValidationStatusIndicator />
    </Card>
  );
};

export default ValidationDashboard;
