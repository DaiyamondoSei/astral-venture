
import React from 'react';
import { Route } from 'react-router-dom';

// Dev Components
import DesignSystemDemo from '@/dev/pages/DesignSystemDemo';
import TestPage from '@/dev/pages/TestPage';
import AstralBodyDemo from '@/dev/pages/AstralBodyDemo';
import AIPlayground from '@/dev/pages/AIPlayground';

// A dedicated router for development routes
const DevRoutes: React.FC = () => {
  return (
    <>
      <Route path="/dev/design" element={<DesignSystemDemo />} />
      <Route path="/dev/test" element={<TestPage />} />
      <Route path="/dev/astral-body" element={<AstralBodyDemo />} />
      <Route path="/dev/ai-playground" element={<AIPlayground />} />
    </>
  );
};

export default DevRoutes;
