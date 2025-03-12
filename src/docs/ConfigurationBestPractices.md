
# Configuration and Supabase Best Practices

## Configuration Management

### Environment Variables

1. **Prefix Conventions**
   - Always use `VITE_` prefix for variables accessible in the browser
   - Use proper naming conventions (e.g., `VITE_SUPABASE_URL`)
   - Document required variables in README and setup instructions

2. **Validation**
   - Always validate configuration early in the application lifecycle
   - Implement graceful degradation for missing/invalid configuration
   - Provide clear error messages and setup instructions during development

3. **Access Patterns**
   - Use a centralized configuration service for accessing environment variables
   - Implement type-safe getters with appropriate defaults
   - Never access `import.meta.env` directly outside the configuration service

### Configuration Bootstrap

1. **Initialization Sequence**
   - Initialize configuration before other services (Supabase, etc.)
   - Use a distinct bootstrap phase before rendering the main application
   - Implement proper error handling for failed initialization

2. **Status Reporting**
   - Clearly communicate initialization status to users (loading, error, degraded)
   - Log detailed information during development, but be more discreet in production
   - Provide actionable error messages with clear remediation steps

## Supabase Integration

### Client Initialization

1. **Singleton Pattern**
   - Use a singleton pattern for Supabase client to prevent multiple instances
   - Implement both async and sync access methods with proper safeguards
   - Use a cache-first approach to avoid redundant initialization

2. **Error Handling**
   - Implement retry logic for initialization failures
   - Provide a graceful fallback (mock client) when configuration is invalid
   - Log detailed error information during development

3. **Typesafety**
   - Use generated types from Supabase for type-safe queries
   - Ensure proper typing for all database operations
   - Validate inputs before sending to the database

### Connection Management

1. **Connection Checks**
   - Implement a connection test early in the application lifecycle
   - Provide clear feedback when connection fails
   - Consider implementing reconnection logic for transient failures

2. **Query Patterns**
   - Wrap database operations in standardized error handling
   - Use helper functions for common operations
   - Implement timeouts for critical operations

### RLS and Security

1. **Row Level Security**
   - Always enable RLS on tables containing user data
   - Create appropriate policies for different operations (SELECT, INSERT, UPDATE, DELETE)
   - Test policies thoroughly to ensure proper access controls

2. **Function Search Path**
   - Use `SECURITY DEFINER` for functions that need to bypass RLS
   - Always set a fixed search_path to prevent SQL injection
   - Follow the principle of least privilege

3. **Password Security**
   - Enable leaked password protection in Supabase Auth settings
   - Implement appropriate password policies
   - Use secure authentication methods

## Application State Management

1. **Initialization States**
   - Define clear application states (PENDING, IN_PROGRESS, SUCCESS, FAILED, DEGRADED)
   - Handle each state appropriately in the UI
   - Provide recovery options for failed initialization

2. **Performance Monitoring**
   - Implement performance monitoring for critical initialization steps
   - Track initialization time and success rates
   - Optimize initialization sequence for performance

3. **User Experience**
   - Show appropriate loading indicators during initialization
   - Provide clear error messages when initialization fails
   - Consider a degraded mode for non-critical failures

## Implementation Patterns

1. **Mock Clients**
   - Implement mock clients for development and error recovery
   - Ensure mock clients provide appropriate feedback
   - Document limitations of mock clients

2. **Helper Functions**
   - Create helper functions for common database operations
   - Implement standardized error handling
   - Use typed wrappers for RPC calls

3. **Testing**
   - Test initialization with and without valid configuration
   - Verify error handling for various failure scenarios
   - Implement reset functions for testing different states
