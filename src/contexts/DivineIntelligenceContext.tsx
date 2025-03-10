
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDivineIntelligence } from '@/hooks/useDivineIntelligence';
import { DivineCoreResponse, UserContext } from '@/services/ai/divineCoreService';

interface DivineIntelligenceContextType {
  processMessage: (message: string, intentType?: string) => Promise<DivineCoreResponse | null>;
  isProcessing: boolean;
  lastResponse: DivineCoreResponse | null;
  userContext: UserContext | null;
  error: string | null;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  clearConversation: () => void;
}

const DivineIntelligenceContext = createContext<DivineIntelligenceContextType | null>(null);

interface DivineIntelligenceProviderProps {
  children: ReactNode;
}

export const DivineIntelligenceProvider: React.FC<DivineIntelligenceProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { 
    processQuery, 
    isProcessing, 
    response, 
    error, 
    userContext 
  } = useDivineIntelligence();
  
  const [lastResponse, setLastResponse] = useState<DivineCoreResponse | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);

  // Update last response when a new response is received
  useEffect(() => {
    if (response) {
      setLastResponse(response);
    }
  }, [response]);

  // Process a message and update conversation history
  const processMessage = async (message: string, intentType?: string): Promise<DivineCoreResponse | null> => {
    // Add user message to history
    setConversationHistory(prev => [
      ...prev,
      {
        role: 'user',
        content: message,
        timestamp: new Date()
      }
    ]);
    
    // Process the message
    const result = await processQuery(message);
    
    if (result) {
      // Add assistant response to history
      setConversationHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          content: result.message,
          timestamp: new Date()
        }
      ]);
    }
    
    return result;
  };

  // Clear the conversation history
  const clearConversation = () => {
    setConversationHistory([]);
    setLastResponse(null);
  };

  // Reset conversation when user changes
  useEffect(() => {
    clearConversation();
  }, [user?.id]);

  const value: DivineIntelligenceContextType = {
    processMessage,
    isProcessing,
    lastResponse,
    userContext,
    error,
    conversationHistory,
    clearConversation
  };

  return (
    <DivineIntelligenceContext.Provider value={value}>
      {children}
    </DivineIntelligenceContext.Provider>
  );
};

export const useDivineIntelligenceContext = () => {
  const context = useContext(DivineIntelligenceContext);
  if (!context) {
    throw new Error('useDivineIntelligenceContext must be used within a DivineIntelligenceProvider');
  }
  return context;
};
