
# Supabase Best Practices

## Row Level Security (RLS)

### Enabling RLS

Always enable Row Level Security on all tables that contain user data or sensitive information:

```sql
ALTER TABLE public.your_table ENABLE ROW LEVEL SECURITY;
```

### Creating Policies

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

-- Example: User can only update their own data
CREATE POLICY "Users can update their own data" 
  ON public.user_data
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Example: User can only delete their own data
CREATE POLICY "Users can delete their own data" 
  ON public.user_data
  FOR DELETE 
  USING (auth.uid() = user_id);
```

### Testing Policies

Always test RLS policies thoroughly:

1. Test as authenticated and unauthenticated users
2. Test with different user IDs
3. Test all operations (SELECT, INSERT, UPDATE, DELETE)
4. Test edge cases (e.g., null values, special characters)

## Function Security

### SECURITY DEFINER vs INVOKER

Use `SECURITY DEFINER` only when necessary:

```sql
CREATE OR REPLACE FUNCTION public.get_user_data(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  data TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER -- Function runs with the privileges of the creator
SET search_path = '' -- Empty search path for security
AS $$
BEGIN
  RETURN QUERY
  SELECT id, data 
  FROM public.user_data
  WHERE user_id = user_id_param;
END;
$$;
```

### Fixed Search Path

Always set a fixed search path in functions to prevent SQL injection:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '' -- Empty search path for security
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;
```

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

// Secure database insertion
async function insertUserData(data: UserData) {
  const validation = validateUserData(data);
  
  if (!validation.isValid) {
    throw new ValidationError('Invalid user data', validation.errors);
  }
  
  return await supabase
    .from('user_data')
    .insert({
      ...data,
      user_id: supabase.auth.user()?.id // Always set user_id server-side
    });
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

### Environment Variables

Use environment variables for sensitive information:

```typescript
// Edge function
export async function handler(req: Request) {
  // Get API key from environment
  const apiKey = Deno.env.get('API_KEY');
  
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'API key not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // Use API key securely
}
```

### Authentication in Edge Functions

Verify authentication in edge functions:

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
