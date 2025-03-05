
import React from 'react';
import { TrendingUp } from 'lucide-react';

interface RecommendedPracticesProps {
  practices: string[];
  loading?: boolean;
}

const RecommendedPractices: React.FC<RecommendedPracticesProps> = ({ 
  practices = [], 
  loading = false 
}) => {
  if (practices.length === 0 && !loading) return null;
  
  return (
    <div className="pt-2">
      <h4 className="text-sm font-medium text-white/80 mb-2 flex items-center">
        <TrendingUp size={14} className="mr-1 text-quantum-400" />
        Recommended Practices
      </h4>
      <div className="space-y-1">
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-3 bg-white/10 rounded w-full"></div>
            <div className="h-3 bg-white/10 rounded w-5/6"></div>
          </div>
        ) : (
          practices.map((practice, i) => (
            <div key={i} className="text-sm text-white/70 flex items-center">
              <span className="text-quantum-400 mr-1">•</span>
              {practice}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecommendedPractices;
