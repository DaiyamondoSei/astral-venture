
export interface PropChange {
  path: string;
  oldValue: any;
  newValue: any;
  type: 'added' | 'removed' | 'changed';
}

export class DeepPropAnalyzer {
  /**
   * Analyzes changes between old and new props objects
   */
  static analyzePropChanges(
    prevProps: Record<string, any> | null, 
    nextProps: Record<string, any>
  ): PropChange[] {
    if (!prevProps) {
      return Object.keys(nextProps).map(key => ({
        path: key,
        oldValue: undefined,
        newValue: nextProps[key],
        type: 'added'
      }));
    }
    
    const changes: PropChange[] = [];
    
    // Find added and changed props
    Object.keys(nextProps).forEach(key => {
      if (!(key in prevProps)) {
        changes.push({
          path: key,
          oldValue: undefined,
          newValue: nextProps[key],
          type: 'added'
        });
      } else if (!this.areEqual(prevProps[key], nextProps[key])) {
        changes.push({
          path: key,
          oldValue: prevProps[key],
          newValue: nextProps[key],
          type: 'changed'
        });
        
        // If objects, also find nested changes
        if (
          typeof prevProps[key] === 'object' && prevProps[key] !== null &&
          typeof nextProps[key] === 'object' && nextProps[key] !== null &&
          !Array.isArray(prevProps[key]) && !Array.isArray(nextProps[key])
        ) {
          const nestedChanges = this.analyzeNestedPropChanges(
            prevProps[key],
            nextProps[key],
            key
          );
          changes.push(...nestedChanges);
        }
      }
    });
    
    // Find removed props
    Object.keys(prevProps).forEach(key => {
      if (!(key in nextProps)) {
        changes.push({
          path: key,
          oldValue: prevProps[key],
          newValue: undefined,
          type: 'removed'
        });
      }
    });
    
    return changes;
  }
  
  /**
   * Analyzes changes in nested objects
   */
  private static analyzeNestedPropChanges(
    prevObj: Record<string, any>,
    nextObj: Record<string, any>,
    basePath: string
  ): PropChange[] {
    const changes: PropChange[] = [];
    
    // Find added and changed props
    Object.keys(nextObj).forEach(key => {
      const path = `${basePath}.${key}`;
      
      if (!(key in prevObj)) {
        changes.push({
          path,
          oldValue: undefined,
          newValue: nextObj[key],
          type: 'added'
        });
      } else if (!this.areEqual(prevObj[key], nextObj[key])) {
        changes.push({
          path,
          oldValue: prevObj[key],
          newValue: nextObj[key],
          type: 'changed'
        });
        
        // Recursively check nested objects
        if (
          typeof prevObj[key] === 'object' && prevObj[key] !== null &&
          typeof nextObj[key] === 'object' && nextObj[key] !== null &&
          !Array.isArray(prevObj[key]) && !Array.isArray(nextObj[key])
        ) {
          const nestedChanges = this.analyzeNestedPropChanges(
            prevObj[key],
            nextObj[key],
            path
          );
          changes.push(...nestedChanges);
        }
      }
    });
    
    // Find removed props
    Object.keys(prevObj).forEach(key => {
      if (!(key in nextObj)) {
        changes.push({
          path: `${basePath}.${key}`,
          oldValue: prevObj[key],
          newValue: undefined,
          type: 'removed'
        });
      }
    });
    
    return changes;
  }
  
  /**
   * Deep equality check for objects
   */
  private static areEqual(a: any, b: any): boolean {
    if (a === b) return true;
    
    if (a === null || b === null) return false;
    if (a === undefined || b === undefined) return false;
    
    if (typeof a !== typeof b) return false;
    
    if (typeof a === 'object') {
      if (Array.isArray(a) !== Array.isArray(b)) return false;
      
      if (Array.isArray(a)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
          if (!this.areEqual(a[i], b[i])) return false;
        }
        return true;
      }
      
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      
      if (keysA.length !== keysB.length) return false;
      
      for (const key of keysA) {
        if (!keysB.includes(key)) return false;
        if (!this.areEqual(a[key], b[key])) return false;
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Formats a prop change for display
   */
  static formatPropChange(change: PropChange): string {
    const { path, oldValue, newValue, type } = change;
    
    switch (type) {
      case 'added':
        return `Added prop '${path}' with value: ${this.stringifyValue(newValue)}`;
      case 'removed':
        return `Removed prop '${path}' (was: ${this.stringifyValue(oldValue)})`;
      case 'changed':
        return `Changed prop '${path}' from ${this.stringifyValue(oldValue)} to ${this.stringifyValue(newValue)}`;
      default:
        return `Unknown change to prop '${path}'`;
    }
  }
  
  /**
   * Safely stringifies a value for display
   */
  private static stringifyValue(value: any): string {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    
    if (typeof value === 'function') {
      return 'function() {...}';
    }
    
    if (typeof value === 'object') {
      try {
        const str = JSON.stringify(value);
        if (str.length > 50) {
          return str.substring(0, 47) + '...';
        }
        return str;
      } catch (e) {
        return Object.prototype.toString.call(value);
      }
    }
    
    return String(value);
  }
}
