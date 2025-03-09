
import React from 'react';
import { Card } from '@/components/ui/card';

interface RecommendedPracticesProps {
  reflectionId?: string;
}

const RecommendedPractices: React.FC<RecommendedPracticesProps> = ({ reflectionId }) => {
  // Mock implementation to fix build errors
  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-2">Recommended Practices</h3>
      <div className="text-sm text-muted-foreground">
        Recommendations for reflection {reflectionId || 'unknown'}
      </div>
    </Card>
  );
};

export default RecommendedPractices;
