
import React from 'react';
import { toast } from '@/components/ui/use-toast';

/**
 * Context provider that wraps the achievement functionality and adds error handling
 */
export const AchievementContext: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

// Simple error boundary component for achievement context
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Achievement context error:', error, errorInfo);
    
    toast({
      title: 'Achievement System Error',
      description: 'There was an error in the achievement system. Functionality may be limited.',
      variant: 'destructive'
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="achievement-error-fallback">
          {this.props.children}
        </div>
      );
    }

    return this.props.children;
  }
}

export default AchievementContext;
