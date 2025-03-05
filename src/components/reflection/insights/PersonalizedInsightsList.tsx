
import React from 'react';
import { Sparkles } from 'lucide-react';

interface PersonalizedInsightsListProps {
  insights: string[];
  loading?: boolean;
}

const PersonalizedInsightsList: React.FC<PersonalizedInsightsListProps> = ({ 
  insights = [],
  loading = false
}) => {
  if (insights.length === 0 && !loading) return null;
  
  return (
    <div className="pt-2">
      <h4 className="text-sm font-medium text-white/80 mb-2 flex items-center">
        <Sparkles size={14} className="mr-1 text-quantum-400" />
        Personalized Insights
      </h4>
      <div className="space-y-2">
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-3 bg-white/10 rounded w-full"></div>
            <div className="h-3 bg-white/10 rounded w-5/6"></div>
          </div>
        ) : (
          insights.map((insight, i) => (
            <div key={i} className="text-sm text-white/70">
              {insight}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PersonalizedInsightsList;
