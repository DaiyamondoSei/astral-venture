
import React, { createContext, useContext, ReactNode } from 'react';

interface DashboardContextType {
  onOpenAIAssistant: (reflectionId?: string, reflectionContent?: string) => void;
}

const DashboardContext = createContext<DashboardContextType>({
  onOpenAIAssistant: () => {},
});

export const useDashboardContext = () => useContext(DashboardContext);

interface DashboardProviderProps {
  children: ReactNode;
  onOpenAIAssistant: (reflectionId?: string, reflectionContent?: string) => void;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ 
  children,
  onOpenAIAssistant
}) => {
  return (
    <DashboardContext.Provider value={{ onOpenAIAssistant }}>
      {children}
    </DashboardContext.Provider>
  );
};
