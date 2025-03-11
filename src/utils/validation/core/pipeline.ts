
/**
 * Validation pipeline implementation
 */
import { 
  ValidationResult,
  Validator,
  ValidationContext,
  ValidationMetadata
} from '../types';

interface ValidationPipelineOptions<T> {
  preValidators?: Validator[];
  validator: Validator<T>;
  postValidators?: Validator[];
  context?: ValidationContext;
}

/**
 * Creates a validation pipeline that runs pre-validation,
 * main validation, and post-validation steps
 */
export class ValidationPipeline<T> {
  private startTime: number = 0;
  
  constructor(private options: ValidationPipelineOptions<T>) {}

  /**
   * Run the complete validation pipeline
   */
  async validate(value: unknown): Promise<ValidationResult<T>> {
    this.startTime = performance.now();
    
    // Pre-validation
    if (this.options.preValidators) {
      for (const validator of this.options.preValidators) {
        const result = await validator(value, this.options.context);
        if (!result.valid) {
          return this.addMetadata(result);
        }
        value = result.validatedData;
      }
    }
    
    // Main validation
    const mainResult = await this.options.validator(
      value,
      this.options.context
    );
    
    if (!mainResult.valid) {
      return this.addMetadata(mainResult);
    }
    
    value = mainResult.validatedData;
    
    // Post-validation
    if (this.options.postValidators) {
      for (const validator of this.options.postValidators) {
        const result = await validator(value, this.options.context);
        if (!result.valid) {
          return this.addMetadata(result);
        }
        value = result.validatedData;
      }
    }
    
    return this.addMetadata({
      valid: true,
      validatedData: value as T
    });
  }
  
  /**
   * Add metadata to validation result
   */
  private addMetadata<R>(result: ValidationResult<R>): ValidationResult<R> {
    const metadata: ValidationMetadata = {
      executionTimeMs: performance.now() - this.startTime,
      rulesExecuted: this.countRules(),
    };
    
    return {
      ...result,
      metadata
    };
  }
  
  /**
   * Count total validation rules in the pipeline
   */
  private countRules(): number {
    return (
      (this.options.preValidators?.length || 0) +
      1 + // Main validator
      (this.options.postValidators?.length || 0)
    );
  }
}
