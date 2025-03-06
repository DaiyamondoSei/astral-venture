
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useReflections } from '../hooks/useReflections';
import LatestReflectionCard from './LatestReflectionCard';
import { Button } from '@/components/ui/button';
import { PenLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Component that shows the latest reflection and provides navigation to create
 * a new reflection
 */
const ReflectionCard: React.FC = () => {
  const { latestReflection, loading } = useReflections();
  const navigate = useNavigate();
  
  const handleNewReflection = () => {
    navigate('/reflection');
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Energy Reflection</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <LatestReflectionCard 
          latestReflection={latestReflection} 
          isLoading={loading} 
        />
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleNewReflection} 
          className="w-full" 
          variant="outline"
        >
          <PenLine size={16} className="mr-2" />
          Write New Reflection
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReflectionCard;
