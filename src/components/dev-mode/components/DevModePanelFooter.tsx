
import React from 'react';
import { Button } from '@/components/ui/button';

interface DevModePanelFooterProps {
  onClose: () => void;
}

const DevModePanelFooter: React.FC<DevModePanelFooterProps> = ({ onClose }) => {
  return (
    <div className="p-4 border-t border-white/10 flex justify-between">
      <span className="text-xs text-white/40">Developer Mode v1.2</span>
      <Button variant="ghost" size="sm" className="text-white/60 hover:text-white" onClick={onClose}>
        Close Panel
      </Button>
    </div>
  );
};

export default DevModePanelFooter;
