
#!/usr/bin/env node
/**
 * Pre-commit hook script
 * 
 * This script runs before git commits to validate code quality
 * and prevent issues from being committed
 */

import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { validateTypeConsistency } from './validateTypes';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

console.log(`${colors.cyan}Running pre-commit validation checks...${colors.reset}`);

// Check for TypeScript type errors
function checkTypeErrors() {
  console.log(`\n${colors.blue}Checking for TypeScript errors...${colors.reset}`);
  
  const tscResult = spawnSync('npx', ['tsc', '--noEmit'], { 
    stdio: 'pipe',
    encoding: 'utf-8'
  });
  
  if (tscResult.status !== 0) {
    console.error(`${colors.red}TypeScript compilation failed:${colors.reset}`);
    console.error(tscResult.stderr || tscResult.stdout);
    return false;
  }
  
  console.log(`${colors.green}TypeScript check passed!${colors.reset}`);
  return true;
}

// Run ESLint
function runEslint() {
  console.log(`\n${colors.blue}Running ESLint...${colors.reset}`);
  
  const eslintResult = spawnSync('npx', ['eslint', '.', '--ext', '.ts,.tsx'], {
    stdio: 'pipe',
    encoding: 'utf-8'
  });
  
  if (eslintResult.status !== 0) {
    console.error(`${colors.red}ESLint check failed:${colors.reset}`);
    console.error(eslintResult.stderr || eslintResult.stdout);
    return false;
  }
  
  console.log(`${colors.green}ESLint check passed!${colors.reset}`);
  return true;
}

// Run advanced type validation
function runAdvancedTypeValidation() {
  console.log(`\n${colors.blue}Running advanced type validation...${colors.reset}`);
  
  const result = validateTypeConsistency();
  
  if (!result.valid) {
    console.error(`${colors.red}Type validation failed:${colors.reset}`);
    result.errors.forEach(error => console.error(`  - ${error}`));
    return false;
  }
  
  console.log(`${colors.green}Advanced type validation passed!${colors.reset}`);
  return true;
}

// Check for unused exports
function checkUnusedExports() {
  console.log(`\n${colors.blue}Checking for unused exports...${colors.reset}`);
  
  const unusedExportsResult = spawnSync('npx', ['ts-unused-exports', 'tsconfig.json'], {
    stdio: 'pipe',
    encoding: 'utf-8'
  });
  
  // ts-unused-exports returns non-zero if it finds unused exports
  if (unusedExportsResult.status !== 0 && !unusedExportsResult.stderr) {
    console.warn(`${colors.yellow}Found potentially unused exports:${colors.reset}`);
    console.warn(unusedExportsResult.stdout);
    // Don't fail the commit for unused exports, just warn
  } else if (unusedExportsResult.stderr) {
    console.error(`${colors.red}Error checking unused exports:${colors.reset}`);
    console.error(unusedExportsResult.stderr);
  } else {
    console.log(`${colors.green}No unused exports found!${colors.reset}`);
  }
  
  return true;
}

// Get staged TypeScript files
function getStagedTsFiles() {
  const result = spawnSync('git', ['diff', '--staged', '--name-only', '--diff-filter=ACMR'], {
    stdio: 'pipe',
    encoding: 'utf-8'
  });
  
  if (result.status !== 0) {
    console.error(`${colors.red}Failed to get staged files${colors.reset}`);
    return [];
  }
  
  return result.stdout
    .split('\n')
    .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'));
}

// Run all checks
const typesOk = checkTypeErrors();
const eslintOk = runEslint();
const advancedTypesOk = runAdvancedTypeValidation();
const unusedExportsOk = checkUnusedExports();

// Overall result
const allChecksOk = typesOk && eslintOk && advancedTypesOk && unusedExportsOk;

if (allChecksOk) {
  console.log(`\n${colors.green}All pre-commit checks passed successfully!${colors.reset}`);
  process.exit(0);
} else {
  console.error(`\n${colors.red}Pre-commit checks failed. Please fix the issues before committing.${colors.reset}`);
  console.log(`${colors.yellow}Tip: You can bypass these checks with git commit --no-verify, but this is not recommended.${colors.reset}`);
  process.exit(1);
}
