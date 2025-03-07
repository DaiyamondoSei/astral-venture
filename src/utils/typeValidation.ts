
import type { AchievementData, FeatureTooltipData, GuidedTourData } from '@/components/onboarding/data/types';

/**
 * Type validation utility
 * 
 * This utility provides functions to validate data structures against TypeScript interfaces
 * at runtime, which can help catch type-related issues early.
 */

// Type guard for AchievementData
export function isAchievementData(obj: unknown): obj is AchievementData {
  if (!obj || typeof obj !== 'object') return false;
  
  const achievement = obj as Partial<AchievementData>;
  
  const requiredProps = ['id', 'title', 'description'];
  for (const prop of requiredProps) {
    if (!(prop in achievement) || typeof achievement[prop as keyof AchievementData] !== 'string') {
      console.warn(`Invalid AchievementData: missing required property "${prop}"`);
      return false;
    }
  }
  
  return true;
}

// Type guard for FeatureTooltipData
export function isFeatureTooltipData(obj: unknown): obj is FeatureTooltipData {
  if (!obj || typeof obj !== 'object') return false;
  
  const tooltip = obj as Partial<FeatureTooltipData>;
  
  const requiredProps = ['id', 'targetSelector', 'title', 'description', 'position', 'order'];
  for (const prop of requiredProps) {
    if (!(prop in tooltip)) {
      console.warn(`Invalid FeatureTooltipData: missing required property "${prop}"`);
      return false;
    }
  }
  
  // Validate position values
  const validPositions = ['top', 'bottom', 'left', 'right'];
  if (!validPositions.includes(tooltip.position as string)) {
    console.warn(`Invalid position value: ${tooltip.position}. Must be one of: ${validPositions.join(', ')}`);
    return false;
  }
  
  return true;
}

// Type guard for GuidedTourData
export function isGuidedTourData(obj: unknown): obj is GuidedTourData {
  if (!obj || typeof obj !== 'object') return false;
  
  const tour = obj as Partial<GuidedTourData>;
  
  const requiredProps = ['id', 'title', 'description', 'steps'];
  for (const prop of requiredProps) {
    if (!(prop in tour)) {
      console.warn(`Invalid GuidedTourData: missing required property "${prop}"`);
      return false;
    }
  }
  
  // Validate steps
  if (!Array.isArray(tour.steps)) {
    console.warn('Invalid GuidedTourData: steps must be an array');
    return false;
  }
  
  return true;
}

// Function to validate a collection of items against a type guard
export function validateCollection<T>(
  items: unknown[],
  typeGuard: (item: unknown) => item is T,
  collectionName: string
): T[] {
  const validItems: T[] = [];
  const invalidIndices: number[] = [];
  
  items.forEach((item, index) => {
    if (typeGuard(item)) {
      validItems.push(item);
    } else {
      invalidIndices.push(index);
    }
  });
  
  if (invalidIndices.length > 0) {
    console.warn(
      `Found ${invalidIndices.length} invalid items in ${collectionName} at indices: ${invalidIndices.join(', ')}`
    );
  }
  
  return validItems;
}

// Main validation function that can be called during development or at runtime
export function validateTypeConsistency(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    // Import data files dynamically
    const achievementsModule = require('@/components/onboarding/data/achievements');
    const tooltipsModule = require('@/components/onboarding/data/tooltips');
    const toursModule = require('@/components/onboarding/data/tours');
    
    // Validate achievements
    const achievements = achievementsModule.onboardingAchievements;
    if (achievements) {
      const validAchievements = validateCollection(
        achievements,
        isAchievementData,
        'onboardingAchievements'
      );
      
      if (validAchievements.length !== achievements.length) {
        errors.push(`Found ${achievements.length - validAchievements.length} invalid achievements`);
      }
    }
    
    // Validate tooltips
    const tooltips = tooltipsModule.featureTooltips;
    if (tooltips) {
      const validTooltips = validateCollection(
        tooltips,
        isFeatureTooltipData,
        'featureTooltips'
      );
      
      if (validTooltips.length !== tooltips.length) {
        errors.push(`Found ${tooltips.length - validTooltips.length} invalid tooltips`);
      }
    }
    
    // Validate tours
    const tours = toursModule.guidedTours;
    if (tours) {
      const validTours = validateCollection(
        tours,
        isGuidedTourData,
        'guidedTours'
      );
      
      if (validTours.length !== tours.length) {
        errors.push(`Found ${tours.length - validTours.length} invalid tours`);
      }
    }
    
  } catch (error) {
    errors.push(`Error during type validation: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Function to run the validation from the CLI or scripts
export function runTypeValidationCLI(): void {
  const result = validateTypeConsistency();
  
  if (result.valid) {
    console.log('✅ Type validation passed successfully');
  } else {
    console.error('❌ Type validation failed with the following errors:');
    result.errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1); // Exit with error code for CI pipelines
  }
}

// Add runtime type checking decorator
export function validateTypes<T>(typeGuard: (value: unknown) => value is T) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
      // Validate input arguments
      args.forEach((arg, index) => {
        if (!typeGuard(arg)) {
          console.warn(`Type validation failed for argument ${index} in ${propertyKey}`);
        }
      });
      
      // Call the original method
      const result = originalMethod.apply(this, args);
      
      // Validate return value if applicable
      if (result !== undefined && !typeGuard(result)) {
        console.warn(`Type validation failed for return value of ${propertyKey}`);
      }
      
      return result;
    };
    
    return descriptor;
  };
}
