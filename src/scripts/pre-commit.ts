
#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Get staged files
const stagedFiles = execSync('git diff --cached --name-only')
  .toString()
  .split('\n')
  .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'));

// Skip if no relevant files are staged
if (stagedFiles.length === 0) {
  console.log('No TypeScript files to validate');
  process.exit(0);
}

let hasErrors = false;

// Check each file for error handling
stagedFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  const content = fs.readFileSync(file, 'utf8');
  
  // Check if file contains try/catch but no error handling utility
  if (
    content.includes('try {') && 
    content.includes('catch') && 
    !content.includes('handleError(') &&
    !content.includes('createSafeAsyncFunction')
  ) {
    console.error(`⚠️ ${file}: Contains try/catch but doesn't use error handling utilities`);
    hasErrors = true;
  }
  
  // Check for direct console.error without proper error handling
  if (
    content.includes('console.error(') && 
    !content.includes('handleError(')
  ) {
    console.warn(`⚠️ ${file}: Uses console.error directly instead of error handling utilities`);
  }
});

// Exit with error if issues were found
if (hasErrors) {
  console.error('\n❌ Error handling validation failed. Please use error handling utilities.');
  process.exit(1);
}

console.log('✅ Error handling validation passed');
