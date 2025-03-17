
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { ErrorFallbackProps } from '@/utils/errorHandling/types';

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary,
  componentName,
  showDetails = process.env.NODE_ENV !== 'production' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 rounded-lg bg-black/20 backdrop-blur-md border border-red-500/20">
      <div className="flex items-center justify-center mb-4 w-12 h-12 rounded-full bg-red-500/10">
        <AlertCircle className="text-red-500" size={24} />
      </div>
      
      <h2 className="text-xl font-display text-white mb-2">
        Something went wrong
        {componentName && <span className="text-sm text-white/70"> in {componentName}</span>}
      </h2>
      
      <p className="text-sm text-white/70 mb-4 max-w-md text-center">
        {error.message || 'An unexpected error occurred'}
      </p>
      
      <div className="flex gap-4">
        <Button 
          onClick={resetErrorBoundary}
          variant="default"
        >
          Try Again
        </Button>
        
        <Button
          onClick={() => window.location.href = '/'}
          variant="outline"
        >
          Go to Home
        </Button>
      </div>
      
      {showDetails && (
        <details className="mt-4 p-2 border border-white/10 rounded text-xs text-white/50 max-w-full overflow-auto">
          <summary className="cursor-pointer">Error Details</summary>
          <pre className="p-2 mt-2 whitespace-pre-wrap break-words">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
};

export default ErrorFallback;
