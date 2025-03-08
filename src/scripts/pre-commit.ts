
#!/usr/bin/env ts-node
/**
 * Pre-commit hook for code quality analysis
 * 
 * This script analyzes staged files and provides suggestions
 * for improvements before committing.
 */

import { componentAnalyzer } from '../utils/performance/ComponentAnalyzer';
import fs from 'fs';
import path from 'path';

// Log start of pre-commit analysis
console.log('🔍 Running code quality analysis...');

// Get components with issues
const componentsWithIssues = componentAnalyzer.findComponentsWithIssues();

if (componentsWithIssues.length > 0) {
  console.log('\n⚠️ Found potential issues in the following components:');
  
  componentsWithIssues.forEach(analysis => {
    console.log(`\n📋 ${analysis.component.name}:`);
    
    analysis.issues.forEach(issue => {
      const severityIcon = issue.severity === 'high' ? '🔴' : 
                           issue.severity === 'medium' ? '🟠' : '🟡';
      
      console.log(`  ${severityIcon} ${issue.type}: ${issue.description}`);
      console.log(`     Suggestion: ${issue.suggestion}`);
    });
  });
  
  // Generate refactoring suggestions
  const refactoringSuggestions = componentAnalyzer.generateRefactoringSuggestions();
  
  if (refactoringSuggestions.length > 0) {
    console.log('\n💡 Refactoring opportunities:');
    
    refactoringSuggestions.forEach(suggestion => {
      const priorityIcon = suggestion.priority === 'high' ? '🔴' : 
                           suggestion.priority === 'medium' ? '🟠' : '🟡';
      
      console.log(`\n  ${priorityIcon} ${suggestion.type}: ${suggestion.description}`);
      console.log(`     Affected components: ${suggestion.components.join(', ')}`);
    });
  }
  
  console.log('\n✅ Analysis complete. Address issues or use --no-verify to bypass.');
} else {
  console.log('✅ No code quality issues detected!');
}

// Exit with success code - we don't want to block commits yet
process.exit(0);
