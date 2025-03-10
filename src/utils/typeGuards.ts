
/**
 * Type guards to provide runtime type safety
 */

/**
 * Type guard to check if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

/**
 * Type guard to check if value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard to check if value is null
 */
export function isNull(value: unknown): value is null {
  return value === null;
}

/**
 * Type guard to check if value is undefined
 */
export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

/**
 * Type guard to check if value is null or undefined
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return isNull(value) || isUndefined(value);
}

/**
 * Type guard to check if value is a plain object
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

/**
 * Type guard to check if value is an array
 */
export function isArray<T = unknown>(value: unknown): value is Array<T> {
  return Array.isArray(value);
}

/**
 * Type guard to check if value is a function
 */
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

/**
 * Type guard to check if value is a Date
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Type guard to check if value is a promise
 */
export function isPromise<T = unknown>(value: unknown): value is Promise<T> {
  return value instanceof Promise || (
    value !== null &&
    typeof value === 'object' &&
    'then' in value &&
    isFunction(value.then)
  );
}

/**
 * Type guard to check if value has a specific property
 */
export function hasProperty<K extends PropertyKey>(
  value: unknown,
  key: K
): value is { [P in K]: unknown } {
  return (
    !isNullOrUndefined(value) &&
    typeof value === 'object' &&
    key in value
  );
}

/**
 * Type guard to check if all required properties exist on an object
 */
export function hasRequiredProps<K extends PropertyKey>(
  value: unknown,
  keys: K[]
): value is { [P in K]: unknown } {
  if (!isPlainObject(value)) return false;
  return keys.every(key => key in value);
}

/**
 * Type guard to check if a value is a valid MetatronsNode
 */
export function isMetatronsNode(value: unknown): boolean {
  return (
    hasRequiredProps(value, ['id', 'x', 'y']) &&
    isString(value.id) &&
    isNumber(value.x) &&
    isNumber(value.y)
  );
}

/**
 * Type guard to check if a value is a valid MetatronsConnection
 */
export function isMetatronsConnection(value: unknown): boolean {
  if (!isPlainObject(value)) return false;
  
  // Check for new field names (from/to)
  if (hasProperty(value, 'from') && hasProperty(value, 'to')) {
    return isString(value.from) && isString(value.to);
  }
  
  // Check for deprecated field names (source/target)
  if (hasProperty(value, 'source') && hasProperty(value, 'target')) {
    return isString(value.source) && isString(value.target);
  }
  
  return false;
}
