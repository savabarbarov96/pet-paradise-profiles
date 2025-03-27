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
      user_notification_preferences: {
        Row: {
          id: string
          user_id: string
          email_frequency: 'daily' | 'weekly' | 'never'
          notify_new_stories: boolean
          notify_comments: boolean
          notify_system_updates: boolean
          last_notification_sent?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_frequency?: 'daily' | 'weekly' | 'never'
          notify_new_stories?: boolean
          notify_comments?: boolean
          notify_system_updates?: boolean
          last_notification_sent?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_frequency?: 'daily' | 'weekly' | 'never'
          notify_new_stories?: boolean
          notify_comments?: boolean
          notify_system_updates?: boolean
          last_notification_sent?: string
          created_at?: string
          updated_at?: string
        }
      }
      // Add other tables as needed
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
  }
} 