
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useConsciousness } from '@/contexts/ConsciousnessContext';
import { useUser } from '@/hooks/useAuth';

const ReflectionHistory = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { dreams } = useConsciousness();
  const user = useUser();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-xl font-semibold mb-2">Sign in to View Reflections</h3>
        <p className="text-gray-500 dark:text-gray-400">
          You need to be signed in to access your reflection history.
        </p>
      </Card>
    );
  }

  if (dreams.length === 0) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-xl font-semibold mb-2">No Reflections Yet</h3>
        <p className="text-gray-500 dark:text-gray-400">
          You haven't recorded any dreams or reflections yet. Start by capturing a dream.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Reflection Journey</h2>
      </div>
      
      <div className="space-y-4">
        {dreams.map((dream) => (
          <Card key={dream.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between mb-2">
              <h3 className="text-lg font-medium">{dream.analysis?.theme || 'Dream Reflection'}</h3>
              <span className="text-sm text-gray-500">
                {new Date(dream.date).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-2">
              {dream.content}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {dream.emotionalTone.map((emotion, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-xs"
                >
                  {emotion}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReflectionHistory;
