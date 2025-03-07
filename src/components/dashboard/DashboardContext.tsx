
import React, { createContext, useContext, ReactNode } from 'react';

interface DashboardContextType {
  onOpenAIAssistant: () => void;
}

const DashboardContext = createContext<DashboardContextType>({
  onOpenAIAssistant: () => {},
});

export const useDashboardContext = () => useContext(DashboardContext);

interface DashboardProviderProps {
  children: ReactNode;
  onOpenAIAssistant: () => void;
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
