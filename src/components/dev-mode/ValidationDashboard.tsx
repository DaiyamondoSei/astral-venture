
import React from 'react';
import { useErrorPrevention } from '@/contexts/ErrorPreventionContext';

const ValidationDashboard = () => {
  const {
    isEnabled,
    enableErrorPrevention,
    errorComponents,
    warnComponents
  } = useErrorPrevention();

  // Fix the event handler types 
  const handleEnableToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    enableErrorPrevention(true);
  };

  const handleDisableToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    enableErrorPrevention(false);
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Real-time Validation Dashboard</h2>
      
      <div className="flex items-center mb-4">
        <span className="mr-2">Status:</span>
        <span className={`px-2 py-1 rounded text-xs ${isEnabled ? 'bg-green-500/30' : 'bg-gray-500/30'}`}>
          {isEnabled ? 'Active' : 'Disabled'}
        </span>
        
        <div className="ml-auto space-x-2">
          <button
            onClick={handleEnableToggle}
            className={`px-3 py-1 rounded text-xs ${isEnabled ? 'bg-green-600' : 'bg-green-600/50'}`}
          >
            Enable
          </button>
          <button
            onClick={handleDisableToggle}
            className={`px-3 py-1 rounded text-xs ${!isEnabled ? 'bg-red-600' : 'bg-red-600/50'}`}
          >
            Disable
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 p-3 rounded">
          <h3 className="text-sm font-medium mb-2 text-red-400">Error Components</h3>
          {errorComponents.length > 0 ? (
            <ul className="text-xs space-y-1">
              {errorComponents.map((comp, index) => (
                <li key={index} className="py-1 px-2 bg-red-900/20 rounded">
                  {comp}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-400">No components with errors</p>
          )}
        </div>
        
        <div className="bg-gray-900 p-3 rounded">
          <h3 className="text-sm font-medium mb-2 text-yellow-400">Warning Components</h3>
          {warnComponents.length > 0 ? (
            <ul className="text-xs space-y-1">
              {warnComponents.map((comp, index) => (
                <li key={index} className="py-1 px-2 bg-yellow-900/20 rounded">
                  {comp}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-400">No components with warnings</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidationDashboard;
