
import React from 'react';
import { format } from 'date-fns';
import { History, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LatestPracticeCardProps {
  latestPractice: any | null;
  isLoading?: boolean;
  error?: Error | null;
}

const LatestPracticeCard: React.FC<LatestPracticeCardProps> = ({ 
  latestPractice, 
  isLoading = false,
  error = null
}) => {
  // Function to format date nicely
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Unknown date';
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Invalid date';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="glass-card p-5 h-full flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary/60 animate-spin mb-2" />
        <p className="text-muted-foreground text-sm">Loading recent practice...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="glass-card p-5 h-full">
        <h3 className="font-display text-lg mb-3 flex items-center">
          <History size={16} className="mr-2 text-primary" />
          Recent Practice
        </h3>
        <p className="text-muted-foreground text-sm">
          Unable to load recent practice data
        </p>
      </div>
    );
  }

  // Empty state
  if (!latestPractice) {
    return (
      <div className="glass-card p-5 h-full">
        <h3 className="font-display text-lg mb-3 flex items-center">
          <History size={16} className="mr-2 text-primary" />
          Recent Practice
        </h3>
        <p className="text-muted-foreground text-sm">
          No recent practices found. Complete your first practice to see it here.
        </p>
      </div>
    );
  }

  // Main display
  return (
    <div className="glass-card p-5 h-full">
      <h3 className="font-display text-lg mb-3 flex items-center">
        <History size={16} className="mr-2 text-primary" />
        Recent Practice
      </h3>
      
      <div className="space-y-3">
        <p className="text-white/90">{latestPractice.title || 'Untitled Practice'}</p>
        
        <div className="flex items-center justify-between text-sm">
          <span className={cn(
            "px-2 py-1 rounded-full text-xs",
            latestPractice.category === 'meditation' ? "bg-primary/20" :
            latestPractice.category === 'breathwork' ? "bg-blue-500/20" :
            latestPractice.category === 'chakra_activation' ? "bg-purple-500/20" :
            "bg-muted/20"
          )}>
            {latestPractice.category === 'chakra_activation' ? 'Chakra Activation' : 
              latestPractice.category?.charAt(0).toUpperCase() + latestPractice.category?.slice(1) || 'Practice'}
          </span>
          
          <span className="text-muted-foreground">
            {latestPractice.completedAt ? formatDate(latestPractice.completedAt) : 'Unknown date'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LatestPracticeCard;
