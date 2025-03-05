
import React from 'react';

const EmotionalInsightsLoading = () => {
  return (
    <div className="glass-card p-4 animate-pulse">
      <div className="h-8 w-1/3 bg-white/10 rounded mb-4"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="h-24 bg-white/5 rounded"></div>
          <div className="h-16 bg-white/5 rounded"></div>
          <div className="h-20 bg-white/5 rounded"></div>
        </div>
        
        <div className="h-80 bg-white/5 rounded"></div>
      </div>
    </div>
  );
};

export default EmotionalInsightsLoading;
