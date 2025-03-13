
# Supabase Best Practices

## Security Fundamentals

### Row Level Security (RLS)

Always enable Row Level Security on all tables that contain user data:

```sql
ALTER TABLE public.your_table ENABLE ROW LEVEL SECURITY;
```

Create specific policies for each operation type:

```sql
-- Example: User can only see their own data
CREATE POLICY "Users can view their own data" 
  ON public.user_data
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Example: User can only insert their own data
CREATE POLICY "Users can insert their own data" 
  ON public.user_data
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
```

Test RLS policies thoroughly with authenticated and unauthenticated users.

### Function Security

Always use empty search path in Supabase functions to prevent SQL injection:

```sql
CREATE OR REPLACE FUNCTION public.get_user_data(user_id_param UUID)
RETURNS TABLE (id UUID, data TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '' -- Empty search path for security
AS $$
BEGIN
  RETURN QUERY
  SELECT id, data FROM public.user_data
  WHERE user_id = user_id_param;
END;
$$;
```

Use `SECURITY DEFINER` only when necessary, as it runs with the privileges of the function creator.

## Database Design

### Foreign Keys

Use foreign keys to maintain data integrity:

```sql
CREATE TABLE public.user_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data TEXT
);
```

### Timestamps

Add created_at and updated_at columns to track record history:

```sql
CREATE TABLE public.your_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add trigger to automatically update the updated_at column
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.your_table
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
```

## API Design

### Input Validation

Always validate user input before inserting into the database:

```typescript
// Client-side validation
function validateUserData(data: UserData): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (!data.name) {
    errors.push({
      field: 'name',
      message: 'Name is required'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

### Error Handling

Handle errors securely without exposing sensitive information:

```typescript
try {
  await supabase.from('user_data').insert(data);
} catch (error) {
  console.error('Database error:', error);
  
  // Don't expose internal error details to users
  throw new Error('Failed to save data. Please try again later.');
}
```

## Edge Functions

### Authentication in Edge Functions

Always verify authentication in edge functions:

```typescript
// Edge function
export async function handler(req: Request) {
  // Get Supabase client
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );
  
  // Verify authentication
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  
  if (error || !session) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // Process authenticated request
}
```

## Supabase Client Initialization

### Error Handling

Implement proper error handling during client initialization:

```typescript
// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate configuration early
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
}

// Create client with error handling
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Check if configuration is valid
export function isSupabaseConfigValid(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
```

## Performance and Scaling

### Optimizing Queries

Use specific column selection instead of selecting everything:

```typescript
// Good - only fetches needed columns
const { data } = await supabase
  .from('users')
  .select('id, name, email')
  .eq('id', userId);

// Avoid - fetches all columns
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);
```

### Pagination

Implement pagination for large datasets:

```typescript
// Fetch data with pagination
const { data, error } = await supabase
  .from('items')
  .select('id, name')
  .range(0, 9); // Fetch first 10 items (0-9)
```
