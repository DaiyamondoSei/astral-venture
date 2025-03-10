
/**
 * Error Handling System
 * 
 * This module re-exports the error handling utilities for easier imports.
 */

export * from './types';
export * from './AppError';
export * from './handleError';
export * from './errorClassification';
export * from './errorDisplay';

// Convenience exports from external validation utilities
export { isValidationError } from '../validation/ValidationError';
