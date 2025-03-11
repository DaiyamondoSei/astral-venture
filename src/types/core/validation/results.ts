
/**
 * Validation result types and utilities
 */

import type { ValidationErrorDetail } from './errors';
import type { Timestamp } from '../base/primitives';

export interface ValidationResult<T> {
  readonly valid: boolean;
  readonly data?: T;
  readonly errors?: ValidationErrorDetail[];
  readonly metadata: ValidationMetadata;
}

export interface ValidationMetadata {
  readonly timestamp: Timestamp;
  readonly duration: number;
  readonly validatorVersion: string;
}

export interface ValidationContext {
  readonly path?: string;
  readonly parent?: unknown;
  readonly root?: unknown;
}
