
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { NavigationNodeData, NavigationConnectionData } from '@/components/home/navigation/NodeData';
import { initialNodes, initialConnections } from '@/components/home/navigation/NodeData';
import { useQuantumTheme } from '@/components/visual-foundation';
import { usePerfConfig } from '@/hooks/usePerfConfig';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useQuantumTheme();
  const { config } = usePerfConfig();
  
  // Use device capability to determine whether to use the API or local data
  const shouldUseLocalData = config.deviceCapability === 'low';
  
  useEffect(() => {
    const fetchNavigationData = async () => {
      // If device capability is low, use local data
      if (shouldUseLocalData) {
        console.log('Using local navigation data due to low device capability');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
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
          setNodes(data.nodes);
          setConnections(data.connections);
          console.log('Successfully fetched navigation data from backend');
        }
      } catch (err) {
        console.error('Error fetching navigation data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error fetching navigation data');
        
        // Fallback to initial data on error
        setNodes(initialNodes);
        setConnections(initialConnections);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNavigationData();
  }, [theme, userLevel, shouldUseLocalData]);
  
  return { nodes, connections, isLoading, error };
};
