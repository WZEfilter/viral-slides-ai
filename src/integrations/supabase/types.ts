export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          generation_id: string | null
          id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          generation_id?: string | null
          id?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          generation_id?: string | null
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "generation_history"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_history: {
        Row: {
          caption: string | null
          content_urls: string[] | null
          created_at: string
          credits_refunded: number
          credits_used: number
          error_message: string | null
          expanded_prompt: string | null
          expires_at: string
          id: string
          is_playground: boolean
          original_prompt: string
          scenario_id: string | null
          status: string
          target_accounts: Json | null
          thumbnail_url: string | null
          type: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          content_urls?: string[] | null
          created_at?: string
          credits_refunded?: number
          credits_used?: number
          error_message?: string | null
          expanded_prompt?: string | null
          expires_at?: string
          id?: string
          is_playground?: boolean
          original_prompt: string
          scenario_id?: string | null
          status?: string
          target_accounts?: Json | null
          thumbnail_url?: string | null
          type: string
          user_id: string
        }
        Update: {
          caption?: string | null
          content_urls?: string[] | null
          created_at?: string
          credits_refunded?: number
          credits_used?: number
          error_message?: string | null
          expanded_prompt?: string | null
          expires_at?: string
          id?: string
          is_playground?: boolean
          original_prompt?: string
          scenario_id?: string | null
          status?: string
          target_accounts?: Json | null
          thumbnail_url?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generation_history_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          credits_balance: number
          id: string
          subscription_plan: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits_balance?: number
          id: string
          subscription_plan?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits_balance?: number
          id?: string
          subscription_plan?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      scenarios: {
        Row: {
          ai_model: string
          created_at: string
          custom_thumbnail_url: string | null
          id: string
          image_count: number | null
          next_run_at: string | null
          privacy: string
          prompt: string
          schedule_days: string[] | null
          schedule_time: string
          schedule_type: string
          status: string
          target_accounts: string[]
          timezone: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_model: string
          created_at?: string
          custom_thumbnail_url?: string | null
          id?: string
          image_count?: number | null
          next_run_at?: string | null
          privacy: string
          prompt: string
          schedule_days?: string[] | null
          schedule_time: string
          schedule_type: string
          status?: string
          target_accounts: string[]
          timezone?: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_model?: string
          created_at?: string
          custom_thumbnail_url?: string | null
          id?: string
          image_count?: number | null
          next_run_at?: string | null
          privacy?: string
          prompt?: string
          schedule_days?: string[] | null
          schedule_time?: string
          schedule_type?: string
          status?: string
          target_accounts?: string[]
          timezone?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tiktok_connections: {
        Row: {
          access_token: string
          avatar_url: string | null
          created_at: string
          daily_post_count: number
          id: string
          last_reset_date: string
          refresh_token: string
          token_expires_at: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          access_token: string
          avatar_url?: string | null
          created_at?: string
          daily_post_count?: number
          id?: string
          last_reset_date?: string
          refresh_token: string
          token_expires_at: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          access_token?: string
          avatar_url?: string | null
          created_at?: string
          daily_post_count?: number
          id?: string
          last_reset_date?: string
          refresh_token?: string
          token_expires_at?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_expired_history: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_tiktok_counters: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
