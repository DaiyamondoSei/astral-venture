
/**
 * Type System Entry Point
 * 
 * This is the central entry point for all types used in the application.
 * It re-exports types from domain-specific modules to provide a single,
 * unified interface for accessing types.
 * 
 * @category Types
 * @version 1.0.0
 */

// Core foundation types
export * from './core';

// Export versions for type compatibility checking
export const TYPE_SYSTEM_VERSION = '1.0.0';
