
/**
 * Component Documentation Generator Script
 * 
 * Builds documentation for all documented components in the project
 * and exports it as markdown files.
 */

import fs from 'fs';
import path from 'path';
import { generateDocsMarkdown, listDocumentedComponents } from '../utils/componentDoc';

// Path where docs will be saved
const DOCS_DIR = path.join(process.cwd(), 'docs');

// Create docs directory if it doesn't exist
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

// Generate the documentation
function generateDocs(): void {
  try {
    // Import all components to register their documentation
    // Note: This requires a build step that compiles all component documentation
    console.log('Generating component documentation...');
    
    // Get all documented components
    const components = listDocumentedComponents();
    console.log(`Found ${components.length} documented components`);
    
    // Generate the markdown
    const markdown = generateDocsMarkdown();
    
    // Write to file
    const outputPath = path.join(DOCS_DIR, 'components.md');
    fs.writeFileSync(outputPath, markdown, 'utf8');
    
    console.log(`Documentation written to ${outputPath}`);
  } catch (error) {
    console.error('Error generating documentation:', error);
    process.exit(1);
  }
}

// Run the generator
generateDocs();
