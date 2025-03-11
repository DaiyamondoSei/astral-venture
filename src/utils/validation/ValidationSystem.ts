
import { ValidationResult } from '../performance/core/systemTypes';

export class ValidationSystem {
  private static instance: ValidationSystem;

  private constructor() {}

  static getInstance(): ValidationSystem {
    if (!ValidationSystem.instance) {
      ValidationSystem.instance = new ValidationSystem();
    }
    return ValidationSystem.instance;
  }

  validatePerformanceMetrics(metrics: Record<string, number>): ValidationResult {
    const errors = [];
    
    if (metrics.fps && (metrics.fps < 0 || metrics.fps > 144)) {
      errors.push({
        path: 'fps',
        message: 'FPS must be between 0 and 144',
        code: 'INVALID_FPS'
      });
    }

    if (metrics.memoryUsage && metrics.memoryUsage < 0) {
      errors.push({
        path: 'memoryUsage',
        message: 'Memory usage cannot be negative',
        code: 'INVALID_MEMORY'
      });
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      value: metrics
    };
  }

  validateDeviceCapability(capability: string): ValidationResult<DeviceCapability> {
    const validCapabilities = ['low', 'medium', 'high'];
    
    if (!validCapabilities.includes(capability)) {
      return {
        valid: false,
        errors: [{
          path: 'deviceCapability',
          message: `Device capability must be one of: ${validCapabilities.join(', ')}`,
          code: 'INVALID_CAPABILITY'
        }]
      };
    }

    return {
      valid: true,
      value: capability as DeviceCapability
    };
  }
}

export const validationSystem = ValidationSystem.getInstance();
