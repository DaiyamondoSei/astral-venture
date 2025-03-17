
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Book, Star } from 'lucide-react';

interface RecentReflectionsWidgetProps {
  onClick?: () => void;
}

const RecentReflectionsWidget: React.FC<RecentReflectionsWidgetProps> = ({ onClick }) => {
  // In a real implementation, this would come from a hook or API
  const reflections = [
    { id: '1', title: 'Morning Meditation', date: '2023-12-10', stars: 4 },
    { id: '2', title: 'Dream Journey', date: '2023-12-08', stars: 5 },
    { id: '3', title: 'Evening Reflection', date: '2023-12-05', stars: 3 },
  ];
  
  return (
    <Card 
      className="border-quantum-700 bg-quantum-800/50 transition-all hover:shadow-lg hover:shadow-purple-900/20 cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-quantum-900">
            <Book className="h-4 w-4 text-purple-400" />
          </div>
          Recent Reflections
        </CardTitle>
        <CardDescription>Your recent journal entries</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reflections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reflections yet. Start your journey.</p>
          ) : (
            reflections.map((reflection) => (
              <div key={reflection.id} className="flex justify-between items-center pb-2 border-b border-quantum-700">
                <div>
                  <h4 className="font-medium text-sm">{reflection.title}</h4>
                  <p className="text-xs text-muted-foreground">{new Date(reflection.date).toLocaleDateString()}</p>
                </div>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      className={i < reflection.stars ? "fill-yellow-500 text-yellow-500" : "text-quantum-600"} 
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentReflectionsWidget;
