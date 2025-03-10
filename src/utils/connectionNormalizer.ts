import { MetatronsConnection } from '@/components/visual-foundation/metatrons-cube/types';

/**
 * Normalizes a connection object to ensure it uses standardized field names
 * 
 * This utility helps with the transition from the legacy source/target pattern
 * to the standardized from/to pattern for connections.
 * 
 * @param connection - The connection to normalize
 * @returns A normalized connection with both old and new field patterns
 */
export function normalizeConnection(connection: Partial<MetatronsConnection>): MetatronsConnection {
  const source = connection.source || connection.from;
  const target = connection.target || connection.to;
  
  if (!source || !target) {
    throw new Error('Connection must have either source/target or from/to properties');
  }
  
  return {
    // Set standardized properties
    from: source,
    to: target,
    
    // Keep original properties for backward compatibility
    source,
    target,
    
    // Copy other properties
    animated: connection.animated || false,
    active: connection.active || false,
    intensity: connection.intensity || 0.5
  };
}

/**
 * Normalizes an array of connections to ensure they all use standardized field names
 * 
 * @param connections - Array of connections to normalize
 * @returns Array of normalized connections
 */
export function normalizeConnections(
  connections: Array<Partial<MetatronsConnection>>
): MetatronsConnection[] {
  return connections.map(normalizeConnection);
}

/**
 * Checks if a connection uses the legacy source/target pattern but not the new from/to pattern
 * 
 * @param connection - The connection to check
 * @returns True if the connection uses only legacy field names
 */
export function isLegacyConnection(connection: Partial<MetatronsConnection>): boolean {
  return (
    (connection.source !== undefined || connection.target !== undefined) &&
    (connection.from === undefined && connection.to === undefined)
  );
}

/**
 * Migrates legacy connections to the new format while maintaining backward compatibility
 * 
 * @param connections - Array of connections to migrate
 * @returns Array of connections with both old and new field patterns
 */
export function migrateConnections(
  connections: Array<Partial<MetatronsConnection>>
): MetatronsConnection[] {
  return connections.map(normalizeConnection);
}

export default {
  normalizeConnection,
  normalizeConnections,
  isLegacyConnection,
  migrateConnections
};
