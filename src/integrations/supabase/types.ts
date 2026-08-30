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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_providers: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          model: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          model?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          model?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          alt_text: string | null
          created_at: string
          file_name: string
          file_type: string | null
          file_url: string
          id: string
          storage_path: string | null
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string | null
          content_type: string
          created_at: string
          excerpt: string | null
          featured: boolean
          featured_image_url: string | null
          featured_video_url: string | null
          id: string
          published_at: string | null
          slug: string
          status: string
          title: string
          tools: string[]
          updated_at: string
          views: number
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content?: string | null
          content_type?: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          featured_image_url?: string | null
          featured_video_url?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          tools?: string[]
          updated_at?: string
          views?: number
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string | null
          content_type?: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          featured_image_url?: string | null
          featured_video_url?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          tools?: string[]
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      prompt_steps: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          prompt_id: string
          step_number: number
          title: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          prompt_id: string
          step_number?: number
          title?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          prompt_id?: string
          step_number?: number
          title?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_steps_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_tools: {
        Row: {
          id: string
          prompt_id: string
          tool_name: string
          tool_url: string | null
        }
        Insert: {
          id?: string
          prompt_id: string
          tool_name: string
          tool_url?: string | null
        }
        Update: {
          id?: string
          prompt_id?: string
          tool_name?: string
          tool_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_tools_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          author_id: string | null
          category_id: string | null
          copy_count: number
          created_at: string
          difficulty: string
          estimated_time: string | null
          example_video_url: string | null
          featured: boolean
          featured_image_url: string | null
          id: string
          image_prompt: string | null
          image_prompts: Json
          is_image: boolean
          is_video: boolean
          negative_prompt: string | null
          prompt_blocks: Json
          prompt_type: string
          short_description: string | null
          slug: string
          status: string
          title: string
          tool_links: Json
          tool_name: string | null
          updated_at: string
          video_prompt: string | null
          video_prompts: Json
          views: number
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          copy_count?: number
          created_at?: string
          difficulty?: string
          estimated_time?: string | null
          example_video_url?: string | null
          featured?: boolean
          featured_image_url?: string | null
          id?: string
          image_prompt?: string | null
          image_prompts?: Json
          is_image?: boolean
          is_video?: boolean
          negative_prompt?: string | null
          prompt_blocks?: Json
          prompt_type?: string
          short_description?: string | null
          slug: string
          status?: string
          title: string
          tool_links?: Json
          tool_name?: string | null
          updated_at?: string
          video_prompt?: string | null
          video_prompts?: Json
          views?: number
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          copy_count?: number
          created_at?: string
          difficulty?: string
          estimated_time?: string | null
          example_video_url?: string | null
          featured?: boolean
          featured_image_url?: string | null
          id?: string
          image_prompt?: string | null
          image_prompts?: Json
          is_image?: boolean
          is_video?: boolean
          negative_prompt?: string | null
          prompt_blocks?: Json
          prompt_type?: string
          short_description?: string | null
          slug?: string
          status?: string
          title?: string
          tool_links?: Json
          tool_name?: string | null
          updated_at?: string
          video_prompt?: string | null
          video_prompts?: Json
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_generations: {
        Row: {
          aspect_ratio: string | null
          created_at: string
          duration: number | null
          error_message: string | null
          generated_video_url: string | null
          id: string
          input_image_url: string | null
          input_video_url: string | null
          model: string | null
          prompt: string
          provider: string
          provider_job_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          aspect_ratio?: string | null
          created_at?: string
          duration?: number | null
          error_message?: string | null
          generated_video_url?: string | null
          id?: string
          input_image_url?: string | null
          input_video_url?: string | null
          model?: string | null
          prompt: string
          provider: string
          provider_job_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          aspect_ratio?: string | null
          created_at?: string
          duration?: number | null
          error_message?: string | null
          generated_video_url?: string | null
          id?: string
          input_image_url?: string | null
          input_video_url?: string | null
          model?: string | null
          prompt?: string
          provider?: string
          provider_job_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
