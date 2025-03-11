
/**
 * Core validation types and interfaces
 */
export type ValidationResult = {
  valid: boolean;
  errors?: ValidationError[];
};

export type ValidationError = {
  code: string;
  message: string;
  path?: string;
  details?: Record<string, unknown>;
};

export type ValidatorFn<T> = (value: unknown) => ValidationResult;

export interface ValidationSchema<T> {
  validate: ValidatorFn<T>;
  validateAsync?: (value: unknown) => Promise<ValidationResult>;
}

export type ValidationOptions = {
  stopOnFirst?: boolean;
  context?: Record<string, unknown>;
};
