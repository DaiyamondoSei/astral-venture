/**
 * Runtime type validation utilities to ensure data consistency
 */

import { handleError } from '../errorHandling';
import { isMetatronsNode, isMetatronsConnection } from '../typeGuards';
import type { MetatronsNode, MetatronsConnection } from '@/components/visual-foundation/metatrons-cube/types';

/**
 * Validates an array of MetatronsNodes
 * @param nodes Array to validate
 * @param context Context for error reporting
 * @returns True if valid, false otherwise
 */
export function validateMetatronsNodes(
  nodes: unknown[], 
  context = 'MetatronsNodes Validation'
): nodes is MetatronsNode[] {
  try {
    if (!Array.isArray(nodes)) {
      handleError(`Expected nodes to be an array, got ${typeof nodes}`, { context, showToast: false });
      return false;
    }
    
    // Check each node
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!isMetatronsNode(node)) {
        handleError(`Invalid node at index ${i}`, {
          context,
          showToast: false,
          includeStack: false
        });
        return false;
      }
    }
    
    return true;
  } catch (error) {
    handleError(error, { context, showToast: false });
    return false;
  }
}

/**
 * Validates an array of MetatronsConnections
 * @param connections Array to validate
 * @param context Context for error reporting
 * @returns True if valid, false otherwise
 */
export function validateMetatronsConnections(
  connections: unknown[],
  context = 'MetatronsConnections Validation'
): connections is MetatronsConnection[] {
  try {
    if (!Array.isArray(connections)) {
      handleError(`Expected connections to be an array, got ${typeof connections}`, { context, showToast: false });
      return false;
    }
    
    // Check each connection
    for (let i = 0; i < connections.length; i++) {
      const connection = connections[i];
      if (!isMetatronsConnection(connection)) {
        handleError(`Invalid connection at index ${i}`, {
          context,
          showToast: false,
          includeStack: false
        });
        return false;
      }
      
      // If using deprecated fields, log warning
      const conn = connection as MetatronsConnection;
      if ((conn.source || conn.target) && !(conn.from && conn.to)) {
        console.warn(
          `[DEPRECATED] Connection at index ${i} is using deprecated 'source/target' fields. ` +
          `Please use 'from/to' fields instead.`
        );
      }
    }
    
    return true;
  } catch (error) {
    handleError(error, { context, showToast: false });
    return false;
  }
}

/**
 * Normalizes MetatronsConnection objects to use the new from/to fields
 * @param connections Array of connections to normalize
 * @returns Normalized connections
 */
export function normalizeMetatronsConnections(
  connections: MetatronsConnection[]
): MetatronsConnection[] {
  return connections.map(conn => {
    const result: MetatronsConnection = {
      from: conn.from || conn.source || '',
      to: conn.to || conn.target || '',
    };
    
    // Copy other properties
    if (conn.animated !== undefined) result.animated = conn.animated;
    if (conn.active !== undefined) result.active = conn.active;
    if (conn.intensity !== undefined) result.intensity = conn.intensity;
    
    // Keep source/target for backward compatibility
    if (conn.source) result.source = conn.source;
    if (conn.target) result.target = conn.target;
    
    return result;
  });
}
