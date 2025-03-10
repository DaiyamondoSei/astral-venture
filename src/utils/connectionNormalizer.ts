
import { 
  MetatronsConnection, 
  NormalizedConnection 
} from '@/components/visual-foundation/metatrons-cube/types';
import { validateDefined } from './typeValidation';
import { handleError, ErrorCategory } from './errorHandling';

/**
 * Normalize connections to use standard from/to properties
 * Handles backward compatibility with source/target properties
 * 
 * @param connections Array of connections to normalize
 * @returns Array of normalized connections
 */
export function normalizeConnections(
  connections: MetatronsConnection[] | undefined
): NormalizedConnection[] {
  if (!connections || !Array.isArray(connections)) {
    return [];
  }
  
  try {
    return connections.map((conn, index) => {
      try {
        validateDefined(conn, `connections[${index}]`);

        // Determine from/to values, preferring the new pattern
        const from = conn.from || conn.source || '';
        const to = conn.to || conn.target || '';
        
        // Validate that we have valid node references
        if (!from || !to) {
          throw new Error(`Connection at index ${index} is missing required from/to node references`);
        }
        
        // Return normalized connection with standard properties
        return {
          from,
          to,
          animated: conn.animated || false,
          active: conn.active || false,
          intensity: typeof conn.intensity === 'number' ? conn.intensity : 1
        };
      } catch (error) {
        handleError(error, {
          context: 'Connection Normalization',
          category: ErrorCategory.DATA_PROCESSING,
          showToast: false,
          metadata: { connectionIndex: index }
        });
        
        // Return a default connection in case of error
        return {
          from: 'error',
          to: 'error',
          animated: false,
          active: false,
          intensity: 0.5
        };
      }
    }).filter(conn => conn.from !== 'error' && conn.to !== 'error');
  } catch (error) {
    handleError(error, {
      context: 'Connections Processing',
      category: ErrorCategory.DATA_PROCESSING,
      showToast: false
    });
    return [];
  }
}

/**
 * Updates connections to use the new from/to pattern
 * Preserves source/target for backward compatibility
 * 
 * @param connections Array of connections to update
 * @returns Updated connections using the new pattern
 */
export function migrateConnectionsToNewPattern(
  connections: MetatronsConnection[] | undefined
): MetatronsConnection[] {
  if (!connections || !Array.isArray(connections)) {
    return [];
  }
  
  return connections.map(conn => {
    // Start with the original connection
    const result: MetatronsConnection = { ...conn };
    
    // If using old pattern, add new pattern properties
    if (conn.source && !conn.from) {
      result.from = conn.source;
    }
    
    if (conn.target && !conn.to) {
      result.to = conn.target;
    }
    
    // If using new pattern, ensure old pattern exists for compatibility
    if (conn.from && !conn.source) {
      result.source = conn.from;
    }
    
    if (conn.to && !conn.target) {
      result.target = conn.to;
    }
    
    return result;
  });
}

/**
 * Checks if any connections are using the deprecated source/target pattern
 * Useful for logging warnings or triggering migrations
 * 
 * @param connections Connections to check
 * @returns True if any connections use the deprecated pattern
 */
export function hasDeprecatedConnectionPatterns(
  connections: MetatronsConnection[] | undefined
): boolean {
  if (!connections || !Array.isArray(connections)) {
    return false;
  }
  
  return connections.some(conn => 
    (conn.source !== undefined && conn.from === undefined) || 
    (conn.target !== undefined && conn.to === undefined)
  );
}
