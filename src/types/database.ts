
export interface DatabaseSchema {
  Tables: {
    challenges: {
      Row: {
        id: string;
        title: string;
        description: string;
        duration_minutes: number;
        energy_points: number;
        level: number;
        category: string;
        created_at?: string;
      };
      Insert: {
        id?: string;
        title: string;
        description: string;
        duration_minutes: number;
        energy_points: number;
        level: number;
        category: string;
        created_at?: string;
      };
      Update: {
        id?: string;
        title?: string;
        description?: string;
        duration_minutes?: number;
        energy_points?: number;
        level?: number;
        category?: string;
      };
    };
    user_profiles: {
      Row: {
        id: string;
        username: string;
        astral_level: number;
        energy_points: number;
        joined_at: string;
        last_active_at: string;
      };
      Insert: {
        id: string;
        username: string;
        astral_level?: number;
        energy_points?: number;
        joined_at?: string;
        last_active_at?: string;
      };
      Update: {
        username?: string;
        astral_level?: number;
        energy_points?: number;
        last_active_at?: string;
      };
    };
    user_achievements: {
      Row: {
        id: string;
        user_id: string;
        achievement_id: string;
        progress: number;
        awarded: boolean;
        awarded_at: string;
        achievement_data: any;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        user_id: string;
        achievement_id: string;
        progress?: number;
        awarded?: boolean;
        awarded_at?: string;
        achievement_data?: any;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        progress?: number;
        awarded?: boolean;
        awarded_at?: string;
        achievement_data?: any;
        updated_at?: string;
      };
    };
    energy_reflections: {
      Row: {
        id: string;
        created_at: string;
        user_id: string;
        content: string;
        points_earned: number;
        dominant_emotion?: string;
        emotional_depth?: number;
        chakras_activated?: any;
      };
      Insert: {
        id?: string;
        created_at?: string;
        user_id: string;
        content: string;
        points_earned?: number;
        dominant_emotion?: string;
        emotional_depth?: number;
        chakras_activated?: any;
      };
      Update: {
        content?: string;
        points_earned?: number;
        dominant_emotion?: string;
        emotional_depth?: number;
        chakras_activated?: any;
      };
    };
    quantum_downloads: {
      Row: {
        id: string;
        title: string;
        content: string;
        level: number;
        category: string;
        created_at?: string;
      };
      Insert: {
        id?: string;
        title: string;
        content: string;
        level: number;
        category: string;
        created_at?: string;
      };
      Update: {
        title?: string;
        content?: string;
        level?: number;
        category?: string;
      };
    };
    user_progress: {
      Row: {
        id: string;
        user_id: string;
        challenge_id: string;
        category: string;
        completed_at?: string;
        created_at?: string;
      };
      Insert: {
        id?: string;
        user_id: string;
        challenge_id: string;
        category: string;
        completed_at?: string;
        created_at?: string;
      };
      Update: {
        completed_at?: string;
      };
    };
    user_preferences: {
      Row: {
        id: string;
        user_id: string;
        preferences: any;
        created_at?: string;
        updated_at?: string;
      };
      Insert: {
        id?: string;
        user_id: string;
        preferences: any;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        preferences?: any;
        updated_at?: string;
      };
    };
    dreams: {
      Row: {
        id: string;
        user_id: string;
        title: string;
        description: string;
        dream_date: string;
        emotions: string[];
        symbols: string[];
        energy_impact: number;
        chakra_associations: string[];
        created_at?: string;
        updated_at?: string;
      };
      Insert: {
        id?: string;
        user_id: string;
        title: string;
        description: string;
        dream_date: string;
        emotions?: string[];
        symbols?: string[];
        energy_impact?: number;
        chakra_associations?: string[];
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        title?: string;
        description?: string;
        dream_date?: string;
        emotions?: string[];
        symbols?: string[];
        energy_impact?: number;
        chakra_associations?: string[];
        updated_at?: string;
      };
    };
  };
  Views: {};
  Functions: {
    increment_points: {
      Args: {
        row_id: string;
        points_to_add: number;
      };
      Returns: number;
    };
    get_total_points: {
      Args: {
        user_id_param: string;
      };
      Returns: number;
    };
    get_auth_user_id: {
      Args: Record<string, never>;
      Returns: string;
    };
  };
  Enums: {};
  CompositeTypes: {};
}

// Helper types
export type Tables = DatabaseSchema['Tables'];
export type TableName = keyof Tables;
export type Row<T extends TableName> = Tables[T]['Row'];
export type Insert<T extends TableName> = Tables[T]['Insert'];
export type Update<T extends TableName> = Tables[T]['Update'];

// Common database entities
export type Challenge = Row<'challenges'>;
export type UserProfile = Row<'user_profiles'>;
export type UserAchievement = Row<'user_achievements'>;
export type EnergyReflection = Row<'energy_reflections'>;
export type QuantumDownload = Row<'quantum_downloads'>;
export type UserProgress = Row<'user_progress'>;
export type UserPreferences = Row<'user_preferences'>;
export type Dream = Row<'dreams'>;
