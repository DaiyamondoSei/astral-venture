
import {
  validatePerformanceMetric,
  validateWebVital,
  isValidMetricType,
  isValidWebVitalName,
  isValidWebVitalCategory
} from '../utils/performance/validation';
import { ValidationError } from '../utils/validation/ValidationError';

describe('Performance Metrics Validation', () => {
  describe('isValidMetricType', () => {
    test('should return true for valid metric types', () => {
      expect(isValidMetricType('render')).toBe(true);
      expect(isValidMetricType('interaction')).toBe(true);
      expect(isValidMetricType('webVital')).toBe(true);
    });

    test('should return false for invalid metric types', () => {
      expect(isValidMetricType('invalid')).toBe(false);
      expect(isValidMetricType('')).toBe(false);
    });
  });

  describe('isValidWebVitalName', () => {
    test('should return true for valid web vital names', () => {
      expect(isValidWebVitalName('CLS')).toBe(true);
      expect(isValidWebVitalName('FCP')).toBe(true);
      expect(isValidWebVitalName('LCP')).toBe(true);
    });

    test('should return false for invalid web vital names', () => {
      expect(isValidWebVitalName('invalid')).toBe(false);
      expect(isValidWebVitalName('')).toBe(false);
    });
  });

  describe('isValidWebVitalCategory', () => {
    test('should return true for valid web vital categories', () => {
      expect(isValidWebVitalCategory('loading')).toBe(true);
      expect(isValidWebVitalCategory('interaction')).toBe(true);
      expect(isValidWebVitalCategory('visual_stability')).toBe(true);
    });

    test('should return false for invalid web vital categories', () => {
      expect(isValidWebVitalCategory('invalid')).toBe(false);
      expect(isValidWebVitalCategory('')).toBe(false);
    });
  });

  describe('validatePerformanceMetric', () => {
    test('should validate correct performance metrics', () => {
      const validMetric = {
        metric_name: 'test',
        value: 100,
        category: 'component',
        type: 'render',
        timestamp: Date.now()
      };

      expect(() => validatePerformanceMetric(validMetric)).not.toThrow();
      
      const validatedMetric = validatePerformanceMetric(validMetric);
      expect(validatedMetric.metric_name).toBe('test');
    });

    test('should throw for invalid performance metrics', () => {
      const invalidMetric = {
        // Missing metric_name
        value: 100,
        category: 'component',
        type: 'render'
      };

      expect(() => validatePerformanceMetric(invalidMetric)).toThrow(ValidationError);
    });
  });

  describe('validateWebVital', () => {
    test('should validate correct web vitals', () => {
      const validVital = {
        name: 'CLS',
        value: 0.1,
        category: 'visual_stability',
        timestamp: Date.now()
      };

      expect(() => validateWebVital(validVital)).not.toThrow();
      
      const validatedVital = validateWebVital(validVital);
      expect(validatedVital.name).toBe('CLS');
    });

    test('should throw for invalid web vitals', () => {
      const invalidVital = {
        name: 'CLS',
        // Missing value
        category: 'visual_stability',
        timestamp: Date.now()
      };

      expect(() => validateWebVital(invalidVital)).toThrow(ValidationError);
    });
  });
});
