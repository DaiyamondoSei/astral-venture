
#!/usr/bin/env node
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const TYPESCRIPT_FILES_PATTERN = 'src/**/*.{ts,tsx}';
const IGNORE_PATTERNS = ['**/node_modules/**', '**/dist/**', '**/build/**'];

// Colors for console output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

console.log(`${COLORS.blue}${COLORS.bold}Running pre-commit type validation...${COLORS.reset}`);

try {
  // Run TypeScript compiler in noEmit mode to check for type errors
  console.log(`${COLORS.blue}Checking for TypeScript errors...${COLORS.reset}`);
  execSync(`npx tsc --noEmit`, { stdio: 'inherit' });
  
  // Run ESLint to check for linting errors
  console.log(`${COLORS.blue}Checking for ESLint errors...${COLORS.reset}`);
  execSync(`npx eslint ${TYPESCRIPT_FILES_PATTERN} --max-warnings=0`, { 
    stdio: 'inherit' 
  });
  
  // Run unused exports check
  console.log(`${COLORS.blue}Checking for unused exports...${COLORS.reset}`);
  execSync(`npx ts-unused-exports tsconfig.json`, { stdio: 'inherit' });
  
  console.log(`${COLORS.green}${COLORS.bold}All checks passed! Commit proceeding.${COLORS.reset}`);
  process.exit(0);
} catch (error) {
  console.error(`${COLORS.red}${COLORS.bold}Pre-commit checks failed!${COLORS.reset}`);
  console.error(`${COLORS.yellow}Please fix the issues before committing.${COLORS.reset}`);
  process.exit(1);
}
