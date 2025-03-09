
import React from 'react';
import { DreamCaptureForm } from '@/components/dream-capture/DreamCaptureForm';

const DreamCapturePage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dream Capture</h1>
      <div className="max-w-2xl mx-auto">
        <DreamCaptureForm />
      </div>
    </div>
  );
};

export default DreamCapturePage;
