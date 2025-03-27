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
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_assistant: boolean | null
          metadata: Json | null
          session_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_assistant?: boolean | null
          metadata?: Json | null
          session_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_assistant?: boolean | null
          metadata?: Json | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cleaning_schedules: {
        Row: {
          booking_id: string | null
          checklist: Json | null
          cleaner_contact: string | null
          cleaner_name: string | null
          completed_date: string | null
          cost: number | null
          created_at: string | null
          description: string | null
          id: string
          notes: string | null
          property_id: string
          recurrence_end_date: string | null
          recurring: boolean | null
          recurring_frequency: string | null
          scheduled_date: string
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          checklist?: Json | null
          cleaner_contact?: string | null
          cleaner_name?: string | null
          completed_date?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          property_id: string
          recurrence_end_date?: string | null
          recurring?: boolean | null
          recurring_frequency?: string | null
          scheduled_date: string
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_id?: string | null
          checklist?: Json | null
          cleaner_contact?: string | null
          cleaner_name?: string | null
          completed_date?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          property_id?: string
          recurrence_end_date?: string | null
          recurring?: boolean | null
          recurring_frequency?: string | null
          scheduled_date?: string
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cleaning_schedules_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "property_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cleaning_schedules_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      datex_document_metadata: {
        Row: {
          created_at: string | null
          id: string
          schema: string | null
          title: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          schema?: string | null
          title?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          schema?: string | null
          title?: string | null
          url?: string | null
        }
        Relationships: []
      }
      datex_document_rows: {
        Row: {
          dataset_id: string | null
          id: number
          row_data: Json | null
        }
        Insert: {
          dataset_id?: string | null
          id?: number
          row_data?: Json | null
        }
        Update: {
          dataset_id?: string | null
          id?: number
          row_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "datex_document_rows_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datex_document_metadata"
            referencedColumns: ["id"]
          },
        ]
      }
      datex_documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      errors: {
        Row: {
          created_at: string
          id: number
          message: string | null
          source: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          message?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          message?: string | null
          source?: string | null
        }
        Relationships: []
      }
      memory: {
        Row: {
          id: number
          memory: string
        }
        Insert: {
          id?: number
          memory: string
        }
        Update: {
          id?: number
          memory?: string
        }
        Relationships: []
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      pet_media: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_featured: boolean | null
          media_type: string
          pet_id: string
          storage_path: string
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          media_type: string
          pet_id: string
          storage_path: string
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          media_type?: string
          pet_id?: string
          storage_path?: string
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_media_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_profiles: {
        Row: {
          bio: string | null
          birth_date: string | null
          breed: string | null
          created_at: string
          death_date: string | null
          featured_media_url: string | null
          id: string
          likes_count: number | null
          memorial_message: string | null
          name: string
          species: string | null
          traits: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          death_date?: string | null
          featured_media_url?: string | null
          id?: string
          likes_count?: number | null
          memorial_message?: string | null
          name: string
          species?: string | null
          traits?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          death_date?: string | null
          featured_media_url?: string | null
          id?: string
          likes_count?: number | null
          memorial_message?: string | null
          name?: string
          species?: string | null
          traits?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pet_tributes: {
        Row: {
          author_name: string | null
          created_at: string
          id: string
          message: string
          pet_id: string
          user_id: string
        }
        Insert: {
          author_name?: string | null
          created_at?: string
          id?: string
          message: string
          pet_id: string
          user_id: string
        }
        Update: {
          author_name?: string | null
          created_at?: string
          id?: string
          message?: string
          pet_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_tributes_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          amenities: string[]
          bathrooms: number
          bedrooms: number
          created_at: string | null
          description: string | null
          id: string
          images: string[]
          name: string
          price: number
          price_unit: string
          property_type: string | null
          square_feet: number | null
          status: string
          updated_at: string | null
          user_id: string | null
          year_built: number | null
        }
        Insert: {
          address: string
          amenities?: string[]
          bathrooms: number
          bedrooms: number
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[]
          name: string
          price: number
          price_unit: string
          property_type?: string | null
          square_feet?: number | null
          status: string
          updated_at?: string | null
          user_id?: string | null
          year_built?: number | null
        }
        Update: {
          address?: string
          amenities?: string[]
          bathrooms?: number
          bedrooms?: number
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[]
          name?: string
          price?: number
          price_unit?: string
          property_type?: string | null
          square_feet?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          year_built?: number | null
        }
        Relationships: []
      }
      property_bookings: {
        Row: {
          check_in_date: string
          check_out_date: string
          created_at: string | null
          guest_email: string | null
          guest_name: string
          guest_phone: string | null
          id: string
          notes: string | null
          property_id: string | null
          status: string
          total_price: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          check_in_date: string
          check_out_date: string
          created_at?: string | null
          guest_email?: string | null
          guest_name: string
          guest_phone?: string | null
          id?: string
          notes?: string | null
          property_id?: string | null
          status: string
          total_price: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          check_in_date?: string
          check_out_date?: string
          created_at?: string | null
          guest_email?: string | null
          guest_name?: string
          guest_phone?: string | null
          id?: string
          notes?: string | null
          property_id?: string | null
          status?: string
          total_price?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_maintenance_tasks: {
        Row: {
          assigned_to: string | null
          cost: number | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string
          property_id: string | null
          receipt_url: string | null
          reported_date: string | null
          service_provider: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority: string
          property_id?: string | null
          receipt_url?: string | null
          reported_date?: string | null
          service_provider?: string | null
          status: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          property_id?: string | null
          receipt_url?: string | null
          reported_date?: string | null
          service_provider?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_maintenance_tasks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      reporter: {
        Row: {
          created_at: string
          id: number
          report_name: string | null
          summary: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          report_name?: string | null
          summary?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          report_name?: string | null
          summary?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          assertions: Json
          failure_reasons: Json | null
          id: number
          iteration: Json
          prerequest_scripts: Json
          report_date: string
          report_name: string
          requests: Json
          test_completion: string
          test_scripts: Json
        }
        Insert: {
          assertions: Json
          failure_reasons?: Json | null
          id?: number
          iteration: Json
          prerequest_scripts: Json
          report_date: string
          report_name: string
          requests: Json
          test_completion?: string
          test_scripts: Json
        }
        Update: {
          assertions?: Json
          failure_reasons?: Json | null
          id?: number
          iteration?: Json
          prerequest_scripts?: Json
          report_date?: string
          report_name?: string
          requests?: Json
          test_completion?: string
          test_scripts?: Json
        }
        Relationships: []
      }
      userchat_rag: {
        Row: {
          created_at: string | null
          id: string
          message: string
          response: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          response?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          response?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      webhook_configs: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          request_payload: Json | null
          response_payload: Json | null
          status: string
          webhook_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          request_payload?: Json | null
          response_payload?: Json | null
          status: string
          webhook_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          request_payload?: Json | null
          response_payload?: Json | null
          status?: string
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhook_configs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      get_page_parents: {
        Args: {
          page_id: number
        }
        Returns: {
          id: number
          parent_page_id: number
          path: string
          meta: Json
        }[]
      }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      match_documents: {
        Args: {
          query_embedding: string
          match_count?: number
          filter?: Json
        }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_page_sections: {
        Args: {
          embedding: string
          match_threshold: number
          match_count: number
          min_content_length: number
        }
        Returns: {
          id: number
          page_id: number
          slug: string
          heading: string
          content: string
          similarity: number
        }[]
      }
      scraped_documents: {
        Args: {
          query_embedding: string
          match_count?: number
          filter?: Json
        }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
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
