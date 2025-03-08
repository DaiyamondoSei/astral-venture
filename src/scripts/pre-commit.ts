
#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

// Get staged files
const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACM')
  .toString()
  .trim()
  .split('\n')
  .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'));

if (stagedFiles.length === 0) {
  console.log('No TypeScript files to analyze.');
  process.exit(0);
}

// Run code quality checks
try {
  console.log('Running code quality checks on staged files...');
  
  // Check for component complexity
  const complexityIssues = [];
  
  for (const file of stagedFiles) {
    if (!fs.existsSync(file)) continue;
    
    const content = fs.readFileSync(file, 'utf-8');
    
    // Simple heuristic for complexity: check function/component size
    const lines = content.split('\n').length;
    if (lines > 200) {
      complexityIssues.push(`${file}: Component has ${lines} lines and may be too complex.`);
    }
    
    // Check for too many hooks
    const hookMatches = content.match(/use[A-Z][a-zA-Z]+/g) || [];
    if (hookMatches.length > 7) {
      complexityIssues.push(`${file}: Component uses ${hookMatches.length} hooks and may benefit from refactoring.`);
    }
  }
  
  if (complexityIssues.length > 0) {
    console.warn('\nCode Quality Issues Found:');
    complexityIssues.forEach(issue => console.warn(`- ${issue}`));
    console.warn('\nConsider addressing these issues before committing.');
  } else {
    console.log('No significant code quality issues found.');
  }
  
  process.exit(0);
} catch (error) {
  console.error('Error running code quality checks:', error);
  process.exit(1);
}
