
/**
 * Shared Database Utilities for Edge Functions
 */
import { getSupabaseAdmin } from "./authUtils.ts";
import { logEvent } from "./responseUtils.ts";

// Create a type-safe database query wrapper
export async function executeQuery<T = any>(
  tableName: string,
  operation: "select" | "insert" | "update" | "delete" | "upsert",
  options: {
    select?: string;
    match?: Record<string, any>;
    data?: Record<string, any> | Record<string, any>[];
    order?: Record<string, "asc" | "desc">;
    limit?: number;
    single?: boolean;
    returning?: boolean | string;
  } = {}
): Promise<{ data: T | null; error: any }> {
  try {
    const supabase = getSupabaseAdmin();
    let query = supabase.from(tableName);
    
    if (operation === "select") {
      query = query.select(options.select || "*");
      
      if (options.match) {
        Object.entries(options.match).forEach(([column, value]) => {
          query = query.eq(column, value);
        });
      }
      
      if (options.order) {
        Object.entries(options.order).forEach(([column, direction]) => {
          query = query.order(column, { ascending: direction === "asc" });
        });
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.single) {
        return await query.maybeSingle();
      }
      
      return await query;
    }
    
    if (operation === "insert") {
      if (!options.data) {
        throw new Error("Data is required for insert operation");
      }
      
      const insertQuery = query.insert(options.data);
      
      if (options.returning) {
        return await insertQuery.select(options.returning === true ? "*" : options.returning);
      }
      
      return await insertQuery;
    }
    
    if (operation === "update") {
      if (!options.data) {
        throw new Error("Data is required for update operation");
      }
      
      if (!options.match) {
        throw new Error("Match conditions are required for update operation");
      }
      
      let updateQuery = query.update(options.data);
      
      Object.entries(options.match).forEach(([column, value]) => {
        updateQuery = updateQuery.eq(column, value);
      });
      
      if (options.returning) {
        return await updateQuery.select(options.returning === true ? "*" : options.returning);
      }
      
      return await updateQuery;
    }
    
    if (operation === "delete") {
      if (!options.match) {
        throw new Error("Match conditions are required for delete operation");
      }
      
      let deleteQuery = query.delete();
      
      Object.entries(options.match).forEach(([column, value]) => {
        deleteQuery = deleteQuery.eq(column, value);
      });
      
      if (options.returning) {
        return await deleteQuery.select(options.returning === true ? "*" : options.returning);
      }
      
      return await deleteQuery;
    }
    
    if (operation === "upsert") {
      if (!options.data) {
        throw new Error("Data is required for upsert operation");
      }
      
      const upsertQuery = query.upsert(options.data);
      
      if (options.returning) {
        return await upsertQuery.select(options.returning === true ? "*" : options.returning);
      }
      
      return await upsertQuery;
    }
    
    throw new Error(`Unsupported operation: ${operation}`);
  } catch (error) {
    logEvent("error", `Database error in ${operation} operation on ${tableName}`, { error });
    return { data: null, error };
  }
}

// Function to safely parse JSON data
export function safeParseJson<T>(jsonString: string | null, defaultValue: T): T {
  if (!jsonString) return defaultValue;
  
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    logEvent("error", "Error parsing JSON", { error, jsonString });
    return defaultValue;
  }
}

// Function to safely handle database values
export function safeGetValue<T>(
  data: Record<string, any> | null,
  key: string,
  defaultValue: T
): T {
  if (!data) return defaultValue;
  
  const value = data[key];
  if (value === undefined || value === null) return defaultValue;
  
  return value as T;
}
