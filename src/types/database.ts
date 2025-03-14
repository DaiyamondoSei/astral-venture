
export interface Database {
  public: {
    Tables: {
      challenges: {
        Row: {
          category: string;
          created_at: string;
          description: string;
          duration_minutes: number;
          energy_points: number;
          id: string;
          level: number;
          title: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          description: string;
          duration_minutes: number;
          energy_points: number;
          id?: string;
          level: number;
          title: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: string;
          duration_minutes?: number;
          energy_points?: number;
          id?: string;
          level?: number;
          title?: string;
        };
        Relationships: [];
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          progress: number;
          awarded: boolean;
          awarded_at: string | null;
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
          awarded_at?: string | null;
          achievement_data?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          progress?: number;
          awarded?: boolean;
          awarded_at?: string | null;
          achievement_data?: any;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          }
        ];
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
          id?: string;
          created_at?: string;
          user_id?: string;
          content?: string;
          points_earned?: number;
          dominant_emotion?: string;
          emotional_depth?: number;
          chakras_activated?: any;
        };
        Relationships: [
          {
            foreignKeyName: "energy_reflections_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      user_profiles: {
        Row: {
          id: string;
          username: string | null;
          astral_level: number;
          energy_points: number;
          joined_at: string;
          last_active_at: string | null;
        };
        Insert: {
          id: string;
          username?: string | null;
          astral_level?: number;
          energy_points?: number;
          joined_at?: string;
          last_active_at?: string | null;
        };
        Update: {
          id?: string;
          username?: string | null;
          astral_level?: number;
          energy_points?: number;
          joined_at?: string;
          last_active_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {
      get_auth_user_id: {
        Args: Record<string, never>;
        Returns: string;
      };
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
    };
    Enums: {};
    CompositeTypes: {};
  };
}
