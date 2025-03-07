
import { useState, useEffect, useCallback } from 'react';

/**
 * Node status interface defining the unlocked state and requirements
 */
export interface NodeStatus {
  unlocked: boolean;
  threshold: number;
  level: number;
}

/**
 * Hook to manage the status of sacred geometry nodes
 * 
 * @param energyPoints The user's current energy points
 * @param nodes Array of geometry nodes
 * @returns Object with function to get node status
 */
const useNodeStatus = (energyPoints: number, nodes: any[]) => {
  const [nodeStatuses, setNodeStatuses] = useState<NodeStatus[]>([]);
  
  // Calculate unlocked status based on thresholds
  useEffect(() => {
    // Define energy thresholds for each node
    const thresholds = [
      0,      // Center node - always unlocked
      100,    // Meditation
      200,    // Chakras 
      300,    // Energy
      400,    // Wisdom
      500,    // Astral
      750,    // Healing
      1000,   // Dreams
      1250,   // Elements
      1500,   // Consciousness
      1750,   // Reflection
      2000,   // Guidance
      2500    // Manifestation
    ];
    
    // Calculate which nodes are unlocked based on user's energy points
    const newNodeStatuses = nodes.map((_, index) => {
      const nodeThreshold = thresholds[index < thresholds.length ? index : thresholds.length - 1];
      const unlocked = energyPoints >= nodeThreshold;
      
      // Calculate level (0-10) based on how far beyond threshold
      let level = 1;
      if (unlocked) {
        const nextThreshold = thresholds[index + 1] || thresholds[thresholds.length - 1] * 1.5;
        const range = nextThreshold - nodeThreshold;
        const progress = Math.min(energyPoints - nodeThreshold, range);
        level = Math.max(1, Math.floor((progress / range) * 10));
      }
      
      return {
        unlocked,
        threshold: nodeThreshold,
        level
      };
    });
    
    setNodeStatuses(newNodeStatuses);
  }, [energyPoints, nodes]);
  
  // Function to get the status for a specific node index
  const getNodeStatus = useCallback((index: number): NodeStatus => {
    if (index < 0 || index >= nodeStatuses.length) {
      return { unlocked: false, threshold: 1000, level: 0 };
    }
    return nodeStatuses[index];
  }, [nodeStatuses]);
  
  return { getNodeStatus };
};

export default useNodeStatus;
