
/**
 * Shared type definitions for edge functions
 */

// Error types
export class ValidationError extends Error {
  field: string;
  code?: string;
  details?: unknown;

  constructor(message: string, field: string, code?: string, details?: unknown) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
    this.code = code;
    this.details = details;
    
    // This is needed in TypeScript to maintain proper inheritance
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class AuthenticationError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "AuthenticationError";
    this.code = code;
    
    // This is needed in TypeScript to maintain proper inheritance
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class DatabaseError extends Error {
  operation: string;
  table?: string;
  code?: string;

  constructor(message: string, operation: string, table?: string, code?: string) {
    super(message);
    this.name = "DatabaseError";
    this.operation = operation;
    this.table = table;
    this.code = code;
    
    // This is needed in TypeScript to maintain proper inheritance
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

export class ExternalApiError extends Error {
  service: string;
  statusCode?: number;
  
  constructor(message: string, service: string, statusCode?: number) {
    super(message);
    this.name = "ExternalApiError";
    this.service = service;
    this.statusCode = statusCode;
    
    // This is needed in TypeScript to maintain proper inheritance
    Object.setPrototypeOf(this, ExternalApiError.prototype);
  }
}

// Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: Record<string, unknown>;
}

// Chat service types
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

// User context types
export interface UserContext {
  userId: string;
  username?: string;
  preferences?: UserPreferences;
  profile?: UserProfile;
}

export interface UserPreferences {
  theme?: string;
  notifications?: boolean;
  language?: string;
}

export interface UserProfile {
  name?: string;
  level?: number;
  points?: number;
  completedPractices?: number;
}

// Function handler options
export interface RequestHandlerOptions {
  requireAuth?: boolean;
  adminOnly?: boolean;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}

// Types for global Deno namespace
declare global {
  interface Deno {
    env: {
      get(key: string): string | undefined;
      set(key: string, value: string): void;
    };
  }
  
  // For EdgeRuntime
  interface EdgeRuntime {
    waitUntil(promise: Promise<any>): void;
  }
  
  var EdgeRuntime: {
    waitUntil(promise: Promise<any>): void;
  };
}
