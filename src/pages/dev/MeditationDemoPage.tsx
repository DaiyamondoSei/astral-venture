
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import MeditationTimer from '@/features/meditation/components/MeditationTimer';
import { Button } from '@/components/ui/button';

/**
 * A demo page to showcase the meditation timer functionality
 */
const MeditationDemoPage: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [completedSessions, setCompletedSessions] = useState(0);
  
  // Log events
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 10));
  };
  
  // Handle meditation session complete
  const handleSessionComplete = () => {
    addLog('Meditation session completed');
    setCompletedSessions(prev => prev + 1);
  };
  
  // Handle session start
  const handleSessionStart = () => {
    addLog('Meditation session started');
  };
  
  // Handle session pause
  const handleSessionPause = () => {
    addLog('Meditation session paused');
  };
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Meditation Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meditation Timer */}
        <div>
          <MeditationTimer 
            initialDuration={5}
            onComplete={handleSessionComplete}
            onStart={handleSessionStart}
            onPause={handleSessionPause}
          />
        </div>
        
        {/* Session Stats & Logs */}
        <div className="space-y-6">
          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Meditation Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">{completedSessions}</div>
                  <div className="text-sm text-gray-500">Completed Sessions</div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">{completedSessions * 5}</div>
                  <div className="text-sm text-gray-500">Total Minutes</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Logs Card */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Recent meditation activity</CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length > 0 ? (
                <div className="space-y-2 text-sm font-mono max-h-[300px] overflow-y-auto">
                  {logs.map((log, index) => (
                    <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-1">
                      {log}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-6">
                  No activity yet. Start a meditation session.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MeditationDemoPage;
