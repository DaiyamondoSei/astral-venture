
/**
 * Validation System
 * 
 * Central exports for the validation system
 */

// Export core types and constants from the types directory
// These types are our source of truth following the Type-Value Pattern
export * from '@/types/core/validation/types';
export * from '@/types/core/validation/constants';

// Export ValidationError and related utilities
export { 
  ValidationError, 
  isValidationError,
  createRequiredError,
  createTypeError
} from './ValidationError';

// Export core validators and validation utilities
export * from './validationUtils';
export * from './validators';

// Export validation services and pipelines
export * from './ValidationService';
export * from './ValidationPipeline';

// Export schema validation utilities
export * from './schemaValidator';
export * from './inputValidator';

// Export runtime validation utilities
export * from './runtimeValidator';
export * from './runtimeValidation';
export * from './typeValidation';

// Export type-safe validation
export * from './core';

// Export performance validation
export * from './performanceValidator';

// Export type validation bridge
export * from './typeValidationBridge';
