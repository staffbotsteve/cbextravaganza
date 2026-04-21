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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          body: string | null
          contact_id: string | null
          created_at: string
          direction: string | null
          id: string
          logged_by: string | null
          occurred_at: string | null
          org_id: string
          subject: string | null
          type: string | null
        }
        Insert: {
          body?: string | null
          contact_id?: string | null
          created_at?: string
          direction?: string | null
          id?: string
          logged_by?: string | null
          occurred_at?: string | null
          org_id: string
          subject?: string | null
          type?: string | null
        }
        Update: {
          body?: string | null
          contact_id?: string | null
          created_at?: string
          direction?: string | null
          id?: string
          logged_by?: string | null
          occurred_at?: string | null
          org_id?: string
          subject?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          cb_connection: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          is_primary: boolean | null
          last_name: string | null
          org_id: string | null
          phone: string | null
        }
        Insert: {
          cb_connection?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          is_primary?: boolean | null
          last_name?: string | null
          org_id?: string | null
          phone?: string | null
        }
        Update: {
          cb_connection?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          is_primary?: boolean | null
          last_name?: string | null
          org_id?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          file_url: string | null
          id: string
          org_id: string
          sent_at: string | null
          signed_at: string | null
          status: string | null
          type: string | null
          year: number | null
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          id?: string
          org_id: string
          sent_at?: string | null
          signed_at?: string | null
          status?: string | null
          type?: string | null
          year?: number | null
        }
        Update: {
          created_at?: string
          file_url?: string | null
          id?: string
          org_id?: string
          sent_at?: string | null
          signed_at?: string | null
          status?: string | null
          type?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          state: string | null
          temp_id: number | null
          type: string | null
          updated_at: string
          website: string | null
          zip: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          state?: string | null
          temp_id?: number | null
          type?: string | null
          updated_at?: string
          website?: string | null
          zip?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          state?: string | null
          temp_id?: number | null
          type?: string | null
          updated_at?: string
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      participation: {
        Row: {
          booth_zone: string | null
          cb_solicitor: string | null
          created_at: string
          donate_only: boolean | null
          electric: boolean | null
          id: string
          in_slideshow: boolean | null
          org_id: string
          other_beverage_quantity: string | null
          owner_name: string | null
          parking_qty: number | null
          payment_amount: number | null
          payment_method: string | null
          payment_status: string | null
          preferred_venue: string | null
          product_description: string | null
          representatives: string[] | null
          role: string | null
          sponsor_tier: string | null
          sponsor_value: number | null
          status: string | null
          tent: boolean | null
          tickets_qty: number | null
          updated_at: string
          vendor_type: string | null
          volunteers_needed: number | null
          wine_quantity: string | null
          year: number
        }
        Insert: {
          booth_zone?: string | null
          cb_solicitor?: string | null
          created_at?: string
          donate_only?: boolean | null
          electric?: boolean | null
          id?: string
          in_slideshow?: boolean | null
          org_id: string
          other_beverage_quantity?: string | null
          owner_name?: string | null
          parking_qty?: number | null
          payment_amount?: number | null
          payment_method?: string | null
          payment_status?: string | null
          preferred_venue?: string | null
          product_description?: string | null
          representatives?: string[] | null
          role?: string | null
          sponsor_tier?: string | null
          sponsor_value?: number | null
          status?: string | null
          tent?: boolean | null
          tickets_qty?: number | null
          updated_at?: string
          vendor_type?: string | null
          volunteers_needed?: number | null
          wine_quantity?: string | null
          year: number
        }
        Update: {
          booth_zone?: string | null
          cb_solicitor?: string | null
          created_at?: string
          donate_only?: boolean | null
          electric?: boolean | null
          id?: string
          in_slideshow?: boolean | null
          org_id?: string
          other_beverage_quantity?: string | null
          owner_name?: string | null
          parking_qty?: number | null
          payment_amount?: number | null
          payment_method?: string | null
          payment_status?: string | null
          preferred_venue?: string | null
          product_description?: string | null
          representatives?: string[] | null
          role?: string | null
          sponsor_tier?: string | null
          sponsor_value?: number | null
          status?: string | null
          tent?: boolean | null
          tickets_qty?: number | null
          updated_at?: string
          vendor_type?: string | null
          volunteers_needed?: number | null
          wine_quantity?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "participation_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsors: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          amount_paid: number | null
          city: string | null
          company_name: string
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          in_slideshow: boolean | null
          level_2022: string | null
          level_2023: string | null
          level_2024: string | null
          notes: string | null
          parking_qty: number | null
          payment_status: string | null
          phone: string | null
          solicitor: string | null
          sponsorship_label: string | null
          sponsorship_level: string
          state: string | null
          status: string | null
          ticket_qty: number | null
          updated_at: string
          value: number | null
          zip: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          amount_paid?: number | null
          city?: string | null
          company_name: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          in_slideshow?: boolean | null
          level_2022?: string | null
          level_2023?: string | null
          level_2024?: string | null
          notes?: string | null
          parking_qty?: number | null
          payment_status?: string | null
          phone?: string | null
          solicitor?: string | null
          sponsorship_label?: string | null
          sponsorship_level?: string
          state?: string | null
          status?: string | null
          ticket_qty?: number | null
          updated_at?: string
          value?: number | null
          zip?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          amount_paid?: number | null
          city?: string | null
          company_name?: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          in_slideshow?: boolean | null
          level_2022?: string | null
          level_2023?: string | null
          level_2024?: string | null
          notes?: string | null
          parking_qty?: number | null
          payment_status?: string | null
          phone?: string | null
          solicitor?: string | null
          sponsorship_label?: string | null
          sponsorship_level?: string
          state?: string | null
          status?: string | null
          ticket_qty?: number | null
          updated_at?: string
          value?: number | null
          zip?: string | null
        }
        Relationships: []
      }
      sponsorship_levels: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          parking_included: number
          remaining_available: number
          sort_order: number
          tickets_included: number
          total_available: number
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          parking_included?: number
          remaining_available?: number
          sort_order?: number
          tickets_included?: number
          total_available?: number
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parking_included?: number
          remaining_available?: number
          sort_order?: number
          tickets_included?: number
          total_available?: number
          updated_at?: string
        }
        Relationships: []
      }
      ticket_inventory: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          label: string
          price_cents: number
          remaining_available: number
          sort_order: number
          stripe_price_id: string
          ticket_type: string
          total_available: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          price_cents: number
          remaining_available?: number
          sort_order?: number
          stripe_price_id: string
          ticket_type: string
          total_available?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          price_cents?: number
          remaining_available?: number
          sort_order?: number
          stripe_price_id?: string
          ticket_type?: string
          total_available?: number
          updated_at?: string
        }
        Relationships: []
      }
      ticket_purchases: {
        Row: {
          created_at: string
          donation_amount: number | null
          email: string | null
          general_qty: number
          id: string
          parking_qty: number
          payment_status: string
          stripe_session_id: string | null
          total_cents: number
          updated_at: string
          vip_qty: number
        }
        Insert: {
          created_at?: string
          donation_amount?: number | null
          email?: string | null
          general_qty?: number
          id?: string
          parking_qty?: number
          payment_status?: string
          stripe_session_id?: string | null
          total_cents?: number
          updated_at?: string
          vip_qty?: number
        }
        Update: {
          created_at?: string
          donation_amount?: number | null
          email?: string | null
          general_qty?: number
          id?: string
          parking_qty?: number
          payment_status?: string
          stripe_session_id?: string | null
          total_cents?: number
          updated_at?: string
          vip_qty?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          company_name: string
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          location_preference: string | null
          needs_electricity: boolean | null
          needs_tent: boolean | null
          notes: string | null
          past_participation: string | null
          phone: string | null
          solicited_for_auction: string | null
          solicitor: string | null
          state: string | null
          status: string | null
          updated_at: string
          vendor_type: string
          volunteers_needed: number | null
          zip: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company_name: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          location_preference?: string | null
          needs_electricity?: boolean | null
          needs_tent?: boolean | null
          notes?: string | null
          past_participation?: string | null
          phone?: string | null
          solicited_for_auction?: string | null
          solicitor?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          vendor_type: string
          volunteers_needed?: number | null
          zip?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company_name?: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          location_preference?: string | null
          needs_electricity?: boolean | null
          needs_tent?: boolean | null
          notes?: string | null
          past_participation?: string | null
          phone?: string | null
          solicited_for_auction?: string | null
          solicitor?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          vendor_type?: string
          volunteers_needed?: number | null
          zip?: string | null
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
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
