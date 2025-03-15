
/**
 * Performance Types and Constants Index
 * 
 * This file serves as the central export point for all performance-related
 * types and their corresponding runtime constants.
 */

// Export all types
export * from './constants';

// Export all runtime constants
export * from './runtime-constants';

// Export metrics and config
export * from './metrics';
export * from './config';

/**
 * Best Practices for Performance Types
 * 
 * 1. Type-Value Pattern Implementation:
 *    - Define types in 'constants.ts'
 *    - Define runtime constants in 'runtime-constants.ts'
 *    - Ensure each type has a corresponding runtime constant
 *    - Use 'as const' to ensure type safety
 * 
 * 2. Interface Synchronization:
 *    - Always update both the interface and implementation when adding new features
 *    - Use default values to maintain backwards compatibility
 *    - Add adapter patterns when existing interfaces need to evolve
 * 
 * 3. Consistent Naming:
 *    - Use PascalCase for type names and interfaces
 *    - Use UPPER_SNAKE_CASE for runtime constants
 *    - Use camelCase for function names and variables
 * 
 * 4. File Organization:
 *    - Group related types in logical files
 *    - Use index files to create a clean public API
 *    - Document the purpose of each file
 */
