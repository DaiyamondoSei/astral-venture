
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { NavigationNodeData, NavigationConnectionData } from '@/components/home/navigation/NodeData';
import { initialNodes, initialConnections } from '@/components/home/navigation/NodeData';
import { useQuantumTheme } from '@/components/visual-foundation';
import { usePerfConfig } from '@/hooks/usePerfConfig';
import useNavigationCache from './useNavigationCache';

interface NavigationDataResponse {
  nodes: NavigationNodeData[];
  connections: NavigationConnectionData[];
  meta: {
    themeSettings: Record<string, any>;
    userLevel: number;
    timestamp: string;
  };
}

export const useNavigationData = (userLevel = 1) => {
  const [nodes, setNodes] = useState<NavigationNodeData[]>(initialNodes);
  const [connections, setConnections] = useState<NavigationConnectionData[]>(initialConnections);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useQuantumTheme();
  const { config } = usePerfConfig();
  
  // Use device capability to determine whether to use the API or local data
  const shouldUseLocalData = config.deviceCapability === 'low';
  
  // Create a fetch function for the navigation data
  const fetchNavigationData = useCallback(async () => {
    // If device capability is low, use local data
    if (shouldUseLocalData) {
      console.log('Using local navigation data due to low device capability');
      return { nodes: initialNodes, connections: initialConnections };
    }
    
    try {
      const { data, error } = await supabase.functions.invoke<NavigationDataResponse>(
        'get-navigation-nodes', 
        {
          body: { 
            level: userLevel.toString(),
            theme
          }
        }
      );
      
      if (error) throw new Error(error.message);
      
      if (data) {
        console.log('Successfully fetched navigation data from backend');
        return { nodes: data.nodes, connections: data.connections };
      }
      
      return { nodes: initialNodes, connections: initialConnections };
    } catch (err) {
      console.error('Error fetching navigation data:', err);
      throw err;
    }
  }, [theme, userLevel, shouldUseLocalData]);
  
  // Use the navigation cache hook with a cache key based on theme and user level
  const cacheKey = `navigation-data-${theme}-${userLevel}`;
  const { data, isLoading } = useNavigationCache(
    cacheKey,
    fetchNavigationData,
    { expirationTime: 15 * 60 * 1000 } // 15 minutes cache
  );
  
  // Update state when cached data changes
  useEffect(() => {
    if (data) {
      setNodes(data.nodes);
      setConnections(data.connections);
    }
  }, [data]);
  
  // Set error if local data is used due to low device capability
  useEffect(() => {
    if (shouldUseLocalData) {
      setError('Using simplified navigation data for better performance');
    } else {
      setError(null);
    }
  }, [shouldUseLocalData]);
  
  return { nodes, connections, isLoading, error };
};

export default useNavigationData;
