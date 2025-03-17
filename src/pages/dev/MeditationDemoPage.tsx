
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

/**
 * Meditation Demo Page
 * 
 * This page demonstrates various meditation components and features
 * for development and testing purposes.
 */
const MeditationDemoPage: React.FC = () => {
  const [duration, setDuration] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">Meditation Demo</h1>
      
      <Tabs defaultValue="timer" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="timer">Meditation Timer</TabsTrigger>
          <TabsTrigger value="breathing">Breathing Patterns</TabsTrigger>
          <TabsTrigger value="techniques">Techniques</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meditation Timer</CardTitle>
              <CardDescription>
                Test the meditation timer component with different durations and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium">Duration: {duration} minutes</label>
                  <Slider 
                    value={[duration]} 
                    min={1} 
                    max={60} 
                    step={1}
                    onValueChange={(value) => setDuration(value[0])}
                    className="w-full"
                  />
                </div>
                
                <div className="flex items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-4">{duration}:00</div>
                    <Button 
                      size="lg"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? 'Pause' : 'Start Meditation'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="breathing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Breathing Patterns</CardTitle>
              <CardDescription>
                Test different breathing pattern visualizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-center text-gray-500 dark:text-gray-400">Breathing pattern visualizations will appear here</p>
                {/* Breathing pattern component would be placed here */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="techniques" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meditation Techniques</CardTitle>
              <CardDescription>
                Browse and test different meditation techniques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Mindful Breathing</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Focus on the breath to anchor awareness in the present moment</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Body Scan</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Systematically bring attention to different parts of the body</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Loving-Kindness</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cultivate feelings of goodwill, kindness, and warmth towards others</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Visualization</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Use mental imagery to promote relaxation and positive change</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MeditationDemoPage;
