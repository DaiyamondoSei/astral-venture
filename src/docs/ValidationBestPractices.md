
# Validation Best Practices

This document outlines best practices for implementing robust validation throughout the application.

## 1. Validation Principles

### 1.1 Key Validation Principles

1. **Validate at system boundaries**: Always validate data as it enters your system (API requests, user input, files)
2. **Fail fast**: Validate early and return errors immediately 
3. **Provide specific error messages**: Help users understand and fix validation issues
4. **Separate validation from business logic**: Keep validation decoupled from application logic
5. **Create reusable validators**: Build a library of reusable validation functions
6. **Consistent error format**: Use a consistent error structure across the application

### 1.2 Validation Architecture

```
┌────────────────┐     ┌──────────────────┐     ┌────────────────┐
│  Pre-validate  │────▶│  Main Validation  │────▶│  Post-validate │
│  (Sanitize)    │     │  (Type/Constraints)│     │  (Rules)       │
└────────────────┘     └──────────────────┘     └────────────────┘
         │                      │                        │
         ▼                      ▼                        ▼
┌────────────────┐     ┌──────────────────┐     ┌────────────────┐
│  Clean Input   │     │ Type-Safe Data   │     │Validated Data  │
└────────────────┘     └──────────────────┘     └────────────────┘
```

## 2. Validation Implementation

### 2.1 Validation Result Pattern

```typescript
// Consistent validation result structure
interface ValidationResult<T = unknown> {
  valid: boolean;                     // Whether validation passed
  data?: T;                           // The validated data if successful
  error?: ValidationErrorDetail;      // Error details if validation failed
  errors?: ValidationErrorDetail[];   // Multiple errors if applicable
  metadata?: ValidationMetadata;      // Additional metadata
}

// Detailed error information
interface ValidationErrorDetail {
  path: string;        // Path to the field with error
  message: string;     // User-friendly error message
  code?: string;       // Error code for programmatic handling
  rule?: string;       // Validation rule that failed
  value?: unknown;     // Value that failed validation
  type?: string;       // Expected type
  severity?: ValidationSeverity; // Error severity level
}
```

### 2.2 Validator Functions

```typescript
// Type for validator functions
type Validator<T = unknown> = (
  value: unknown, 
  context?: ValidationContext
) => ValidationResult<T>;

// Composing validators
function composeValidators<T>(...validators: Validator[]): Validator<T> {
  return (value: unknown, context?: ValidationContext): ValidationResult<T> => {
    for (const validator of validators) {
      const result = validator(value, context);
      if (!result.valid) {
        return result as ValidationResult<T>;
      }
    }
    return { valid: true, data: value as T };
  };
}

// Example validator
const nameValidator: Validator<string> = (value, context) => {
  if (typeof value !== 'string') {
    return {
      valid: false,
      error: {
        path: context?.fieldPath || 'name',
        message: 'Name must be a string',
        type: 'string',
        value,
        code: 'TYPE_ERROR'
      }
    };
  }
  
  if (value.trim() === '') {
    return {
      valid: false,
      error: {
        path: context?.fieldPath || 'name',
        message: 'Name cannot be empty',
        value,
        code: 'REQUIRED'
      }
    };
  }
  
  return { valid: true, data: value };
};
```

### 2.3 Schema-Based Validation

```typescript
// Schema definition
const userSchema: ValidationSchema<User> = {
  name: nameValidator,
  email: emailValidator,
  age: ageValidator
};

// Validating against schema
function validateObject<T>(
  data: unknown, 
  schema: ValidationSchema<T>,
  options?: ValidationOptions
): ValidationResult<T> {
  if (!isObject(data)) {
    return {
      valid: false,
      error: {
        path: '',
        message: 'Data must be an object',
        type: 'object',
        value: data,
        code: 'TYPE_ERROR'
      }
    };
  }
  
  const errors: ValidationErrorDetail[] = [];
  const validatedData: Record<string, any> = {};
  
  for (const [key, validator] of Object.entries(schema)) {
    if (!validator) continue;
    
    const context: ValidationContext = {
      fieldPath: key,
      parentValue: data,
      options,
      root: data,
      siblingValues: data as Record<string, unknown>
    };
    
    const result = validator(data[key], context);
    
    if (result.valid && result.data !== undefined) {
      validatedData[key] = result.data;
    } else if (!result.valid) {
      if (options?.abortEarly) {
        return result;
      }
      if (result.error) {
        errors.push(result.error);
      }
      if (result.errors) {
        errors.push(...result.errors);
      }
    }
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return { valid: true, data: validatedData as T };
}
```

## 3. Validation Error Handling

### 3.1 ValidationError Class

```typescript
class ValidationError extends Error {
  public readonly details: ValidationErrorDetail[];
  public readonly code: string;
  
  constructor(
    message: string,
    details: ValidationErrorDetail[] = [],
    code: string = 'VALIDATION_ERROR'
  ) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
    this.code = code;
    
    // This is needed to make instanceof work correctly
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
  
  // Get errors formatted for UI display
  public getFormattedErrors(): Record<string, string> {
    return this.details.reduce((acc, detail) => {
      acc[detail.path] = detail.message;
      return acc;
    }, {});
  }
}
```

### 3.2 Error Handling Pattern

```typescript
try {
  const result = validateUser(userData);
  if (!result.valid) {
    throw new ValidationError(
      'Invalid user data',
      result.errors || [result.error]
    );
  }
  
  // Proceed with valid data
  const user = result.data;
  
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors (show to user)
    const formErrors = error.getFormattedErrors();
    displayErrors(formErrors);
  } else {
    // Handle other errors
    logError(error);
    showGenericErrorMessage();
  }
}
```

## 4. Form Validation

### 4.1 React Hook Form Integration

```typescript
import { useForm } from 'react-hook-form';

// Define validation schema
const userSchema = {
  name: nameValidator,
  email: emailValidator,
  age: ageValidator
};

// Custom validator for react-hook-form
function validateWithSchema<T>(schema: ValidationSchema<T>) {
  return async (data: unknown) => {
    const result = validateObject(data, schema);
    
    if (!result.valid) {
      // Convert to format expected by react-hook-form
      const errors = {};
      result.errors?.forEach(error => {
        errors[error.path] = { 
          type: error.code || 'validation',
          message: error.message 
        };
      });
      return errors;
    }
    
    return true;
  };
}

// In component
function UserForm() {
  const { register, handleSubmit, errors } = useForm({
    resolver: validateWithSchema(userSchema)
  });
  
  const onSubmit = (data) => {
    // Data is validated and type-safe
    createUser(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input {...register('age')} type="number" />
      {errors.age && <span>{errors.age.message}</span>}
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

## 5. API Validation

### 5.1 Request Validation

```typescript
// API endpoint with validation
async function handleUserCreate(req, res) {
  try {
    // Validate request body
    const result = validateObject(req.body, userSchema);
    
    if (!result.valid) {
      return res.status(400).json({
        success: false,
        errors: result.errors || [result.error]
      });
    }
    
    // Proceed with valid data
    const user = result.data;
    const createdUser = await createUser(user);
    
    return res.status(201).json({
      success: true,
      data: createdUser
    });
    
  } catch (error) {
    // Handle unexpected errors
    console.error('User creation error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}
```

### 5.2 Response Validation

```typescript
// Validate API responses
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  
  // Validate response data
  const result = validateObject(data, userSchema);
  
  if (!result.valid) {
    throw new ValidationError(
      'Invalid response data',
      result.errors || [result.error]
    );
  }
  
  return result.data;
}
```

## 6. Advanced Validation Techniques

### 6.1 Cross-Field Validation

```typescript
// Password validation with confirmation
const passwordSchema = {
  password: passwordValidator,
  confirmPassword: (value, context) => {
    if (value !== context.siblingValues.password) {
      return {
        valid: false,
        error: {
          path: context.fieldPath || 'confirmPassword',
          message: 'Passwords do not match',
          code: 'CONSTRAINT_ERROR'
        }
      };
    }
    return { valid: true, data: value };
  }
};
```

### 6.2 Conditional Validation

```typescript
// Conditional validation
const paymentSchema = {
  method: paymentMethodValidator,
  cardNumber: (value, context) => {
    if (context.siblingValues.method === 'credit-card') {
      // Only validate card number if payment method is credit card
      return cardNumberValidator(value, context);
    }
    return { valid: true, data: value };
  }
};
```

### 6.3 Async Validation

```typescript
// Async validation (e.g., checking if email is already taken)
const asyncEmailValidator: AsyncValidator<string> = async (value, context) => {
  if (typeof value !== 'string') {
    return {
      valid: false,
      error: {
        path: context?.fieldPath || 'email',
        message: 'Email must be a string',
        type: 'string',
        value,
        code: 'TYPE_ERROR'
      }
    };
  }
  
  if (!isValidEmail(value)) {
    return {
      valid: false,
      error: {
        path: context?.fieldPath || 'email',
        message: 'Invalid email format',
        value,
        code: 'FORMAT_ERROR'
      }
    };
  }
  
  // Check if email is already taken
  const isEmailTaken = await checkEmailExists(value);
  
  if (isEmailTaken) {
    return {
      valid: false,
      error: {
        path: context?.fieldPath || 'email',
        message: 'Email is already taken',
        value,
        code: 'CONSTRAINT_ERROR'
      }
    };
  }
  
  return { valid: true, data: value };
};
```

## 7. Performance Considerations

### 7.1 Validation Caching

```typescript
// Cache validation results for expensive validators
const validationCache = new WeakMap<object, ValidationResult>();

function validateWithCache<T>(
  data: unknown, 
  validator: Validator<T>
): ValidationResult<T> {
  if (!isObject(data)) {
    return validator(data);
  }
  
  const cached = validationCache.get(data);
  if (cached) {
    return cached as ValidationResult<T>;
  }
  
  const result = validator(data);
  validationCache.set(data, result);
  return result;
}
```

### 7.2 Optimized Validators

```typescript
// Optimized string validator with fast-path checks
function createStringValidator(
  options: StringValidationOptions = {}
): Validator<string> {
  return (value, context) => {
    // Fast path for common cases
    if (typeof value === 'string') {
      if (options.minLength !== undefined && value.length < options.minLength) {
        return {
          valid: false,
          error: {
            path: context?.fieldPath || '',
            message: `Must be at least ${options.minLength} characters`,
            value,
            code: 'LENGTH_ERROR'
          }
        };
      }
      
      if (options.maxLength !== undefined && value.length > options.maxLength) {
        return {
          valid: false,
          error: {
            path: context?.fieldPath || '',
            message: `Must be at most ${options.maxLength} characters`,
            value,
            code: 'LENGTH_ERROR'
          }
        };
      }
      
      if (options.pattern && !options.pattern.test(value)) {
        return {
          valid: false,
          error: {
            path: context?.fieldPath || '',
            message: options.patternMessage || 'Invalid format',
            value,
            code: 'PATTERN_ERROR'
          }
        };
      }
      
      return { valid: true, data: value };
    }
    
    return {
      valid: false,
      error: {
        path: context?.fieldPath || '',
        message: 'Must be a string',
        type: 'string',
        value,
        code: 'TYPE_ERROR'
      }
    };
  };
}
```

## 8. Best Practices Summary

1. **Validate at boundaries**: Always validate data as it enters your system
2. **Use a consistent validation pattern**: Structure validation results consistently
3. **Provide detailed error information**: Include path, message, code, and value
4. **Create reusable validators**: Build a library of common validation functions
5. **Compose validators**: Combine simple validators into complex validation logic
6. **Handle validation errors gracefully**: Convert validation errors to user-friendly messages
7. **Implement performance optimizations**: Use caching and fast-path checks for performance
8. **Test validation logic**: Create comprehensive tests for validation logic
9. **Document validation requirements**: Clearly document validation rules and error codes
10. **Separate validation from business logic**: Keep validation decoupled from application logic

By following these validation best practices, you can create a robust, maintainable, and user-friendly validation system.
