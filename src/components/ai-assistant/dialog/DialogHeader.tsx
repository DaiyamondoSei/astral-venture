
import React from 'react';
import { 
  DialogHeader as UIDialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';

interface DialogHeaderProps {
  onClose: () => void;
  loading: boolean;
}

const DialogHeader: React.FC<DialogHeaderProps> = ({ onClose, loading }) => {
  return (
    <UIDialogHeader className="flex flex-row items-center justify-between">
      <div>
        <DialogTitle className="text-xl font-display flex items-center gap-2">
          <Sparkles size={18} className="text-quantum-400" />
          Quantum AI Guide
        </DialogTitle>
        <DialogDescription>
          Ask questions about your experiences or seek guidance for your practice
        </DialogDescription>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onClose}
        disabled={loading}
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Button>
    </UIDialogHeader>
  );
};

export default DialogHeader;
