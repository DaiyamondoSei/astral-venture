
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Astral Projection Page
 * 
 * Main page for astral projection practices and tracking
 */
const AstralProjectionPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-quantum-100">Astral Projection</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-quantum-900/30 border-quantum-700">
          <CardHeader>
            <CardTitle className="text-xl text-quantum-100">Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-quantum-200">
              The Astral Projection module is currently in development. Soon you'll be able to:
            </p>
            <ul className="mt-4 space-y-2 text-quantum-300">
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                <span>Follow guided preparation exercises</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                <span>Track your astral journeys</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div>
                <span>Learn advanced techniques</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-violet-500 mr-2"></div>
                <span>Connect with the astral community</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="bg-quantum-900/30 border-quantum-700">
          <CardHeader>
            <CardTitle className="text-xl text-quantum-100">Preparation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-quantum-200 mb-4">
              While you wait for the full module, here are some preparations you can start:
            </p>
            
            <div className="space-y-4">
              <div className="p-3 rounded bg-quantum-800/50">
                <h3 className="font-medium text-quantum-100">Dream Journaling</h3>
                <p className="text-sm text-quantum-300">
                  Record your dreams daily to improve dream recall, an essential skill for astral projection.
                </p>
              </div>
              
              <div className="p-3 rounded bg-quantum-800/50">
                <h3 className="font-medium text-quantum-100">Meditation</h3>
                <p className="text-sm text-quantum-300">
                  Practice daily meditation to improve focus and awareness.
                </p>
              </div>
              
              <div className="p-3 rounded bg-quantum-800/50">
                <h3 className="font-medium text-quantum-100">Chakra Balancing</h3>
                <p className="text-sm text-quantum-300">
                  Use the Chakra System module to balance your energy centers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AstralProjectionPage;
