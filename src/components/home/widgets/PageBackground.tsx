
import React from 'react';
import { usePerformance } from '@/contexts/PerformanceContext';

interface PageBackgroundProps {
  energyPoints: number;
  consciousnessLevel: number;
}

/**
 * PageBackground component
 * 
 * Renders a simplified background for the main page to ensure better performance
 * and avoid rendering issues.
 */
const PageBackground: React.FC<PageBackgroundProps> = () => {
  const { isLowPerformance } = usePerformance();
  
  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {/* Simple gradient background for better visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white/95 z-0"></div>
      
      {/* Optional subtle pattern for non-low performance devices */}
      {!isLowPerformance && (
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMSIgZmlsbD0icmdiYSgwLDAsMCwwLjAyKSIvPjwvc3ZnPg==')] opacity-30 z-0"></div>
      )}
    </div>
  );
};

export default React.memo(PageBackground);
