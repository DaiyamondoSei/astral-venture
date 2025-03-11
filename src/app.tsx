
import React from 'react';
import { PerformanceProvider } from './contexts/PerformanceContext';
import GeometryShowcase from './components/visual-foundation/GeometryShowcase';

function App() {
  return (
    <PerformanceProvider>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Sacred Geometry Visualization System
        </h1>
        
        <GeometryShowcase />
      </div>
    </PerformanceProvider>
  );
}

export default App;
