
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, PenLine } from 'lucide-react';
import useAuth from '@/hooks/auth/useAuth';

/**
 * ReflectionsPanel displays a user's recent reflections and insights
 */
const ReflectionsPanel: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <Card className="shadow-md h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-indigo-400" />
          Reflections
        </CardTitle>
        <CardDescription>
          Your journey of consciousness
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 border border-border/30 rounded-md bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Your reflections provide insights into your spiritual journey and help track your progress.
            </p>
          </div>
          
          <div className="flex justify-center mt-6">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <PenLine className="h-4 w-4" />
              New Reflection
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReflectionsPanel;
