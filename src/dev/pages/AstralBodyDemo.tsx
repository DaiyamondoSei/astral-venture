
import React from 'react';
import { Link } from 'react-router-dom';
import AstralBody from '@/features/astral/components/AstralBody';
import { useAIVisualProcessing } from '@/services/ai/hooks/useAIVisualProcessing';

const AstralBodyDemo: React.FC = () => {
  const { geometryPattern, regeneratePattern, isLoading } = useAIVisualProcessing({
    initialComplexity: 3,
    chakraAssociations: [1, 3, 5]
  });
  
  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <div className="mb-6">
        <Link to="/dev" className="text-quantum-300 hover:text-quantum-100 transition-colors">
          &larr; Back to Dev Home
        </Link>
        <h1 className="text-3xl font-display mt-2">Astral Body Demo</h1>
        <p className="text-quantum-300 mt-1">
          A development page for testing the Astral Body visualization components.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-quantum-800/30 p-6 rounded-lg">
          <h2 className="text-xl font-medium mb-4">Standard Astral Body</h2>
          <div className="aspect-square flex items-center justify-center bg-quantum-900/50 rounded-lg">
            <AstralBody />
          </div>
        </div>
        
        <div className="bg-quantum-800/30 p-6 rounded-lg">
          <h2 className="text-xl font-medium mb-4">AI-Generated Geometry</h2>
          <div className="aspect-square flex items-center justify-center bg-quantum-900/50 rounded-lg">
            {isLoading ? (
              <div className="animate-pulse">Generating...</div>
            ) : (
              geometryPattern && (
                <div className="w-full h-full relative">
                  {/* Render geometry pattern here */}
                  <pre className="text-xs overflow-auto max-h-full">
                    {JSON.stringify(geometryPattern, null, 2)}
                  </pre>
                </div>
              )
            )}
          </div>
          <button 
            onClick={() => regeneratePattern()}
            className="mt-4 px-4 py-2 bg-quantum-600 hover:bg-quantum-500 transition-colors rounded-md"
            disabled={isLoading}
          >
            Regenerate Pattern
          </button>
        </div>
      </div>
    </div>
  );
};

export default AstralBodyDemo;
