
import React from 'react';
import ReflectionHistory from '@/components/reflection/ReflectionHistory';

const ReflectionPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Reflection</h1>
      <ReflectionHistory />
    </div>
  );
};

export default ReflectionPage;
