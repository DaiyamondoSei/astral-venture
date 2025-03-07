
/**
 * Utilities for debugging type issues at runtime
 */

/**
 * Logs the type and structure of an object for debugging
 * 
 * @param value The value to inspect
 * @param label Optional label for the log
 * @param depth Maximum depth to recurse into the object
 */
export function inspectType(
  value: unknown, 
  label = 'Type Inspection', 
  depth = 2
): void {
  console.group(label);
  
  if (value === null) {
    console.log('Type: null');
  } else if (value === undefined) {
    console.log('Type: undefined');
  } else if (Array.isArray(value)) {
    console.log('Type: Array');
    console.log('Length:', value.length);
    
    if (value.length > 0) {
      console.log('First item type:', getDetailedType(value[0]));
      
      if (depth > 0 && typeof value[0] === 'object' && value[0] !== null) {
        console.log('First item structure:');
        inspectType(value[0], 'Array item', depth - 1);
      }
    }
  } else {
    console.log('Type:', getDetailedType(value));
    
    if (typeof value === 'object' && value !== null) {
      console.log('Keys:', Object.keys(value));
      
      if (depth > 0) {
        console.log('Structure:');
        
        for (const [key, propValue] of Object.entries(value)) {
          console.log(`${key}:`, getDetailedType(propValue));
          
          if (depth > 1 && typeof propValue === 'object' && propValue !== null) {
            inspectType(propValue, `Property: ${key}`, depth - 1);
          }
        }
      }
    }
  }
  
  console.groupEnd();
}

/**
 * Gets a detailed type description of a value
 */
function getDetailedType(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  
  const baseType = typeof value;
  
  if (baseType !== 'object') {
    return baseType;
  }
  
  if (Array.isArray(value)) {
    return `Array<${value.length > 0 ? getDetailedType(value[0]) : 'unknown'}>`;
  }
  
  if (value instanceof Date) {
    return 'Date';
  }
  
  if (value instanceof RegExp) {
    return 'RegExp';
  }
  
  if (value instanceof Map) {
    return 'Map';
  }
  
  if (value instanceof Set) {
    return 'Set';
  }
  
  const constructor = Object.getPrototypeOf(value)?.constructor?.name;
  return constructor && constructor !== 'Object' ? constructor : 'Object';
}

/**
 * Creates a typed assertion that will throw if the condition is false
 */
export function assertType<T>(
  value: unknown, 
  check: (val: unknown) => val is T, 
  message = 'Type assertion failed'
): asserts value is T {
  if (!check(value)) {
    throw new TypeError(message);
  }
}

/**
 * Creates a debug wrapper that logs function inputs and outputs with type information
 */
export function debugFunction<Args extends unknown[], Return>(
  fn: (...args: Args) => Return,
  fnName = 'debugged function'
): (...args: Args) => Return {
  return (...args: Args): Return => {
    console.group(`Debug: ${fnName}`);
    console.log('Arguments:');
    args.forEach((arg, i) => {
      inspectType(arg, `Argument ${i}`, 1);
    });
    
    try {
      const result = fn(...args);
      console.log('Result:');
      inspectType(result, 'Return value', 1);
      console.groupEnd();
      return result;
    } catch (error) {
      console.error('Function threw an error:', error);
      console.groupEnd();
      throw error;
    }
  };
}
