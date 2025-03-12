# Supabase Best Practices

## Client Initialization

### Simple and Reliable Initialization

```typescript
// Simple initialization pattern
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a single client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Configuration Validation

Always validate that environment variables are present:

```typescript
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
}
```

### Error Handling

Use try/catch blocks to gracefully handle errors:

```typescript
try {
  const { data, error } = await supabase.from('table').select('*');
  if (error) throw error;
  // Process data
} catch (error) {
  console.error('Database operation failed:', error);
  // Handle error gracefully
}
```

## Database Operations

### Standard Query Pattern

```typescript
// Helper function for standard query pattern
async function executeQuery<T>(queryFn) {
  try {
    const { data, error } = await queryFn();
    
    if (error) {
      console.error('Database query error:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

// Usage
const { data, error } = await executeQuery(() => 
  supabase.from('table').select('*')
);
```

### Row Level Security (RLS)

Always enable RLS on tables with user data:

```sql
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

-- Create policies for different operations
CREATE POLICY "Users can view own data" 
  ON my_table FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data" 
  ON my_table FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
```

### Function Search Path

Always set a fixed search path in functions:

```sql
CREATE FUNCTION my_function()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '' -- Empty search path for security
AS $$
BEGIN
  -- Function body
END;
$$;
```

## Authentication

### User Sessions

Handle user sessions properly:

```typescript
// Check for existing session
const { data: { session } } = await supabase.auth.getSession();

// Set up auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  // Update app state based on auth changes
});
```

### Authentication Error Handling

Provide clear feedback for authentication errors:

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

if (error) {
  // Show appropriate error message
  if (error.message.includes('Invalid login')) {
    // Handle invalid credentials
  } else if (error.message.includes('Email not confirmed')) {
    // Handle unconfirmed email
  } else {
    // Handle other errors
  }
}
```

## Security Best Practices

### Never Store Sensitive Data Unencrypted

```typescript
// Store hashed/encrypted data only
const hashedData = await hashFunction(sensitiveData);
await supabase.from('secure_table').insert({ user_id, secure_data: hashedData });
```

### Use RLS for All Tables

Every table should have RLS enabled and appropriate policies.

### Use Transactions for Related Operations

```typescript
// Using PostgreSQL functions for transactions
const { data, error } = await supabase.rpc('create_user_with_profile', {
  user_email: email,
  user_name: name,
  // other parameters
});
```

## Performance

### Optimize Queries

```typescript
// Select only needed columns
const { data } = await supabase
  .from('large_table')
  .select('id, name, specific_column')
  .eq('condition', value)
  .limit(20);
```

### Use Indexes for Frequently Queried Columns

```sql
CREATE INDEX idx_table_column ON table(column);
```

### Leverage RPC for Complex Operations

Move complex operations to the database using RPC functions:

```typescript
// Client-side
const { data, error } = await supabase.rpc('complex_operation', { param1, param2 });

// Database function
CREATE FUNCTION complex_operation(param1 text, param2 int)
RETURNS json
LANGUAGE plpgsql
AS $$
BEGIN
  -- Complex logic here
  RETURN json_build_object('result', true);
END;
$$;
```
