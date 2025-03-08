
import { devLogger } from '@/utils/debugUtils';

export interface ExtractComponentOptions {
  componentName: string;
  startLine: number;
  endLine: number;
  props: string[];
}

/**
 * Utility class to help extract parts of components into new components
 * while maintaining functionality
 */
export class ComponentExtractor {
  /**
   * Extract a section of a component into a new component
   * 
   * @param sourceCode Original component code
   * @param options Extraction options
   * @returns Object containing the modified source code and the new component code
   */
  public extractComponent(
    sourceCode: string, 
    options: ExtractComponentOptions
  ): { 
    updatedSourceCode: string;
    newComponentCode: string;
  } {
    const { componentName, startLine, endLine, props } = options;
    const lines = sourceCode.split('\n');
    
    // Extract the section to be moved to a new component
    const sectionLines = lines.slice(startLine - 1, endLine);
    const sectionCode = sectionLines.join('\n');
    
    // Create a new component with the extracted code
    const newComponentCode = this.createNewComponent(componentName, sectionCode, props, sourceCode);
    
    // Replace the extracted section with the new component usage
    const componentCall = this.createComponentCall(componentName, props);
    const updatedLines = [
      ...lines.slice(0, startLine - 1),
      componentCall,
      ...lines.slice(endLine)
    ];
    
    return {
      updatedSourceCode: updatedLines.join('\n'),
      newComponentCode
    };
  }
  
  /**
   * Generate the new component file content
   */
  private createNewComponent(
    componentName: string, 
    sectionCode: string, 
    props: string[],
    sourceCode: string
  ): string {
    // Extract imports from original component
    const importLines = this.extractRequiredImports(sourceCode, sectionCode);
    
    // Create props interface
    const propsInterface = `
interface ${componentName}Props {
  ${props.map(prop => `${prop}: any;`).join('\n  ')}
}`;

    // Create component implementation
    return `import React from 'react';
${importLines.join('\n')}

${propsInterface}

const ${componentName}: React.FC<${componentName}Props> = ({ ${props.join(', ')} }) => {
  return (
${sectionCode}
  );
};

export default ${componentName};
`;
  }
  
  /**
   * Create the component call to replace the extracted section
   */
  private createComponentCall(componentName: string, props: string[]): string {
    const propsStr = props.map(prop => `${prop}={${prop}}`).join(' ');
    return `<${componentName} ${propsStr} />`;
  }
  
  /**
   * Extract imports that might be needed in the new component
   */
  private extractRequiredImports(sourceCode: string, sectionCode: string): string[] {
    const importLines: string[] = [];
    const imports = sourceCode.match(/import .+ from ['"].+['"];?/g) || [];
    
    // Analyze the section code to determine which imports are needed
    imports.forEach(importLine => {
      // Extract the imported items or default import
      const match = importLine.match(/import\s+(?:{([\s\w,]+)}|(\w+))\s+from/);
      if (!match) return;
      
      const namedImports = match[1]?.split(',').map(i => i.trim()) || [];
      const defaultImport = match[2];
      
      // Check if any of the imports are used in the section code
      const isImportUsed = 
        (defaultImport && sectionCode.includes(defaultImport)) ||
        namedImports.some(imp => imp && sectionCode.includes(imp));
      
      if (isImportUsed) {
        importLines.push(importLine);
      }
    });
    
    return importLines;
  }
  
  /**
   * Analyze component to suggest extraction points
   */
  public suggestExtractions(sourceCode: string): ExtractComponentOptions[] {
    const suggestions: ExtractComponentOptions[] = [];
    const lines = sourceCode.split('\n');
    
    // Find JSX sections that could be extracted
    let inJsxBlock = false;
    let currentBlockStart = 0;
    let currentNestingLevel = 0;
    let potentialBlocks: Array<{start: number; end: number; level: number}> = [];
    
    lines.forEach((line, index) => {
      // Very basic JSX detection
      const openTags = (line.match(/<[A-Za-z][^\/]*>/g) || []).length;
      const closeTags = (line.match(/<\/[A-Za-z][^>]*>/g) || []).length;
      const selfClosingTags = (line.match(/<[A-Za-z][^>]*\/>/g) || []).length;
      
      if (!inJsxBlock && line.trim().match(/<[A-Za-z]/)) {
        inJsxBlock = true;
        currentBlockStart = index + 1;
        currentNestingLevel = 0;
      }
      
      currentNestingLevel += openTags - closeTags - selfClosingTags;
      
      if (inJsxBlock && currentNestingLevel === 0 && line.trim().match(/<\/[A-Za-z]/)) {
        inJsxBlock = false;
        
        // Only consider blocks of sufficient size
        const blockSize = index - currentBlockStart + 1;
        if (blockSize > 15) {
          potentialBlocks.push({
            start: currentBlockStart,
            end: index + 1,
            level: currentNestingLevel
          });
        }
      }
    });
    
    // Process potential blocks
    potentialBlocks.forEach((block, idx) => {
      // Create a meaningful component name
      const componentName = `Extracted${this.detectBlockPurpose(lines.slice(block.start - 1, block.end))}Component${idx + 1}`;
      
      // Detect used props
      const propsUsed = this.detectRequiredProps(lines.slice(block.start - 1, block.end));
      
      suggestions.push({
        componentName,
        startLine: block.start,
        endLine: block.end,
        props: propsUsed
      });
    });
    
    return suggestions;
  }
  
  /**
   * Attempt to detect the purpose of a code block
   */
  private detectBlockPurpose(blockLines: string[]): string {
    const blockText = blockLines.join(' ');
    
    // Look for common UI pattern names
    if (blockText.includes('Form')) return 'Form';
    if (blockText.includes('List')) return 'List';
    if (blockText.includes('Header')) return 'Header';
    if (blockText.includes('Footer')) return 'Footer';
    if (blockText.includes('Modal')) return 'Modal';
    if (blockText.includes('Card')) return 'Card';
    if (blockText.includes('Section')) return 'Section';
    
    return 'UI';
  }
  
  /**
   * Attempt to detect props used in a block
   */
  private detectRequiredProps(blockLines: string[]): string[] {
    const blockText = blockLines.join(' ');
    const props = new Set<string>();
    
    // Find variable references using regex
    const varMatches = blockText.match(/\{([a-zA-Z][a-zA-Z0-9_]*)((\.[a-zA-Z][a-zA-Z0-9_]*)*)\}/g) || [];
    
    varMatches.forEach(match => {
      // Extract variable name
      const varName = match.replace(/[{}]/g, '').split('.')[0];
      if (varName && !['this', 'props', 'state'].includes(varName)) {
        props.add(varName);
      }
    });
    
    return Array.from(props);
  }
}

export const componentExtractor = new ComponentExtractor();
