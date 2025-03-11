
/**
 * Geometry Showcase Component
 * 
 * Display multiple sacred geometry patterns with different configurations.
 */
import React, { useState } from 'react';
import SacredGeometryPattern, { GeometryPatternType, PatternTheme } from './SacredGeometryPattern';
import { usePerformance } from '../../contexts/PerformanceContext';

interface GeometryShowcaseProps {
  className?: string;
  style?: React.CSSProperties;
}

export const GeometryShowcase: React.FC<GeometryShowcaseProps> = ({
  className = '',
  style = {}
}) => {
  const { qualityLevel, setQualityLevel, deviceCapability } = usePerformance();
  const [selectedPattern, setSelectedPattern] = useState<GeometryPatternType>('metatronsCube');
  const [selectedTheme, setSelectedTheme] = useState<PatternTheme>('default');
  
  const patternOptions: { value: GeometryPatternType; label: string }[] = [
    { value: 'metatronsCube', label: "Metatron's Cube" },
    { value: 'flowerOfLife', label: 'Flower of Life' },
    { value: 'seedOfLife', label: 'Seed of Life' },
    { value: 'treeOfLife', label: 'Tree of Life' },
    { value: 'sriYantra', label: 'Sri Yantra' }
  ];
  
  const themeOptions: { value: PatternTheme; label: string }[] = [
    { value: 'default', label: 'Default' },
    { value: 'cosmic', label: 'Cosmic' },
    { value: 'chakra', label: 'Chakra' },
    { value: 'energy', label: 'Energy' },
    { value: 'spiritual', label: 'Spiritual' },
    { value: 'quantum', label: 'Quantum' }
  ];
  
  return (
    <div className={`geometry-showcase ${className}`} style={style}>
      <div className="flex flex-col items-center space-y-6 p-4">
        <h2 className="text-2xl font-bold text-center">Sacred Geometry Patterns</h2>
        
        <p className="text-center text-gray-500 max-w-lg">
          Explore sacred geometry patterns with different themes and quality levels.
          Current device capability: <strong>{deviceCapability}</strong>
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {/* Pattern type selector */}
          <div className="form-control min-w-[200px]">
            <label className="label">
              <span className="label-text">Pattern</span>
            </label>
            <select 
              className="select select-bordered w-full"
              value={selectedPattern}
              onChange={(e) => setSelectedPattern(e.target.value as GeometryPatternType)}
            >
              {patternOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Theme selector */}
          <div className="form-control min-w-[200px]">
            <label className="label">
              <span className="label-text">Theme</span>
            </label>
            <select 
              className="select select-bordered w-full"
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value as PatternTheme)}
            >
              {themeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Quality level selector */}
          <div className="form-control min-w-[200px]">
            <label className="label">
              <span className="label-text">Quality Level</span>
            </label>
            <select 
              className="select select-bordered w-full"
              value={qualityLevel}
              onChange={(e) => setQualityLevel(parseInt(e.target.value))}
            >
              <option value="1">Low</option>
              <option value="2">Medium</option>
              <option value="3">High</option>
              <option value="4">Ultra</option>
              <option value="5">Extreme</option>
            </select>
          </div>
        </div>
        
        {/* Main pattern display */}
        <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-lg">
          <SacredGeometryPattern
            type={selectedPattern}
            theme={selectedTheme}
            size={320}
            animate={true}
            interactive={true}
            showLabels={false}
          />
        </div>
        
        {/* Pattern variations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
          {themeOptions.filter(t => t.value !== selectedTheme).map(theme => (
            <div key={theme.value} className="text-center">
              <SacredGeometryPattern
                type={selectedPattern}
                theme={theme.value}
                size={160}
                detail={Math.max(1, qualityLevel - 1)}
                animate={true}
              />
              <p className="mt-2 text-sm">{theme.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GeometryShowcase;
