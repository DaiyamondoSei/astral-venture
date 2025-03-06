
import { useState, useEffect } from 'react';
import { GeometryNode, NodeStatus } from '../types/geometry';

export const useNodeStatus = (energyPoints: number, geometryNodes: GeometryNode[]) => {
  // Determine which nodes should be active based on energy points
  const getNodeStatus = (nodeIndex: number): NodeStatus => {
    // Use energy points to determine which nodes are unlocked
    const pointThresholds = [0, 50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
    return {
      unlocked: energyPoints >= pointThresholds[Math.min(nodeIndex, pointThresholds.length - 1)],
      threshold: pointThresholds[Math.min(nodeIndex, pointThresholds.length - 1)]
    };
  };
  
  return { getNodeStatus };
};

export default useNodeStatus;
