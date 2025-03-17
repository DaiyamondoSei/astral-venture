
import React from 'react';
import { MeditationTimer } from '@/features/meditation/components/MeditationTimer';

/**
 * Meditation Page
 * 
 * Provides guided and unguided meditation practices
 */
const MeditationPage: React.FC = () => {
  const handleMeditationComplete = () => {
    console.log('Meditation session completed');
    // TODO: Log to backend, update user stats, etc.
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-quantum-100">Meditation</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-quantum-900/40 backdrop-blur p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-6 text-quantum-100">Today's Practice</h2>
          
          <div className="flex flex-col items-center justify-center py-8">
            <MeditationTimer 
              duration={10} 
              onComplete={handleMeditationComplete}
              chakraFocus={['heart', 'crown']}
            />
            
            <div className="mt-8 text-center">
              <h3 className="text-lg font-medium mb-2">Cosmic Consciousness Meditation</h3>
              <p className="text-quantum-200 max-w-md mx-auto">
                This meditation connects your heart and crown chakras, 
                opening a channel for cosmic consciousness to flow through your being.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-quantum-900/40 backdrop-blur p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-quantum-100">Your Progress</h2>
            <div className="mb-4">
              <div className="flex justify-between mb-1 text-sm">
                <span>Weekly Goal</span>
                <span>3 of 5 sessions</span>
              </div>
              <div className="w-full bg-quantum-700 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span>Session Streak</span>
                <span>3 days</span>
              </div>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5, 6, 7].map(day => (
                  <div 
                    key={day}
                    className={`h-2 w-full rounded-full ${day <= 3 ? 'bg-purple-600' : 'bg-quantum-700'}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-quantum-900/40 backdrop-blur p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-quantum-100">Recommended</h2>
            <ul className="space-y-3">
              <li className="p-3 bg-quantum-800/50 rounded cursor-pointer hover:bg-quantum-800">
                <div className="font-medium">Third Eye Activation</div>
                <div className="text-sm text-quantum-300">10 min • Intermediate</div>
              </li>
              <li className="p-3 bg-quantum-800/50 rounded cursor-pointer hover:bg-quantum-800">
                <div className="font-medium">Quantum Breath</div>
                <div className="text-sm text-quantum-300">5 min • Beginner</div>
              </li>
              <li className="p-3 bg-quantum-800/50 rounded cursor-pointer hover:bg-quantum-800">
                <div className="font-medium">Energy Cleansing</div>
                <div className="text-sm text-quantum-300">15 min • Advanced</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeditationPage;
