
/**
 * Pre-commit hook script
 * Validates TypeScript types before allowing commit
 */

import { validateTypeConsistency } from '../utils/typeValidation';

async function main(): Promise<void> {
  console.log('Running pre-commit type validation...');
  
  const result = await validateTypeConsistency({
    // Only check files that are staged for commit
    includeDirs: ['staged-files-only'],
    includeTests: false
  });
  
  if (!result.success) {
    console.error('Type validation failed! Please fix the following errors before committing:');
    result.errors.forEach(error => {
      console.error(`${error.filePath}:${error.line}:${error.column} - ${error.message}`);
    });
    process.exit(1);
  }
  
  if (result.warnings.length > 0) {
    console.warn('Type validation succeeded with warnings:');
    result.warnings.forEach(warning => {
      console.warn(`${warning.filePath}:${warning.line}:${warning.column} - ${warning.message}`);
    });
  }
  
  console.log('Type validation passed!');
  process.exit(0);
}

main().catch(error => {
  console.error('Unexpected error in pre-commit hook:', error);
  process.exit(1);
});
