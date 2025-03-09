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
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
