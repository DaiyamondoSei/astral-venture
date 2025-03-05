
import React from 'react';
import { Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DevModeToggleProps {
  isDeveloperMode: boolean;
  toggleDeveloperMode: () => void;
  openDevPanel: () => void;
}

const DevModeToggle: React.FC<DevModeToggleProps> = ({
  isDeveloperMode,
  toggleDeveloperMode,
  openDevPanel
}) => {
  return (
    <div className="fixed bottom-4 left-4 flex items-center space-x-2 z-40">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={toggleDeveloperMode}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-black/30 backdrop-blur-sm border border-white/10 hover:bg-black/50 transition-colors"
              aria-label="Toggle Developer Mode"
            >
              <span className={`w-3 h-3 rounded-full ${isDeveloperMode ? 'bg-quantum-400' : 'bg-gray-500'}`}></span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{isDeveloperMode ? 'Disable' : 'Enable'} Developer Mode</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {isDeveloperMode && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 bg-black/30 backdrop-blur-sm border-white/10 hover:bg-black/50 text-white"
                onClick={openDevPanel}
              >
                <Code size={14} />
                <span className="hidden sm:inline">Dev Panel</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Open Developer Panel</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default DevModeToggle;
