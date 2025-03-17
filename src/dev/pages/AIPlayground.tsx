
import React from 'react';

/**
 * AI Playground Page for development testing
 * 
 * This page serves as a testing ground for AI-related features and components.
 */
const AIPlayground: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">AI Playground</h1>
      
      <div className="bg-quantum-900/50 p-6 rounded-lg backdrop-blur-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">AI Feature Testing</h2>
        <p className="text-quantum-100 mb-4">
          This area is dedicated to testing and development of AI-related features.
          Use this space to experiment with new AI components, integrations,
          and functionalities before they are integrated into the main application.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-quantum-800/60 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">AI Response Testing</h3>
            <p className="text-sm text-quantum-200 mb-4">
              Test AI response generation and formatting
            </p>
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm">
                Open Test Panel
              </button>
            </div>
          </div>
          
          <div className="bg-quantum-800/60 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Model Performance</h3>
            <p className="text-sm text-quantum-200 mb-4">
              Compare response quality and performance across different models
            </p>
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm">
                Run Benchmarks
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-quantum-900/50 p-6 rounded-lg backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-4">Live Testing Console</h2>
          <div className="h-64 bg-quantum-800/80 rounded-lg p-4 font-mono text-sm text-quantum-100">
            <div>// AI testing console</div>
            <div>// Use this area to log AI responses and debug interactions</div>
            <div className="mt-4 text-green-400">$ Ready for input...</div>
          </div>
          
          <div className="mt-4">
            <textarea 
              className="w-full h-20 bg-quantum-800/80 rounded-lg p-4 text-quantum-100 font-mono text-sm"
              placeholder="Enter test prompt here..."
            ></textarea>
            <div className="flex justify-end mt-2">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm">
                Send Request
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-quantum-900/50 p-6 rounded-lg backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-4">Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Model Selection</label>
              <select className="w-full bg-quantum-800 rounded-lg p-2 text-sm">
                <option>Default Assistant</option>
                <option>GPT-4</option>
                <option>Claude 3</option>
                <option>Gemini Pro</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Temperature</label>
              <input type="range" className="w-full" min="0" max="1" step="0.1" defaultValue="0.7" />
              <div className="flex justify-between text-xs">
                <span>0.0</span>
                <span>0.5</span>
                <span>1.0</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Max Tokens</label>
              <input 
                type="number" 
                className="w-full bg-quantum-800 rounded-lg p-2 text-sm"
                defaultValue={2048}
                min={1}
                max={8192}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPlayground;
