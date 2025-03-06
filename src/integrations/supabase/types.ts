export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      challenges: {
        Row: {
          category: string
          created_at: string
          description: string
          duration_minutes: number | null
          energy_points: number
          id: string
          level: number
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          duration_minutes?: number | null
          energy_points?: number
          id?: string
          level?: number
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          duration_minutes?: number | null
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
          chakra_alignment: Json | null
          created_at: string
          emotional_resonance: Json | null
          id: string
          recommendation_reason: string | null
          relevance_score: number
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          category: string
          chakra_alignment?: Json | null
          created_at?: string
          emotional_resonance?: Json | null
          id?: string
          recommendation_reason?: string | null
          relevance_score?: number
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          category?: string
          chakra_alignment?: Json | null
          created_at?: string
          emotional_resonance?: Json | null
          id?: string
          recommendation_reason?: string | null
          relevance_score?: number
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      emotional_analysis: {
        Row: {
          analysis_data: Json
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          analysis_data: Json
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          analysis_data?: Json
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      energy_reflections: {
        Row: {
          chakras_activated: Json | null
          content: string
          created_at: string
          dominant_emotion: string | null
          emotional_depth: number | null
          id: string
          points_earned: number
          user_id: string
        }
        Insert: {
          chakras_activated?: Json | null
          content: string
          created_at?: string
          dominant_emotion?: string | null
          emotional_depth?: number | null
          id?: string
          points_earned?: number
          user_id: string
        }
        Update: {
          chakras_activated?: Json | null
          content?: string
          created_at?: string
          dominant_emotion?: string | null
          emotional_depth?: number | null
          id?: string
          points_earned?: number
          user_id?: string
        }
        Relationships: []
      }
      personalization_metrics: {
        Row: {
          chakra_balance_improvement: number
          content_relevance_rating: number
          created_at: string
          emotional_growth_rate: number
          engagement_score: number
          id: string
          progress_acceleration: number
          updated_at: string
          user_id: string
        }
        Insert: {
          chakra_balance_improvement?: number
          content_relevance_rating?: number
          created_at?: string
          emotional_growth_rate?: number
          engagement_score?: number
          id?: string
          progress_acceleration?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          chakra_balance_improvement?: number
          content_relevance_rating?: number
          created_at?: string
          emotional_growth_rate?: number
          engagement_score?: number
          id?: string
          progress_acceleration?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quantum_downloads: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          level: number
          title: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          level?: number
          title: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          level?: number
          title?: string
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          activity_type: string
          chakras_activated: Json | null
          completion_rate: number | null
          duration: number | null
          emotional_response: Json | null
          id: string
          metadata: Json | null
          timestamp: string
          user_id: string
        }
        Insert: {
          activity_type: string
          chakras_activated?: Json | null
          completion_rate?: number | null
          duration?: number | null
          emotional_response?: Json | null
          id?: string
          metadata?: Json | null
          timestamp?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          chakras_activated?: Json | null
          completion_rate?: number | null
          duration?: number | null
          emotional_response?: Json | null
          id?: string
          metadata?: Json | null
          timestamp?: string
          user_id?: string
        }
        Relationships: []
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
          preferences?: Json
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
        Relationships: []
      }
      user_profiles: {
        Row: {
          astral_level: number
          energy_points: number
          id: string
          joined_at: string
          last_active_at: string | null
          username: string | null
        }
        Insert: {
          astral_level?: number
          energy_points?: number
          id: string
          joined_at?: string
          last_active_at?: string | null
          username?: string | null
        }
        Update: {
          astral_level?: number
          energy_points?: number
          id?: string
          joined_at?: string
          last_active_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          category: string
          challenge_id: string
          completed_at: string
          id: string
          reflection: string | null
          user_id: string
        }
        Insert: {
          category: string
          challenge_id: string
          completed_at?: string
          id?: string
          reflection?: string | null
          user_id: string
        }
        Update: {
          category?: string
          challenge_id?: string
          completed_at?: string
          id?: string
          reflection?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          user_id: string
        }
        Insert: {
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          user_id: string
        }
        Update: {
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          user_id?: string
        }
        Relationships: []
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
