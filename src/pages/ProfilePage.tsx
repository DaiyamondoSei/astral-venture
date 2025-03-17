
import React from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Profile Page
 * 
 * Displays and manages user profile information
 */
const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-quantum-100">Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-quantum-900/40 backdrop-blur p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-quantum-100">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-quantum-300">
                  Display Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-quantum-800/70 border border-quantum-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  defaultValue={user?.email?.split('@')[0] || 'Cosmic Traveler'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-quantum-300">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 bg-quantum-800/70 border border-quantum-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  defaultValue={user?.email || 'user@example.com'}
                  disabled
                />
                <p className="text-xs text-quantum-400 mt-1">Email address cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-quantum-300">
                  Bio
                </label>
                <textarea
                  className="w-full px-4 py-2 bg-quantum-800/70 border border-quantum-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  defaultValue="Exploring consciousness and expanding awareness through meditation and spiritual practices."
                />
              </div>
              
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white">
                Save Changes
              </button>
            </div>
          </div>
          
          <div className="bg-quantum-900/40 backdrop-blur p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-quantum-100">Account Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Notifications</h3>
                  <p className="text-sm text-quantum-300">Receive meditation reminders</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-quantum-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Dark Mode</h3>
                  <p className="text-sm text-quantum-300">Use dark theme</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-quantum-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              <div className="pt-4 border-t border-quantum-700">
                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white">
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-quantum-900/40 backdrop-blur p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-quantum-100">Your Journey</h2>
            <div className="text-center py-3">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-900/50 text-2xl font-bold mb-2">
                3
              </div>
              <div className="font-medium">Astral Level</div>
              <div className="text-sm text-quantum-300 mb-4">Awakening Explorer</div>
              
              <div className="mb-2">
                <div className="flex justify-between mb-1 text-sm">
                  <span>Level Progress</span>
                  <span>65%</span>
                </div>
                <div className="w-full bg-quantum-700 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              
              <p className="text-sm text-quantum-300 mt-3">
                420 energy points until level 4
              </p>
            </div>
          </div>
          
          <div className="bg-quantum-900/40 backdrop-blur p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-quantum-100">Achievements</h2>
            <ul className="space-y-3">
              <li className="flex items-center p-3 bg-quantum-800/50 rounded">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-600 mr-3">
                  ✨
                </div>
                <div>
                  <div className="font-medium">Early Riser</div>
                  <div className="text-sm text-quantum-300">Completed 5 morning meditations</div>
                </div>
              </li>
              <li className="flex items-center p-3 bg-quantum-800/50 rounded">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 mr-3">
                  🔮
                </div>
                <div>
                  <div className="font-medium">Dream Recorder</div>
                  <div className="text-sm text-quantum-300">Logged 10 dreams</div>
                </div>
              </li>
              <li className="flex items-center p-3 bg-quantum-800/50 rounded opacity-50">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-600 mr-3">
                  🌟
                </div>
                <div>
                  <div className="font-medium">Astral Projector</div>
                  <div className="text-sm text-quantum-300">First successful projection</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
