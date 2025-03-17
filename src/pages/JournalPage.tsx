
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Plus, Calendar, LineChart, Star } from 'lucide-react';

const JournalPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Journal</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </div>
        <p className="text-muted-foreground">
          Track your dreams, reflections, and spiritual insights
        </p>
      </div>
      
      <Tabs defaultValue="entries" className="space-y-4">
        <TabsList className="bg-quantum-800">
          <TabsTrigger value="entries" className="data-[state=active]:bg-quantum-700">
            <Calendar className="mr-2 h-4 w-4" />
            Entries
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-quantum-700">
            <Star className="mr-2 h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-quantum-700">
            <LineChart className="mr-2 h-4 w-4" />
            Stats
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="entries" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-quantum-700 bg-quantum-800/50 hover:bg-quantum-800/80 cursor-pointer transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Dream Journey {i + 1}</CardTitle>
                  <CardDescription>{new Date(2023, 11, 15 - i).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-quantum-300 line-clamp-3">
                    In this reflection I explored the depths of consciousness and discovered new aspects of my spiritual journey. The insights gained were profound and transformative.
                  </p>
                  <div className="flex mt-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star 
                        key={j} 
                        size={16} 
                        className={j < 4 ? "fill-yellow-500 text-yellow-500" : "text-quantum-600"} 
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-4">
          <Card className="border-quantum-700 bg-quantum-800/50">
            <CardHeader>
              <CardTitle>Journal Insights</CardTitle>
              <CardDescription>AI-powered analysis of your journal entries</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-quantum-300">
                Insights will appear here as you add more journal entries.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-4">
          <Card className="border-quantum-700 bg-quantum-800/50">
            <CardHeader>
              <CardTitle>Journal Statistics</CardTitle>
              <CardDescription>Tracking your journaling habits and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-quantum-300">
                Statistics will appear here as you add more journal entries.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JournalPage;
