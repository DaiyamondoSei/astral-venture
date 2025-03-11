
/**
 * Foundation Tests
 * 
 * Tests for Phase 1 foundation components
 */
import { calculateRecommendedQualityLevel, getQualityLevel } from '../utils/performance/core/utils';
import { DeviceCapability } from '../utils/performance/core/types';
import { generatePolygonPoints, generateMetatronsCube } from '../utils/geometry/geometryUtils';
import { validatePerfConfig, validateDeviceCapability, validateSamplingRate } from '../utils/validation/schemas/performanceSchemas';

describe('Phase 1 Foundation Tests', () => {
  describe('Performance Configuration', () => {
    test('getQualityLevel should return appropriate level', () => {
      const level1 = getQualityLevel(1);
      expect(level1.name).toBe('Low');
      
      const level5 = getQualityLevel(5);
      expect(level5.name).toBe('Extreme');
      
      // Test bounds enforcement
      const levelTooHigh = getQualityLevel(10);
      expect(levelTooHigh.name).toBe('Extreme');
      
      const levelTooLow = getQualityLevel(0);
      expect(levelTooLow.name).toBe('Low');
    });
    
    test('calculateRecommendedQualityLevel should adjust based on capability', () => {
      expect(calculateRecommendedQualityLevel('low')).toBe(1);
      expect(calculateRecommendedQualityLevel('medium')).toBe(2);
      expect(calculateRecommendedQualityLevel('high')).toBe(4);
      
      // Should lower level when FPS is low
      expect(calculateRecommendedQualityLevel('high', 20)).toBeLessThan(4);
      
      // Should lower level when memory usage is high
      expect(calculateRecommendedQualityLevel('high', undefined, 600 * 1024 * 1024)).toBe(1);
    });
  });
  
  describe('Geometry Utilities', () => {
    test('generatePolygonPoints should create correct number of points', () => {
      const hexagonPoints = generatePolygonPoints(6, 100, 0, 0, 0);
      expect(hexagonPoints.length).toBe(6);
      
      const squarePoints = generatePolygonPoints(4, 100, 0, 0, 0);
      expect(squarePoints.length).toBe(4);
    });
    
    test('generateMetatronsCube should respect detail level', () => {
      const lowDetail = generateMetatronsCube(100, 1, 0, 0);
      const highDetail = generateMetatronsCube(100, 5, 0, 0);
      
      expect(highDetail.nodes.length).toBeGreaterThan(lowDetail.nodes.length);
      expect(highDetail.connections.length).toBeGreaterThan(lowDetail.connections.length);
    });
  });
  
  describe('Validation Utilities', () => {
    test('validateDeviceCapability should detect invalid values', () => {
      const valid = validateDeviceCapability('high');
      expect(valid.valid).toBe(true);
      
      const invalid = validateDeviceCapability('ultra' as DeviceCapability);
      expect(invalid.valid).toBe(false);
      expect(invalid.errors?.length).toBe(1);
    });
    
    test('validateSamplingRate should validate numeric ranges', () => {
      const valid = validateSamplingRate(0.5);
      expect(valid.valid).toBe(true);
      
      const tooHigh = validateSamplingRate(1.5);
      expect(tooHigh.valid).toBe(false);
      expect(tooHigh.errors?.length).toBe(1);
      
      const tooLow = validateSamplingRate(-0.1);
      expect(tooLow.valid).toBe(false);
      expect(tooLow.errors?.length).toBe(1);
    });
    
    test('validatePerfConfig should detect invalid values', () => {
      const validConfig = {
        deviceCapability: 'high' as DeviceCapability,
        samplingRate: 0.5,
        adaptiveQualityLevels: 3
      };
      
      const validResult = validatePerfConfig(validConfig);
      expect(validResult.valid).toBe(true);
      
      const invalidConfig = {
        deviceCapability: 'ultra' as DeviceCapability, // Invalid value
        samplingRate: 2, // Out of range
        adaptiveQualityLevels: 6 // Out of range
      };
      
      const invalidResult = validatePerfConfig(invalidConfig);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors?.length).toBe(3);
    });
  });
});
