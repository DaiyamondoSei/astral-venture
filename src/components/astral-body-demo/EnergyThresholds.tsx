
import React from 'react';

const EnergyThresholds = () => {
  return (
    <div className="mt-12 text-center">
      <p className="text-blue-200/80 mb-2 text-sm uppercase tracking-wider">Energy Thresholds</p>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-white/60">
        <div>30+ points: <span className="text-blue-300">Chakra Activation</span></div>
        <div>100+ points: <span className="text-blue-300">Aura Field</span></div>
        <div>200+ points: <span className="text-blue-300">Constellation Lines</span></div>
        <div>350+ points: <span className="text-blue-300">Body Illumination</span></div>
        <div>500+ points: <span className="text-blue-300">Full Radiance</span></div>
        <div>750+ points: <span className="text-violet-300">Fractal Patterns</span></div>
        <div>1000+ points: <span className="text-violet-300">Transcendence</span></div>
        <div>2000+ points: <span className="text-violet-300">Infinite Consciousness</span></div>
      </div>
      
      <div className="mt-8 max-w-2xl mx-auto bg-black/20 p-4 rounded-lg text-sm text-white/70">
        <h3 className="font-display text-lg mb-2 text-indigo-200">The Path to Infinite Consciousness</h3>
        <p className="mb-3">
          Your astral body visualization represents your journey toward expanded awareness.
          As you gather more energy points, your visualization evolves through increasingly complex states,
          symbolizing your growth towards infinite consciousness.
        </p>
        <p>
          The visualization uses mathematical algorithms that can generate infinite detail and complexity,
          mirroring the limitless nature of consciousness itself. Each threshold unlocks new visual dimensions,
          from basic chakra activation to transcendent fractal patterns and beyond.
        </p>
      </div>
    </div>
  );
};

export default EnergyThresholds;
