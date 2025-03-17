
import React from 'react';
import { ChakraDisplay } from '@/features/chakra-system/components/ChakraDisplay';

/**
 * Chakra System Page
 * 
 * Displays the user's chakra system and provides tools for balancing and activation
 */
const ChakraSystemPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-quantum-100">Chakra System</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-quantum-900/40 backdrop-blur p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-quantum-100">Your Chakra Balance</h2>
          <ChakraDisplay showDetails interactive />
        </div>
        
        <div className="space-y-6">
          <div className="bg-quantum-900/40 backdrop-blur p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-quantum-100">Chakra Insights</h2>
            <p className="text-quantum-200 mb-4">
              Your heart chakra is currently your most activated energy center, 
              indicating an enhanced capacity for love, compassion, and emotional healing.
            </p>
            <p className="text-quantum-200">
              Consider focusing on your root chakra to bring greater balance to your
              energy system, which will help ground your spiritual experiences.
            </p>
          </div>
          
          <div className="bg-quantum-900/40 backdrop-blur p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-quantum-100">Recommended Practices</h2>
            <ul className="space-y-3">
              <li className="flex items-center p-3 bg-quantum-800/50 rounded">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                <span>Root Chakra Meditation - 10 minutes</span>
              </li>
              <li className="flex items-center p-3 bg-quantum-800/50 rounded">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-3"></div>
                <span>Crown Connection Breathing - 5 minutes</span>
              </li>
              <li className="flex items-center p-3 bg-quantum-800/50 rounded">
                <div className="w-3 h-3 rounded-full bg-orange-500 mr-3"></div>
                <span>Sacral Creative Visualization - 15 minutes</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChakraSystemPage;
