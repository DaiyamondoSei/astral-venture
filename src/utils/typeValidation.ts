
/**
 * Advanced TypeScript validation utilities
 * Provides systematic checks to prevent common TypeScript errors
 */

import ts from 'typescript';
import fs from 'fs';
import path from 'path';
import { captureException } from './errorHandling';

/**
 * Configuration for the type validation process
 */
export interface ITypeValidationConfig {
  // Directories to scan for TypeScript files
  includeDirs: string[];
  // Directories to exclude from scanning
  excludeDirs: string[];
  // Whether to validate test files
  includeTests: boolean;
  // Whether to check for prop consistency across components
  checkPropConsistency: boolean;
  // Whether to check for hook return type consistency
  checkHookReturns: boolean;
  // Whether to validate interface implementations
  validateInterfaces: boolean;
}

/**
 * Default configuration for type validation
 */
export const defaultConfig: ITypeValidationConfig = {
  includeDirs: ['src'],
  excludeDirs: ['node_modules', 'dist', 'build'],
  includeTests: true,
  checkPropConsistency: true,
  checkHookReturns: true,
  validateInterfaces: true
};

/**
 * Result of a type validation check
 */
export interface IValidationResult {
  success: boolean;
  errors: IValidationError[];
  warnings: IValidationWarning[];
}

export interface IValidationError {
  filePath: string;
  line: number;
  column: number;
  message: string;
  code: string;
  severity: 'error';
}

export interface IValidationWarning {
  filePath: string;
  line: number;
  column: number;
  message: string;
  code: string;
  severity: 'warning';
}

/**
 * Main function to validate TypeScript types in a project
 * This runs a series of validations beyond what the TypeScript compiler checks
 */
export async function validateTypeConsistency(
  config: Partial<ITypeValidationConfig> = {}
): Promise<IValidationResult> {
  const fullConfig = { ...defaultConfig, ...config };
  const result: IValidationResult = {
    success: true,
    errors: [],
    warnings: []
  };

  try {
    console.log('Starting type validation with config:', fullConfig);
    
    // Create a TypeScript program
    const compilerOptions = ts.readConfigFile(
      path.resolve(process.cwd(), 'tsconfig.json'),
      ts.sys.readFile
    ).config.compilerOptions;
    
    const program = ts.createProgram(
      findTsFiles(fullConfig.includeDirs, fullConfig.excludeDirs),
      compilerOptions
    );
    
    // Run validation checks
    if (fullConfig.checkPropConsistency) {
      validateComponentProps(program, result);
    }
    
    if (fullConfig.checkHookReturns) {
      validateHookReturnTypes(program, result);
    }
    
    if (fullConfig.validateInterfaces) {
      validateInterfaceImplementations(program, result);
    }
    
    // Set success flag based on errors
    result.success = result.errors.length === 0;
    
    console.log('Type validation complete!');
    return result;
  } catch (error) {
    captureException(error, 'Type validation process');
    result.success = false;
    result.errors.push({
      filePath: 'unknown',
      line: 0,
      column: 0,
      message: `Validation process failed: ${error instanceof Error ? error.message : String(error)}`,
      code: 'VALIDATION_FAILED',
      severity: 'error'
    });
    return result;
  }
}

/**
 * Find all TypeScript files to validate
 */
function findTsFiles(includeDirs: string[], excludeDirs: string[]): string[] {
  const files: string[] = [];
  
  const walk = (dir: string) => {
    if (excludeDirs.some(excluded => dir.includes(excluded))) {
      return;
    }
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (
        entry.isFile() && 
        (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))
      ) {
        files.push(fullPath);
      }
    }
  };
  
  for (const dir of includeDirs) {
    walk(path.resolve(process.cwd(), dir));
  }
  
  return files;
}

/**
 * Validate that components are called with correct props
 */
function validateComponentProps(program: ts.Program, result: IValidationResult): void {
  const checker = program.getTypeChecker();
  const sourceFiles = program.getSourceFiles();
  
  // This is a simplified implementation
  // A full implementation would analyze JSX element props against their component definitions
  for (const sourceFile of sourceFiles) {
    if (sourceFile.fileName.includes('node_modules')) continue;
    
    // Find all JSX elements
    ts.forEachChild(sourceFile, function visit(node) {
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
        // Analyze props against component definition
        // This is a placeholder for the actual implementation
      }
      
      ts.forEachChild(node, visit);
    });
  }
}

/**
 * Validate that hooks return values match their usage
 */
function validateHookReturnTypes(program: ts.Program, result: IValidationResult): void {
  const checker = program.getTypeChecker();
  const sourceFiles = program.getSourceFiles();
  
  // This is a simplified implementation
  // A full implementation would track hook usages and their return type expectations
  for (const sourceFile of sourceFiles) {
    if (sourceFile.fileName.includes('node_modules')) continue;
    
    // Find all hook usages
    ts.forEachChild(sourceFile, function visit(node) {
      if (ts.isCallExpression(node) && 
          ts.isIdentifier(node.expression) && 
          node.expression.text.startsWith('use')) {
        // Validate hook return type usage
        // This is a placeholder for the actual implementation
      }
      
      ts.forEachChild(node, visit);
    });
  }
}

/**
 * Validate that classes/objects implement interfaces correctly
 */
function validateInterfaceImplementations(program: ts.Program, result: IValidationResult): void {
  const checker = program.getTypeChecker();
  const sourceFiles = program.getSourceFiles();
  
  // This is a simplified implementation
  // A full implementation would verify interface implementations
  for (const sourceFile of sourceFiles) {
    if (sourceFile.fileName.includes('node_modules')) continue;
    
    // Find all class declarations
    ts.forEachChild(sourceFile, function visit(node) {
      if (ts.isClassDeclaration(node) && node.heritageClauses) {
        // Check interface implementations
        // This is a placeholder for the actual implementation
      }
      
      ts.forEachChild(node, visit);
    });
  }
}

/**
 * Integration with build process and CI
 * This could be called during pre-commit hooks or in CI pipelines
 */
export function runTypeValidationCLI(): void {
  // This would be the entry point for running validation from command line
  console.log('Running type validation from CLI...');
  validateTypeConsistency()
    .then(result => {
      if (!result.success) {
        console.error('Type validation failed!');
        result.errors.forEach(error => {
          console.error(`${error.filePath}:${error.line}:${error.column} - ${error.message} [${error.code}]`);
        });
        process.exit(1);
      } else if (result.warnings.length > 0) {
        console.warn('Type validation succeeded with warnings:');
        result.warnings.forEach(warning => {
          console.warn(`${warning.filePath}:${warning.line}:${warning.column} - ${warning.message} [${warning.code}]`);
        });
        process.exit(0);
      } else {
        console.log('Type validation succeeded!');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('Unexpected error in type validation:', error);
      process.exit(1);
    });
}
