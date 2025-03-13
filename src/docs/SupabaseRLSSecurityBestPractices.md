
# Supabase Row Level Security (RLS) Best Practices

## Common Issues and Solutions

### 1. Inefficient RLS Policies

**Problem**:
Calls to `current_setting()` and `auth.function()` directly in RLS policies can lead to performance issues and security vulnerabilities.

**Solution**:
Use security definer functions with empty search paths:

```sql
-- Create a function to safely get the current user ID
CREATE OR REPLACE FUNCTION public.get_auth_user_id()
RETURNS uuid
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT auth.uid();
$$;

-- Use in RLS policy
CREATE POLICY "Users can view their own data" 
ON public.user_data 
FOR SELECT 
USING (user_id = public.get_auth_user_id());
```

### 2. Multiple Permissive Policies

**Problem**:
Having multiple permissive policies for the same operation can lead to unexpected access.

**Solution**:
Use one policy per operation type or use restrictive policies:

```sql
-- Avoid having these two separate policies:
CREATE POLICY "Users can view their data" ON my_table FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all data" ON my_table FOR SELECT USING (is_admin(auth.uid()));

-- Instead, combine them:
CREATE POLICY "Data access policy" ON my_table FOR SELECT 
USING (user_id = auth.uid() OR is_admin(auth.uid()));
```

### 3. Unindexed Foreign Keys

**Problem**:
Foreign keys without indexes can cause performance issues, especially when used in RLS policies.

**Solution**:
Always add indexes to foreign key columns:

```sql
-- Add index to foreign key used in RLS
CREATE INDEX idx_table_user_id ON my_table(user_id);
```

## Security Definer Functions

### Why Use Security Definer Functions?

Security definer functions run with the privileges of the function creator, not the caller. This is essential for preventing SQL injection and securing access patterns.

### Best Practices for Security Definer Functions

1. **Always set an empty search path**:
   ```sql
   CREATE FUNCTION my_function()
   RETURNS void
   LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = ''  -- Critical for security
   AS $$
   BEGIN
     -- function body
   END;
   $$;
   ```

2. **Minimal privileges**: Grant only necessary privileges to the function owner.

3. **Input validation**: Always validate inputs to prevent SQL injection.

4. **Error handling**: Handle errors gracefully without exposing sensitive information.

## Standard RLS Pattern Template

Use this template for consistent and secure RLS policies:

```sql
-- 1. Create security definer function if needed (once per common operation)
CREATE OR REPLACE FUNCTION public.get_auth_user_id()
RETURNS uuid
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT auth.uid();
$$;

-- 2. Create a policy for SELECT operations
CREATE POLICY "Users can view their own data" 
ON public.my_table 
FOR SELECT 
USING (user_id = public.get_auth_user_id());

-- 3. Create a policy for INSERT operations
CREATE POLICY "Users can insert their own data" 
ON public.my_table 
FOR INSERT 
WITH CHECK (user_id = public.get_auth_user_id());

-- 4. Create a policy for UPDATE operations
CREATE POLICY "Users can update their own data" 
ON public.my_table 
FOR UPDATE 
USING (user_id = public.get_auth_user_id());

-- 5. Create a policy for DELETE operations
CREATE POLICY "Users can delete their own data" 
ON public.my_table 
FOR DELETE 
USING (user_id = public.get_auth_user_id());
```

## Testing RLS Policies

### Basic Testing Steps

1. **Turn on RLS**: Ensure RLS is enabled on the table.
   ```sql
   ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;
   ```

2. **Test as anonymous**: Test access without authentication.
   ```sql
   SET LOCAL ROLE anon;
   SELECT * FROM my_table;
   -- Should return only records allowed for anonymous users
   ```

3. **Test as authenticated user**: Test with specific user IDs.
   ```sql
   SET LOCAL ROLE authenticated;
   SET LOCAL "request.jwt.claims" TO '{"sub": "user-id-here"}';
   SELECT * FROM my_table;
   -- Should return only user's records
   ```

4. **Test edge cases**: Test NULL values, special characters, etc.

### Automated Policy Testing

Create a function to test policies:

```sql
CREATE OR REPLACE FUNCTION test_user_data_policies()
RETURNS TABLE (test_name text, success boolean, details text)
LANGUAGE plpgsql
AS $$
DECLARE
  test_user_id UUID := '11111111-1111-1111-1111-111111111111';
  test_admin_id UUID := '22222222-2222-2222-2222-222222222222';
  rec RECORD;
BEGIN
  -- Test 1: User should see only their own data
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claims" TO json_build_object('sub', test_user_id);
  
  FOR rec IN (SELECT * FROM user_data) LOOP
    IF rec.user_id <> test_user_id THEN
      RETURN QUERY SELECT 'User can only see their data', false, 
        'Found data for user_id: ' || rec.user_id;
      RETURN;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT 'User can only see their data', true, 'All checks passed';
  
  -- Test 2: Admin should see all data
  SET LOCAL "request.jwt.claims" TO json_build_object('sub', test_admin_id, 'role', 'admin');
  
  -- More tests here...
END;
$$;
```

## Common Mistakes to Avoid

1. **Direct calls to `auth.uid()`**: Always wrap in a security definer function.
2. **Missing indexes**: Always add indexes for columns used in RLS policies.
3. **Forgetting to enable RLS**: Always explicitly enable RLS on tables.
4. **Over-complicated policies**: Keep policies simple and focused.
5. **Not testing thoroughly**: Test all operations, roles, and edge cases.
6. **Using `OR current_setting('app.is_admin')` patterns**: Dangerous for security - use proper role-based policies.
7. **Inconsistent naming**: Use a consistent naming convention for policies.

## Troubleshooting

### Infinite Recursion Errors

When you see "infinite recursion detected in policy", it's often because a policy references the same table it's defined on:

```sql
-- BAD - causes recursion
CREATE POLICY "Admins can view all" ON users
FOR SELECT USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- GOOD - uses a function to prevent recursion
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

CREATE POLICY "Admins can view all" ON users
FOR SELECT USING (
  public.get_user_role() = 'admin'
);
```

### Performance Issues

If RLS policies are causing performance issues:

1. **Add indexes** to all columns used in RLS policies
2. **Simplify policies** to avoid complex logic
3. **Use caching** for frequently accessed data
4. **Monitor query plans** to identify bottlenecks

## Summary Checklist

- ✅ Use security definer functions with empty search paths
- ✅ Add indexes to all foreign keys and columns used in RLS policies
- ✅ Keep policies simple with one purpose per policy
- ✅ Test policies thoroughly with different roles and edge cases
- ✅ Use consistent naming for policies
- ✅ Enable RLS on all tables with sensitive data
- ✅ Avoid direct calls to `auth.uid()` and `current_setting()`
- ✅ Implement proper error handling
- ✅ Document your security model

Following these best practices will ensure secure, performant, and maintainable Row Level Security policies in your Supabase application.
