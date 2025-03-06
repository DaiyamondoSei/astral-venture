
import React from 'react';
import { X } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CloseButtonProps {
  onClose: () => void;
}

const CloseButton: React.FC<CloseButtonProps> = ({ onClose }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-background/50 hover:bg-background/80 text-foreground/70 hover:text-foreground transition-colors z-10"
            aria-label="Skip onboarding"
          >
            <X size={18} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Skip tour</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CloseButton;
