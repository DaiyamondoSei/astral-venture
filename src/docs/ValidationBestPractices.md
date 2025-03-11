# Validation Best Practices

This document outlines the best practices for implementing validation in our application. It covers both runtime validation for user data and compiler-enforced type validation for our internal APIs.

## 1. Validation System Architecture

### 1.1 Three-Layer Validation Architecture

Our validation system follows a three-layer architecture:

1. **Core Type Layer**: TypeScript type definitions that provide compile-time checking
2. **Runtime Validation Layer**: Functions that validate data at runtime
3. **UI Validation Layer**: Form validation for user inputs with feedback

This architecture ensures that validation is consistent at all levels of the application.

### 1.2 Validation Pipeline

Every significant validation should go through a pipeline with distinct phases:

1. **Pre-validation**: Sanitize and normalize input data
2. **Main validation**: Validate type constraints and structure
3. **Post-validation**: Apply business rules and domain-specific logic

```typescript
class UserValidationPipeline extends ValidationPipeline<User> {
  preValidate(data: unknown): ValidationResult {
    // Normalize emails to lowercase, trim strings, etc.
    if (!isObject(data)) return { valid: true };
    
    const normalized = { ...data };
    if (isString(data.email)) normalized.email = data.email.toLowerCase().trim();
    if (isString(data.name)) normalized.name = data.name.trim();
    
    return { valid: true, validatedData: normalized };
  }
  
  validate(data: unknown): ValidationResult<User> {
    // Type and constraint validation
    if (!isObject(data)) {
      return createValidationError('User must be an object', 'user');
    }
    
    // Check required fields
    if (!isString(data.id)) {
      return createValidationError('User ID is required and must be a string', 'id');
    }
    
    // ... other validations
    
    return createValidationSuccess(data as User);
  }
  
  postValidate(user: User): ValidationResult<User> {
    // Business rule validation
    if (user.role === 'admin' && !user.securityClearance) {
      return createValidationError(
        'Admin users must have security clearance',
        'securityClearance'
      );
    }
    
    return createValidationSuccess(user);
  }
}
```

## 2. Type Safety Best Practices

### 2.1 Branded Types for Safe IDs

Use branded types for identifiers to prevent mixing different ID types:

```typescript
// Definition
type Brand<K, T> = K & { __brand: T };
type UserID = Brand<string, 'user-id'>;
type OrderID = Brand<string, 'order-id'>;

// Validation and creation
function createUserID(id: string): UserID {
  if (!id.match(/^user_[a-z0-9]+$/)) {
    throw new Error('Invalid user ID format');
  }
  return id as UserID;
}

// Type-safe usage
function getUser(id: UserID): User { /* ... */ }
function getOrder(id: OrderID): Order { /* ... */ }

// This would fail at compile-time:
// getUser(orderId); // Error: Type 'OrderID' is not assignable to parameter of type 'UserID'
```

### 2.2 Exhaustive Pattern Matching

Always use exhaustive pattern matching with discriminated unions:

```typescript
type Status = 'pending' | 'active' | 'suspended' | 'cancelled';

function getStatusColor(status: Status): string {
  switch (status) {
    case 'pending':
      return 'yellow';
    case 'active':
      return 'green';
    case 'suspended':
      return 'orange';
    case 'cancelled':
      return 'red';
    default:
      // This ensures we've covered all cases
      const exhaustiveCheck: never = status;
      throw new Error(`Unhandled status: ${exhaustiveCheck}`);
  }
}
```

### 2.3 Type-Safe API Responses

Create structured API response types with type guards:

```typescript
// Type definition
type ApiResponse<T> = 
  | { status: 'success'; data: T }
  | { status: 'error'; error: ApiError };

// Type guard
function isSuccessResponse<T>(response: ApiResponse<T>): response is { status: 'success'; data: T } {
  return response.status === 'success';
}

// Usage
function handleApiResponse<T>(response: ApiResponse<T>): T {
  if (isSuccessResponse(response)) {
    return response.data; // TypeScript knows this is type T
  } else {
    throw new Error(`API Error: ${response.error.message}`);
  }
}
```

## 3. Runtime Validation Strategies

### 3.1 Validation Guard Composition

Build complex validators by composing smaller ones:

```typescript
// Base validators
const validateEmail = createValidator<string>(
  (value) => isString(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  'Invalid email format'
);

const validatePasswordStrength = createValidator<string>(
  (value) => isString(value) && value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value),
  'Password must be at least 8 characters with uppercase letter and number'
);

// Combined validator
const validateRegistration = createObjectValidator({
  email: validateEmail,
  password: validatePasswordStrength,
  confirmPassword: createValidator<string>(
    (value, data) => value === data.password,
    'Passwords must match'
  )
});
```

### 3.2 Progressive Validation

Implement progressive validation that validates as the user inputs data:

```typescript
function useProgressiveValidation<T>(schema: ValidationSchema<T>) {
  const [data, setData] = useState<Partial<T>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  
  // Only validate fields that have been touched
  const validateField = (fieldName: keyof T, value: unknown) => {
    if (!touchedFields[fieldName as string]) return;
    
    const validator = schema[fieldName];
    if (!validator) return;
    
    const result = validator(value);
    if (!result.valid && result.error) {
      setErrors(prev => ({ ...prev, [fieldName]: result.error.message }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName as string];
        return newErrors;
      });
    }
  };
  
  // Handle field changes
  const handleChange = (fieldName: keyof T, value: unknown) => {
    setData(prev => {
      const newData = { ...prev, [fieldName]: value };
      validateField(fieldName, value);
      return newData;
    });
  };
  
  // Mark field as touched when it loses focus
  const handleBlur = (fieldName: keyof T) => {
    setTouchedFields(prev => {
      const newTouched = { ...prev, [fieldName]: true };
      validateField(fieldName, data[fieldName]);
      return newTouched;
    });
  };
  
  return { data, errors, handleChange, handleBlur };
}
```

### 3.3 Validation Caching

Cache validation results for expensive validations:

```typescript
const validationCache = new WeakMap<object, ValidationResult>();

function validateWithCache<T>(
  data: unknown, 
  validator: Validator<T>,
  cacheKey?: string
): ValidationResult<T> {
  // Use object identity for caching if no cache key provided
  if (isObject(data) && !cacheKey) {
    const cached = validationCache.get(data);
    if (cached) return cached as ValidationResult<T>;
    
    const result = validator(data);
    validationCache.set(data, result);
    return result;
  }
  
  // Use cache key for non-object values or explicit keys
  if (cacheKey) {
    const key = `${cacheKey}:${JSON.stringify(data)}`;
    const cached = localStorage.getItem(key);
    if (cached) {
      try {
        return JSON.parse(cached) as ValidationResult<T>;
      } catch {
        // Ignore cache errors and revalidate
      }
    }
    
    const result = validator(data);
    try {
      localStorage.setItem(key, JSON.stringify(result));
    } catch {
      // Ignore storage errors
    }
    return result;
  }
  
  // Fallback to direct validation
  return validator(data);
}
```

## 4. Error Handling Best Practices

### 4.1 Structured Validation Errors

Create structured error objects with detailed information:

```typescript
class ValidationError extends Error {
  constructor(
    message: string,
    public readonly details: ValidationErrorDetail[],
    public readonly code: ValidationErrorCode,
    public readonly httpStatus: number = 400
  ) {
    super(message);
    this.name = 'ValidationError';
  }
  
  // Helper to get field-specific error messages
  public getFieldErrors(): Record<string, string> {
    return this.details.reduce((acc, detail) => {
      acc[detail.path] = detail.message;
      return acc;
    }, {} as Record<string, string>);
  }
  
  // Convert to API response format
  public toApiResponse(): ApiErrorResponse {
    return {
      status: 'error',
      code: this.code,
      message: this.message,
      details: this.details
    };
  }
}
```

### 4.2 Custom Error Factories

Create factory functions for common error types:

```typescript
// Factory functions for common validation error types
ValidationError.required = (field: string, message?: string) => 
  new ValidationError(
    message || `${field} is required`,
    [{ path: field, message: message || `${field} is required`, code: ValidationErrorCode.REQUIRED }],
    ValidationErrorCode.REQUIRED
  );

ValidationError.invalidFormat = (field: string, format: string, message?: string) => 
  new ValidationError(
    message || `${field} has invalid format`,
    [{ path: field, message: message || `${field} must be in ${format} format`, code: ValidationErrorCode.FORMAT_ERROR }],
    ValidationErrorCode.FORMAT_ERROR
  );

// Usage
throw ValidationError.required('email');
throw ValidationError.invalidFormat('email', 'example@domain.com', 'Please enter a valid email address');
```

### 4.3 Error Translation for UI

Translate validation errors into user-friendly messages:

```typescript
const errorMessages = {
  required: (field: string) => `Please enter your ${field}`,
  email: () => 'Please enter a valid email address',
  password: {
    minLength: (min: number) => `Password must be at least ${min} characters`,
    uppercase: () => 'Password must include at least one uppercase letter',
    number: () => 'Password must include at least one number'
  }
};

function translateValidationError(error: ValidationError): Record<string, string> {
  return error.details.reduce((acc, detail) => {
    const fieldName = detail.path;
    let message = detail.message;
    
    // Use custom messages if available
    if (detail.code === ValidationErrorCode.REQUIRED && errorMessages.required) {
      message = errorMessages.required(fieldName);
    } else if (fieldName === 'email' && detail.code === ValidationErrorCode.FORMAT_ERROR && errorMessages.email) {
      message = errorMessages.email();
    }
    
    acc[fieldName] = message;
    return acc;
  }, {} as Record<string, string>);
}
```

## 5. Testing Validation

### 5.1 Type Testing

Use TypeScript's type system to test type definitions:

```typescript
// src/types/__tests__/types.test.ts
import { expectType, expectError } from 'tsd';

// Test that UserID is not assignable to OrderID
expectError<OrderID>('user_123' as UserID);

// Test that validated data has the correct type
const user = validateUser({ id: 'user_123', name: 'Test User' });
expectType<User>(user);
```

### 5.2 Validation Unit Tests

Test both valid and invalid cases for each validator:

```typescript
describe('Email Validator', () => {
  // Test valid emails
  test.each([
    'user@example.com',
    'user.name@example.co.uk',
    'user+tag@example.com'
  ])('validates correct email: %s', (email) => {
    const result = validateEmail(email, 'email');
    expect(result.valid).toBe(true);
  });
  
  // Test invalid emails
  test.each([
    'user',
    'user@',
    '@example.com',
    'user@example'
  ])('rejects incorrect email: %s', (email) => {
    const result = validateEmail(email, 'email');
    expect(result.valid).toBe(false);
    expect(result.error?.path).toBe('email');
    expect(result.error?.code).toBe(ValidationErrorCode.FORMAT_ERROR);
  });
});
```

### 5.3 Validation Integration Tests

Test the complete validation pipeline:

```typescript
describe('Registration Validation Pipeline', () => {
  const pipeline = new UserRegistrationPipeline();
  
  test('validates complete registration data', () => {
    const data = {
      email: 'user@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      name: 'Test User'
    };
    
    const result = pipeline.validateAll(data);
    expect(result.valid).toBe(true);
    expect(result.validatedData).toEqual({
      email: 'user@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      name: 'Test User'
    });
  });
  
  test('rejects registration with mismatched passwords', () => {
    const data = {
      email: 'user@example.com',
      password: 'Password123',
      confirmPassword: 'Password456',
      name: 'Test User'
    };
    
    const result = pipeline.validateAll(data);
    expect(result.valid).toBe(false);
    expect(result.errors?.some(e => e.path === 'confirmPassword')).toBe(true);
  });
});
```

## 6. Performance Considerations

### 6.1 Fast Path Optimization

Implement fast-path checks for common validation scenarios:

```typescript
function validateObject<T extends Record<string, unknown>>(
  value: unknown,
  fieldName = 'value'
): T {
  // Fast path: null check
  if (value === null || value === undefined) {
    throw ValidationError.required(fieldName);
  }
  
  // Fast path: type check
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw ValidationError.invalidType(fieldName, 'object');
  }
  
  return value as T;
}
```

### 6.2 Lazy Validation

Implement lazy validation for expensive checks:

```typescript
function createLazyValidator<T>(
  validator: Validator<T>,
  options: { validateOnFirstAccess?: boolean } = {}
): Validator<T> {
  let cachedResult: ValidationResult<T> | null = null;
  let validated = false;
  
  return (value: unknown, context?: ValidationContext): ValidationResult<T> => {
    // Return cached result if available
    if (validated && cachedResult) {
      return cachedResult;
    }
    
    // Perform validation
    cachedResult = validator(value, context);
    validated = true;
    
    return cachedResult;
  };
}
```

### 6.3 Incremental Validation

For large objects, implement incremental validation that only validates changed fields:

```typescript
function incrementalValidate<T extends Record<string, unknown>>(
  data: T,
  schema: ValidationSchema<T>,
  previousData?: T,
  touchedFields?: Set<keyof T>
): ValidationResult<T> {
  const errors: ValidationErrorDetail[] = [];
  const validatedData = { ...data };
  
  // Determine which fields to validate
  const fieldsToValidate = touchedFields 
    ? [...touchedFields] 
    : previousData 
      ? Object.keys(data).filter(key => 
          data[key] !== previousData[key]
        ) as (keyof T)[]
      : Object.keys(data) as (keyof T)[];
  
  // Validate only the relevant fields
  for (const field of fieldsToValidate) {
    const validator = schema[field];
    if (!validator) continue;
    
    const result = validator(data[field]);
    if (!result.valid && result.error) {
      errors.push(result.error);
    }
  }
  
  return errors.length === 0
    ? { valid: true, validatedData }
    : { valid: false, errors };
}
```

## 7. Summary

Validation is a critical part of any robust application. By following these best practices, we can ensure:

1. **Type Safety**: Compile-time checking of our code
2. **Data Integrity**: Runtime validation of external inputs
3. **User Experience**: Clear feedback on validation errors
4. **Performance**: Efficient validation that doesn't slow down the application
5. **Maintainability**: Structured approach to validation that is easy to extend

Remember that validation is not just about checking inputs - it's about creating a system that guides users and developers towards correct usage patterns.
