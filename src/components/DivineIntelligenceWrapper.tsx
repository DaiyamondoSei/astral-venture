
import React from 'react';
import { DivineIntelligenceProvider } from '@/contexts/DivineIntelligenceContext';

interface DivineIntelligenceWrapperProps {
  children: React.ReactNode;
}

const DivineIntelligenceWrapper: React.FC<DivineIntelligenceWrapperProps> = ({ children }) => {
  return (
    <DivineIntelligenceProvider>
      {children}
    </DivineIntelligenceProvider>
  );
};

export default DivineIntelligenceWrapper;
