
import React, { createContext, useContext, ReactNode, useCallback } from 'react';

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
  // Use callback to prevent unnecessary re-renders
  const handleOpenAIAssistant = useCallback((reflectionId?: string, reflectionContent?: string) => {
    console.log("Opening AI Assistant from Dashboard Context", { reflectionId, reflectionContent });
    onOpenAIAssistant(reflectionId, reflectionContent);
  }, [onOpenAIAssistant]);

  return (
    <DashboardContext.Provider value={{ onOpenAIAssistant: handleOpenAIAssistant }}>
      {children}
    </DashboardContext.Provider>
  );
};
