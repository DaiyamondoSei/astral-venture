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
          content_type: string
          created_at: string
          description: string
          id: string
          level: number
          resource_url: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          chakra_alignment?: Json
          content_type: string
          created_at?: string
          description: string
          id?: string
          level: number
          resource_url: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          chakra_alignment?: Json
          content_type?: string
          created_at?: string
          description?: string
          id?: string
          level?: number
          resource_url?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      emotional_analysis: {
        Row: {
          analysis_data: Json
          created_at: string
          id: string
          reflection_id: string
          user_id: string
        }
        Insert: {
          analysis_data: Json
          created_at?: string
          id?: string
          reflection_id: string
          user_id: string
        }
        Update: {
          analysis_data?: Json
          created_at?: string
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
          content: string
          created_at: string
          id: string
          mood_rating: number
          tags: string[]
          title: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mood_rating: number
          tags?: string[]
          title: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mood_rating?: number
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
          user_id: string | null
          component_name: string
          average_render_time: number | null
          total_renders: number | null
          slow_renders: number | null
          metrics_data: Json | null
          session_id: string | null
          device_info: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          component_name: string
          average_render_time?: number | null
          total_renders?: number | null
          slow_renders?: number | null
          metrics_data?: Json | null
          session_id?: string | null
          device_info?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          component_name?: string
          average_render_time?: number | null
          total_renders?: number | null
          slow_renders?: number | null
          metrics_data?: Json | null
          session_id?: string | null
          device_info?: Json | null
          created_at?: string | null
          updated_at?: string | null
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
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string | null
          progress: number
          achievement_data: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string | null
          progress?: number
          achievement_data?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string | null
          progress?: number
          achievement_data?: Json | null
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
          id: string
          user_id: string
          activity_type: string
          activity_data: Json | null
          energy_points: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          activity_data: Json | null
          energy_points: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: string
          activity_data?: Json | null
          energy_points?: number
          created_at?: string
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
      user_profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          energy_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          energy_points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          energy_points?: number
          created_at?: string
          updated_at?: string
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
      user_streaks: {
        Row: {
          id: string
          user_id: string
          current_streak: number
          longest_streak: number
          last_practiced: string | null
          activated_chakras: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_streak?: number
          longest_streak?: number
          last_practiced?: string | null
          activated_chakras?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_streak?: number
          longest_streak?: number
          last_practiced?: string | null
          activated_chakras?: Json | null
          created_at?: string
          updated_at?: string
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
      add_energy_points: {
        Args: {
          user_id_param: string
          points_param: number
        }
        Returns: undefined
      }
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
