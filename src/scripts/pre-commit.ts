
#!/usr/bin/env node

/**
 * Pre-commit hook script
 * 
 * This script runs automatically before git commits via husky
 * to ensure code quality and prevent common errors
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const TYPESCRIPT_CHECK = true;
const LINT_CHECK = true;
const COMPONENT_VALIDATION_CHECK = true;
const UNUSED_EXPORTS_CHECK = false; // Optional, can be resource-intensive

console.log('🔍 Running pre-commit checks...');

let hasErrors = false;

// Helper for running commands and handling errors
function runCheck(name: string, command: string): boolean {
  try {
    console.log(`\n📋 Running ${name}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${name} passed!`);
    return true;
  } catch (error) {
    console.error(`❌ ${name} failed!`);
    hasErrors = true;
    return false;
  }
}

// TypeScript type checking
if (TYPESCRIPT_CHECK) {
  runCheck('TypeScript type check', 'tsc --noEmit');
}

// ESLint checking
if (LINT_CHECK) {
  runCheck('ESLint check', 'eslint "src/**/*.{ts,tsx}" --max-warnings=0');
}

// Component validation check
if (COMPONENT_VALIDATION_CHECK) {
  // This is a custom validation that ensures all components follow our documentation standards
  const componentFiles = execSync('find src/components -name "*.tsx" | grep -v "__tests__"')
    .toString()
    .split('\n')
    .filter(Boolean);
    
  let undocumentedComponents = 0;
  
  componentFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    // Check for documented export
    if (!content.includes('documented(') && content.includes('export default')) {
      console.warn(`⚠️ Component in ${filePath} is not documented`);
      undocumentedComponents++;
    }
  });
  
  if (undocumentedComponents > 0) {
    console.warn(`⚠️ Found ${undocumentedComponents} undocumented components`);
    // We don't fail the commit for this, but we warn about it
  }
}

// Unused exports check (optional)
if (UNUSED_EXPORTS_CHECK) {
  runCheck('Unused exports check', 'ts-unused-exports tsconfig.json');
}

// Exit with error code if any checks failed
if (hasErrors) {
  console.error('\n❌ Pre-commit checks failed. Please fix the errors before committing.');
  process.exit(1);
} else {
  console.log('\n✅ All pre-commit checks passed!');
}
