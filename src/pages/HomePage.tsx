
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

/**
 * Simplified Home Page
 * 
 * A minimal landing page that provides navigation to the main features.
 */
const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Consciousness Portal</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          A simple interface for meditation, energy tracking, and consciousness expansion.
        </p>
      </div>
      
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Meditation Card */}
        <Card>
          <CardHeader>
            <CardTitle>Meditation</CardTitle>
            <CardDescription>Guided sessions and timers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Start a meditation session with our simple timer or guided practices.</p>
            <Button asChild className="w-full">
              <Link to="/dev/meditation-demo">Start Meditation</Link>
            </Button>
          </CardContent>
        </Card>
        
        {/* Chakra System Card */}
        <Card>
          <CardHeader>
            <CardTitle>Chakra System</CardTitle>
            <CardDescription>Energy center visualization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Explore and balance your chakra energy centers.</p>
            <Button asChild className="w-full">
              <Link to="/dev/chakra-demo">Open Chakra System</Link>
            </Button>
          </CardContent>
        </Card>
        
        {/* Component Library Card */}
        <Card>
          <CardHeader>
            <CardTitle>Component Library</CardTitle>
            <CardDescription>UI component showcase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>View all available UI components for development.</p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/dev/components">View Components</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Coming Soon Section */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4 text-center">Coming Soon</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {['Dream Journal', 'Astral Projection', 'Energy Tracking', 'AI Insights'].map((feature) => (
            <Card key={feature} className="bg-gray-50 dark:bg-gray-800 border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{feature}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Under development</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
