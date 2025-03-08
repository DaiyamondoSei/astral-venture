
import React, { useState } from 'react';
import { Lightbulb, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AIAssistantPanel from './AIAssistantPanel';

/**
 * AI Assistant Dashboard
 * 
 * A floating UI element that provides access to AI coding suggestions
 * and development assistance.
 */
const AIAssistantDashboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Skip in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <>
      {!isOpen && (
        <Button
          className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 shadow-lg"
          onClick={() => setIsOpen(true)}
          variant="default"
        >
          <Lightbulb className="h-6 w-6" />
        </Button>
      )}
      
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[450px] h-[600px] bg-background border rounded-lg shadow-xl flex flex-col overflow-hidden">
          <AIAssistantPanel onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
};

export default AIAssistantDashboard;
