
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const LoadingState: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="animate-pulse bg-card-foreground/10 h-6 w-1/3 rounded"></CardTitle>
        <CardDescription className="animate-pulse bg-card-foreground/10 h-4 w-2/3 rounded mt-2"></CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="animate-pulse bg-card-foreground/10 h-4 w-1/4 rounded"></div>
            <div className="animate-pulse bg-card-foreground/10 h-10 w-full rounded"></div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default LoadingState;
