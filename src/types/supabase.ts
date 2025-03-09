
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      challenges: {
        Row: {
          category: string
          created_at: string
          description: string
          duration_minutes: number
          energy_points: number
          id: string
          level: number
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          duration_minutes: number
          energy_points: number
          id?: string
          level: number
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          duration_minutes?: number
          energy_points?: number
          id?: string
          level?: number
          title?: string
        }
        Relationships: []
      }
      content_library: {
        Row: {
          category: string
          chakra_alignment: Json
          content_text: string
          content_type: string
          created_at: string
          id: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          chakra_alignment?: Json
          content_text: string
          content_type: string
          created_at?: string
          id?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          chakra_alignment?: Json
          content_text?: string
          content_type?: string
          created_at?: string
          id?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      emotional_analysis: {
        Row: {
          chakra_balance: Json
          created_at: string
          emotional_patterns: Json
          id: string
          reflection_id: string
          user_id: string
        }
        Insert: {
          chakra_balance: Json
          created_at?: string
          emotional_patterns: Json
          id?: string
          reflection_id: string
          user_id: string
        }
        Update: {
          chakra_balance?: Json
          created_at?: string
          emotional_patterns?: Json
          id?: string
          reflection_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emotional_analysis_reflection_id_fkey"
            columns: ["reflection_id"]
            referencedRelation: "energy_reflections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emotional_analysis_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      energy_reflections: {
        Row: {
          created_at: string
          energy_level: number
          energy_points: number
          id: string
          reflection_text: string
          tags: string[]
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          energy_level?: number
          energy_points?: number
          id?: string
          reflection_text: string
          tags?: string[]
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          energy_level?: number
          energy_points?: number
          id?: string
          reflection_text?: string
          tags?: string[]
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "energy_reflections_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      performance_metrics: {
        Row: {
          id: string
          user_id: string
          session_id: string
          component_name: string
          average_render_time: number
          total_renders: number
          slow_renders: number
          device_info: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id: string
          component_name: string
          average_render_time: number
          total_renders: number
          slow_renders: number
          device_info: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string
          component_name?: string
          average_render_time?: number
          total_renders?: number
          slow_renders?: number
          device_info?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_metrics_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      personalization_metrics: {
        Row: {
          created_at: string
          id: string
          metric_data: Json
          metric_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_data: Json
          metric_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_data?: Json
          metric_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personalization_metrics_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      quantum_downloads: {
        Row: {
          chakra_alignment: Json
          created_at: string
          download_count: number
          energy_requirement: number
          file_path: string
          id: string
          tags: string[]
          title: string
        }
        Insert: {
          chakra_alignment?: Json
          created_at?: string
          download_count?: number
          energy_requirement: number
          file_path: string
          id?: string
          tags?: string[]
          title: string
        }
        Update: {
          chakra_alignment?: Json
          created_at?: string
          download_count?: number
          energy_requirement?: number
          file_path?: string
          id?: string
          tags?: string[]
          title?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          achievement_data: Json
          progress: number
          unlocked_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          achievement_data: Json
          progress: number
          unlocked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          achievement_data?: Json
          progress?: number
          unlocked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_activities: {
        Row: {
          activity_data: Json
          activity_type: string
          created_at: string
          energy_points: number
          id: string
          user_id: string
        }
        Insert: {
          activity_data?: Json
          activity_type: string
          created_at?: string
          energy_points?: number
          id?: string
          user_id: string
        }
        Update: {
          activity_data?: Json
          activity_type?: string
          created_at?: string
          energy_points?: number
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          preferences: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          preferences: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          preferences?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          astral_level: number
          avatar_url: string | null
          bio: string | null
          created_at: string
          energy_points: number
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          astral_level?: number
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          energy_points?: number
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          astral_level?: number
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          energy_points?: number
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_progress: {
        Row: {
          category: string
          chakra: number | null
          created_at: string
          id: string
          progress_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          chakra?: number | null
          created_at?: string
          id?: string
          progress_data: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          chakra?: number | null
          created_at?: string
          id?: string
          progress_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          last_activity_date: string | null
          longest_streak: number
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          last_activity_date?: string | null
          longest_streak?: number
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          last_activity_date?: string | null
          longest_streak?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_streaks_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Relationships<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Relationships']
