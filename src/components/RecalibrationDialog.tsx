
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, RefreshCw, Sparkles } from "lucide-react";

interface RecalibrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (reflection: string) => void;
}

const RecalibrationDialog: React.FC<RecalibrationDialogProps> = ({
  open,
  onOpenChange,
  onComplete
}) => {
  const [reflection, setReflection] = useState('');
  
  const handleSubmit = () => {
    if (reflection.trim().length > 10) {
      onComplete(reflection);
      setReflection('');
    }
  };
  
  const reflectionPrompts = [
    "What stood in the way of my daily practice?",
    "How might I create space for my practice tomorrow?",
    "What would help me maintain consistency?",
    "How does this practice serve my higher purpose?",
    "What can I learn from this interruption in my streak?"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card-dark max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-display flex items-center gap-2">
            <RefreshCw size={18} className="text-quantum-400" />
            Energy Recalibration
          </DialogTitle>
          <DialogDescription>
            Reflect on what disrupted your energy flow to restore your chakra balance
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="text-sm text-muted-foreground">
            Consider one of these questions:
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {reflectionPrompts.map((prompt, index) => (
              <div 
                key={index}
                className="text-xs p-2 border border-white/10 rounded-md bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => setReflection(prompt + "\n\n")}
              >
                {prompt}
              </div>
            ))}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reflection">Your reflection</Label>
            <Textarea
              id="reflection"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Share your thoughts on what disrupted your energy practice..."
              className="bg-black/20 border-white/10 min-h-[100px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-quantum-400 to-quantum-700"
            onClick={handleSubmit}
            disabled={reflection.trim().length < 10}
          >
            <Sparkles size={16} className="mr-2" />
            Recalibrate Energy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecalibrationDialog;
