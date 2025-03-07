
/**
 * Type validation script
 * Run this script to perform advanced type checking
 */

import { validateTypeConsistency, runTypeValidationCLI } from '../utils/typeValidation';

// This will be the entry point when called from npm scripts or CI
if (require.main === module) {
  runTypeValidationCLI();
}

// Export for programmatic usage
export { validateTypeConsistency };
