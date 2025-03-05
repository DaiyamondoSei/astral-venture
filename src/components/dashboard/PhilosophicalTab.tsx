
import React from 'react';

interface PhilosophicalTabProps {
  onReflectionComplete?: (points: number) => void;
}

const PhilosophicalTab: React.FC<PhilosophicalTabProps> = ({ onReflectionComplete }) => {
  return (
    <div className="glass-card p-4">
      <h3>Philosophical Reflection</h3>
      <p>Coming soon...</p>
    </div>
  );
};

export default PhilosophicalTab;
