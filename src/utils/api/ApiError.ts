
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromResponse(response: Response, details?: unknown): ApiError {
    return new ApiError(
      response.statusText,
      response.status,
      response.headers.get('x-error-code') || undefined,
      details
    );
  }

  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }
}
