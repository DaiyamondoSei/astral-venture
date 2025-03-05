
import React from 'react';
import { Layers, Maximize2, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface ComponentOption {
  id: string;
  name: string;
  description: string;
  isVisible: boolean;
}

interface ComponentIsolationProps {
  componentOptions: ComponentOption[];
  onToggleComponent: (id: string) => void;
  isolationMode: boolean;
  setIsolationMode: (value: boolean) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

const ComponentIsolation: React.FC<ComponentIsolationProps> = ({
  componentOptions,
  onToggleComponent,
  isolationMode,
  setIsolationMode,
  onShowAll,
  onHideAll
}) => {
  return (
    <Card className="bg-black/50 border border-white/10 mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg flex items-center">
          <Layers size={16} className="mr-2" />
          Component Isolation
        </CardTitle>
        <CardDescription>
          Show or hide individual components for testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white/80">Enable Isolation Mode</span>
          <Switch 
            checked={isolationMode} 
            onCheckedChange={setIsolationMode} 
          />
        </div>
        
        {isolationMode && (
          <>
            <div className="flex space-x-2 mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onShowAll}
                className="border-white/10 bg-transparent hover:bg-white/5 text-white/80 flex-1"
              >
                <Eye size={14} className="mr-1" />
                Show All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onHideAll}
                className="border-white/10 bg-transparent hover:bg-white/5 text-white/80 flex-1"
              >
                <EyeOff size={14} className="mr-1" />
                Hide All
              </Button>
            </div>
            
            <Separator className="bg-white/10 my-2" />
            
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
              {componentOptions.map(option => (
                <div key={option.id} className="flex items-center justify-between py-1 border-b border-white/5">
                  <div>
                    <div className="text-white/80 text-sm">{option.name}</div>
                    <div className="text-white/50 text-xs">{option.description}</div>
                  </div>
                  <Switch 
                    checked={option.isVisible} 
                    onCheckedChange={() => onToggleComponent(option.id)} 
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-quantum-500/10 rounded-md border border-quantum-500/20 text-xs text-white/70">
              <p>Isolation mode helps debug visual issues by showing only specific components.</p>
            </div>
          </>
        )}
        
        {!isolationMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsolationMode(true)}
            className="w-full border-white/10 bg-transparent text-white/80"
          >
            <Maximize2 size={14} className="mr-1" />
            Enter Isolation Mode
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ComponentIsolation;
