
import React from 'react';
import { Button } from '@/components/ui/button';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

/**
 * ErrorFallback Component
 * 
 * Displays a user-friendly error message when components crash
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  return (
    <div 
      role="alert"
      className="flex flex-col items-center justify-center p-6 rounded-lg bg-black/20 backdrop-blur-md"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="64" 
        height="64" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-destructive mb-4"
        aria-hidden="true"
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
      
      <h2 className="text-xl font-display text-white mb-2">
        A Cosmic Disturbance Occurred
      </h2>
      
      <p className="text-white/70 text-center mb-6">
        The universe encountered an unexpected energy fluctuation.
      </p>
      
      {/* Only show error detail in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-3 mb-4 bg-black/30 rounded text-xs text-white/60 w-full overflow-auto max-h-32">
          {error.message}
        </div>
      )}
      
      <Button onClick={resetErrorBoundary}>
        Realign Energy Field
      </Button>
    </div>
  );
};

export default ErrorFallback;
