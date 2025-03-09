
import React from 'react';
import MeditationTimer from '@/components/meditation/MeditationTimer';

const MeditationPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Meditation</h1>
      <MeditationTimer />
    </div>
  );
};

export default MeditationPage;
