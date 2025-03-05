
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Code, X } from 'lucide-react';

interface DevModePanelHeaderProps {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
  onClose: () => void;
}

const DevModePanelHeader: React.FC<DevModePanelHeaderProps> = ({
  isExpanded,
  setIsExpanded,
  onClose
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-white/10">
      <div className="flex items-center space-x-2">
        <Code size={18} className="text-quantum-400" />
        <h2 className="text-lg font-semibold text-white">Developer Mode</h2>
        <Badge className="bg-quantum-500/30 hover:bg-quantum-500/40 text-white text-xs">PREMIUM</Badge>
      </div>
      
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="text-white/70 hover:text-white mr-2"
        >
          {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="text-white/70 hover:text-white"
        >
          <X size={18} />
        </Button>
      </div>
    </div>
  );
};

export default DevModePanelHeader;
