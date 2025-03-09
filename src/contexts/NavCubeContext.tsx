
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { SacredGeometryIconType } from '@/components/navigation/SacredGeometryIcon';

// Define types for navigation nodes and connections
export interface NavNode {
  id: string;
  label: string;
  description?: string;
  iconType: SacredGeometryIconType;
  x: number;
  y: number;
  isDisabled?: boolean;
  route?: string;
}

export interface NavConnection {
  id: string;
  from: string;
  to: string;
  isRequired?: boolean;
}

// Define context type
interface NavCubeContextType {
  nodes: NavNode[];
  connections: NavConnection[];
  activeNodeId: string | null;
  previousNodeId: string | null;
  history: string[];
  setActiveNode: (nodeId: string) => void;
  navigateToNode: (nodeId: string) => void;
  isNodeActive: (nodeId: string) => boolean;
  isConnectionActive: (fromId: string, toId: string) => boolean;
  goBack: () => void;
  getNodeById: (nodeId: string) => NavNode | undefined;
}

// Create context with default values
const NavCubeContext = createContext<NavCubeContextType>({
  nodes: [],
  connections: [],
  activeNodeId: null,
  previousNodeId: null,
  history: [],
  setActiveNode: () => {},
  navigateToNode: () => {},
  isNodeActive: () => false,
  isConnectionActive: () => false,
  goBack: () => {},
  getNodeById: () => undefined
});

interface NavCubeProviderProps {
  children: ReactNode;
  initialNodes: NavNode[];
  initialConnections: NavConnection[];
  initialActiveNodeId?: string;
}

export const NavCubeProvider: React.FC<NavCubeProviderProps> = ({
  children,
  initialNodes,
  initialConnections,
  initialActiveNodeId = null
}) => {
  const [nodes, setNodes] = useState<NavNode[]>(initialNodes);
  const [connections, setConnections] = useState<NavConnection[]>(initialConnections);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(initialActiveNodeId);
  const [previousNodeId, setPreviousNodeId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>(initialActiveNodeId ? [initialActiveNodeId] : []);

  // Set active node without navigation
  const setActiveNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node && !node.isDisabled) {
      setPreviousNodeId(activeNodeId);
      setActiveNodeId(nodeId);
    }
  }, [nodes, activeNodeId]);

  // Navigate to a node (updates history)
  const navigateToNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node && !node.isDisabled) {
      setPreviousNodeId(activeNodeId);
      setActiveNodeId(nodeId);
      setHistory(prev => [...prev, nodeId]);
    }
  }, [nodes, activeNodeId]);

  // Go back to previous node
  const goBack = useCallback(() => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // Remove current node
      const previousNode = newHistory[newHistory.length - 1];
      setPreviousNodeId(activeNodeId);
      setActiveNodeId(previousNode);
      setHistory(newHistory);
    }
  }, [history, activeNodeId]);

  // Check if a node is active
  const isNodeActive = useCallback((nodeId: string) => {
    return nodeId === activeNodeId;
  }, [activeNodeId]);

  // Check if a connection is active (both nodes are in the history and connected)
  const isConnectionActive = useCallback((fromId: string, toId: string) => {
    // Connection is active if both nodes are in history and adjacent
    const fromIndex = history.indexOf(fromId);
    const toIndex = history.indexOf(toId);
    
    // First check if both nodes are in history and have adjacent indices
    if (fromIndex !== -1 && toIndex !== -1 && Math.abs(fromIndex - toIndex) === 1) {
      return true;
    }
    
    // Also check if one of them is the active node and the other is the previous node
    if ((fromId === activeNodeId && toId === previousNodeId) || 
        (fromId === previousNodeId && toId === activeNodeId)) {
      return true;
    }
    
    return false;
  }, [history, activeNodeId, previousNodeId]);

  // Get node by ID
  const getNodeById = useCallback((nodeId: string) => {
    return nodes.find(node => node.id === nodeId);
  }, [nodes]);

  const contextValue: NavCubeContextType = {
    nodes,
    connections,
    activeNodeId,
    previousNodeId,
    history,
    setActiveNode,
    navigateToNode,
    isNodeActive,
    isConnectionActive,
    goBack,
    getNodeById
  };

  return (
    <NavCubeContext.Provider value={contextValue}>
      {children}
    </NavCubeContext.Provider>
  );
};

// Custom hook for using the nav cube context
export const useNavCube = () => {
  const context = useContext(NavCubeContext);
  if (!context) {
    throw new Error('useNavCube must be used within a NavCubeProvider');
  }
  return context;
};

export default NavCubeContext;
