
/**
 * Shared type definitions for edge functions
 */

// Base error types
export interface ErrorDetails {
  message: string;
  code?: string;
  field?: string;
  details?: unknown;
}

// Export ErrorCode enum for standardized error codes
export enum ErrorCode {
  UNAUTHORIZED = "unauthorized",
  AUTHENTICATION_ERROR = "authentication_error",
  INVALID_TOKEN = "invalid_token",
  
  VALIDATION_FAILED = "validation_failed",
  MISSING_PARAMETERS = "missing_parameters",
  INVALID_PARAMETERS = "invalid_parameters",
  
  INTERNAL_ERROR = "internal_error",
  EXTERNAL_API_ERROR = "external_api_error",
  TIMEOUT = "timeout",
  
  RATE_LIMITED = "rate_limited",
  QUOTA_EXCEEDED = "quota_exceeded",
  
  NETWORK_ERROR = "network_error",
  DATABASE_ERROR = "database_error",
  
  CONTENT_POLICY_VIOLATION = "content_policy_violation"
}

// Error types with proper inheritance
export class BaseError extends Error {
  code?: string;
  details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    
    // Required for proper inheritance in TypeScript
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends BaseError {
  field: string;

  constructor(message: string, field: string, code?: string, details?: unknown) {
    super(message, code || ErrorCode.VALIDATION_FAILED, details);
    this.field = field;
  }
}

export class AuthenticationError extends BaseError {
  constructor(message: string, code?: string) {
    super(message, code || ErrorCode.AUTHENTICATION_ERROR);
  }
}

export class DatabaseError extends BaseError {
  operation: string;
  table?: string;

  constructor(message: string, operation: string, table?: string, code?: string) {
    super(message, code || ErrorCode.DATABASE_ERROR);
    this.operation = operation;
    this.table = table;
  }
}

export class ExternalApiError extends BaseError {
  service: string;
  statusCode?: number;
  
  constructor(message: string, service: string, statusCode?: number) {
    super(message, ErrorCode.EXTERNAL_API_ERROR);
    this.service = service;
    this.statusCode = statusCode;
  }
}

// Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ErrorDetails;
  metadata?: Record<string, unknown>;
}

// Chat service types with improved type safety
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionMetrics {
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens: number;
  processingTimeMs: number;
}

export interface ChatCompletionResult {
  content: string;
  metrics: ChatCompletionMetrics;
}

// User context types with strict typing
export interface UserContext {
  userId: string;
  username?: string;
  preferences?: UserPreferences;
  profile?: UserProfile;
}

export interface UserPreferences {
  theme?: "light" | "dark" | "system";
  notifications?: boolean;
  language?: string;
}

export interface UserProfile {
  name?: string;
  level?: number;
  points?: number;
  completedPractices?: number;
}

// Function handler options with strict typing
export interface RequestHandlerOptions {
  requireAuth?: boolean;
  adminOnly?: boolean;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}

// WebSocket types
export interface WebSocketMessage {
  type: string;
  payload: unknown;
}

export interface WebSocketErrorMessage {
  type: 'error';
  payload: {
    message: string;
    code: string;
  };
}

// Authentication types
export interface AuthRequestOptions {
  /** Whether to include user profile data */
  includeProfile?: boolean;
  /** Whether to verify the token */
  verifyToken?: boolean;
}

export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
  aud?: string;
}

// Custom events types
export interface EventMessage<T = any> {
  event: string;
  data: T;
  timestamp: number;
  source: string;
}

// Global type declarations
declare global {
  interface Deno {
    env: {
      get(key: string): string | undefined;
      set(key: string, value: string): void;
    };
  }
  
  interface EdgeRuntime {
    waitUntil(promise: Promise<any>): void;
  }
  
  var EdgeRuntime: {
    waitUntil(promise: Promise<any>): void;
  };
}
