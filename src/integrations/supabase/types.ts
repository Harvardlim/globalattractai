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
      admin_platform_access: {
        Row: {
          created_at: string
          id: string
          platform_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform_name?: string
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          selected_options: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          selected_options?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          selected_options?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      category_settings: {
        Row: {
          category_order: string[]
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_order?: string[]
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category_order?: string[]
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_conversations: {
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
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          mentioned_client_ids: string[] | null
          mentioned_consultation_ids: string[] | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          mentioned_client_ids?: string[] | null
          mentioned_consultation_ids?: string[] | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          mentioned_client_ids?: string[] | null
          mentioned_consultation_ids?: string[] | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_reports: {
        Row: {
          client_id: string
          created_at: string
          id: string
          is_paid: boolean
          payment_amount: number
          payment_currency: string
          report_content: string
          report_sections: Json
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          is_paid?: boolean
          payment_amount?: number
          payment_currency?: string
          report_content?: string
          report_sections?: Json
          status?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          is_paid?: boolean
          payment_amount?: number
          payment_currency?: string
          report_content?: string
          report_sections?: Json
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          birth_date: string
          birth_hour: number | null
          birth_minute: number
          category: string | null
          created_at: string
          gender: string
          id: string
          name: string
          notes: string | null
          phone_number: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          birth_date: string
          birth_hour?: number | null
          birth_minute?: number
          category?: string | null
          created_at?: string
          gender: string
          id?: string
          name: string
          notes?: string | null
          phone_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          birth_date?: string
          birth_hour?: number | null
          birth_minute?: number
          category?: string | null
          created_at?: string
          gender?: string
          id?: string
          name?: string
          notes?: string | null
          phone_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      consultations: {
        Row: {
          chart_data: Json
          chart_date: string
          chart_type: string
          client_id: string
          created_at: string
          id: string
          mentioned_client_ids: string[] | null
          title: string | null
          topic: string | null
          user_id: string | null
        }
        Insert: {
          chart_data: Json
          chart_date: string
          chart_type: string
          client_id: string
          created_at?: string
          id?: string
          mentioned_client_ids?: string[] | null
          title?: string | null
          topic?: string | null
          user_id?: string | null
        }
        Update: {
          chart_data?: Json
          chart_date?: string
          chart_type?: string
          client_id?: string
          created_at?: string
          id?: string
          mentioned_client_ids?: string[] | null
          title?: string | null
          topic?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_usages: {
        Row: {
          coupon_id: string
          id: string
          used_at: string
          user_id: string
        }
        Insert: {
          coupon_id: string
          id?: string
          used_at?: string
          user_id: string
        }
        Update: {
          coupon_id?: string
          id?: string
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usages_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          min_order_amount: number
          starts_at: string | null
          updated_at: string
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_type?: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_amount?: number
          starts_at?: string | null
          updated_at?: string
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_amount?: number
          starts_at?: string | null
          updated_at?: string
          used_count?: number
        }
        Relationships: []
      }
      energy_analyses: {
        Row: {
          analysis_data: Json
          client_id: string | null
          created_at: string
          id: string
          input_number: string
          title: string | null
          user_id: string
        }
        Insert: {
          analysis_data: Json
          client_id?: string | null
          created_at?: string
          id?: string
          input_number: string
          title?: string | null
          user_id: string
        }
        Update: {
          analysis_data?: Json
          client_id?: string | null
          created_at?: string
          id?: string
          input_number?: string
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      feature_controls: {
        Row: {
          admin_bypass: boolean
          created_at: string
          disabled_message: string
          disabled_platforms: string[]
          feature_key: string
          feature_name: string
          id: string
          is_globally_disabled: boolean
          updated_at: string
        }
        Insert: {
          admin_bypass?: boolean
          created_at?: string
          disabled_message?: string
          disabled_platforms?: string[]
          feature_key: string
          feature_name: string
          id?: string
          is_globally_disabled?: boolean
          updated_at?: string
        }
        Update: {
          admin_bypass?: boolean
          created_at?: string
          disabled_message?: string
          disabled_platforms?: string[]
          feature_key?: string
          feature_name?: string
          id?: string
          is_globally_disabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      feature_whitelist: {
        Row: {
          created_at: string
          enabled: boolean
          feature_key: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          feature_key: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          feature_key?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      interpretations: {
        Row: {
          consultation_id: string
          content: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          consultation_id: string
          content: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          consultation_id?: string
          content?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "interpretations_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_orders: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string
          currency: string
          duration_months: number
          id: string
          status: string
          tier: string
          user_id: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          currency?: string
          duration_months?: number
          id?: string
          status?: string
          tier: string
          user_id: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          currency?: string
          duration_months?: number
          id?: string
          status?: string
          tier?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          selected_options: Json | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          selected_options?: Json | null
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          selected_options?: Json | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency: string
          id: string
          notes: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          status?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platforms: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          product_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          product_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          created_at: string
          id: string
          option_label: string
          option_values: string[]
          product_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          option_label: string
          option_values?: string[]
          product_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          option_label?: string
          option_values?: string[]
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string
          id: string
          option_values: Json
          product_id: string
          quantity: number
          sku: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_values?: Json
          product_id: string
          quantity?: number
          sku?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          option_values?: Json
          product_id?: string
          quantity?: number
          sku?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          bundle_quantity: number
          category: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_bundle: boolean
          is_digital: boolean
          max_per_customer: number | null
          name: string
          price: number
          quantity: number
          selling_price: number | null
          sku: string | null
          summary: string | null
          updated_at: string
          weight_kg: number
        }
        Insert: {
          bundle_quantity?: number
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_bundle?: boolean
          is_digital?: boolean
          max_per_customer?: number | null
          name: string
          price: number
          quantity?: number
          selling_price?: number | null
          sku?: string | null
          summary?: string | null
          updated_at?: string
          weight_kg?: number
        }
        Update: {
          bundle_quantity?: number
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_bundle?: boolean
          is_digital?: boolean
          max_per_customer?: number | null
          name?: string
          price?: number
          quantity?: number
          selling_price?: number | null
          sku?: string | null
          summary?: string | null
          updated_at?: string
          weight_kg?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birth_date: string | null
          birth_hour: number | null
          birth_minute: number | null
          created_at: string
          display_name: string | null
          email: string | null
          gender: string | null
          id: string
          is_frozen: boolean
          last_login_at: string | null
          member_tier: Database["public"]["Enums"]["member_tier"]
          membership_expires_at: string | null
          must_change_password: boolean
          phone_number: string | null
          referral_code: string
          referral_tier: Database["public"]["Enums"]["referral_tier"] | null
          referred_by: string | null
          shipping_address: string | null
          shipping_address2: string | null
          shipping_city: string | null
          shipping_country: string | null
          shipping_first_name: string | null
          shipping_last_name: string | null
          shipping_postcode: string | null
          shipping_state: string | null
          source: string
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          birth_hour?: number | null
          birth_minute?: number | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          gender?: string | null
          id: string
          is_frozen?: boolean
          last_login_at?: string | null
          member_tier?: Database["public"]["Enums"]["member_tier"]
          membership_expires_at?: string | null
          must_change_password?: boolean
          phone_number?: string | null
          referral_code?: string
          referral_tier?: Database["public"]["Enums"]["referral_tier"] | null
          referred_by?: string | null
          shipping_address?: string | null
          shipping_address2?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_first_name?: string | null
          shipping_last_name?: string | null
          shipping_postcode?: string | null
          shipping_state?: string | null
          source?: string
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          birth_hour?: number | null
          birth_minute?: number | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          is_frozen?: boolean
          last_login_at?: string | null
          member_tier?: Database["public"]["Enums"]["member_tier"]
          membership_expires_at?: string | null
          must_change_password?: boolean
          phone_number?: string | null
          referral_code?: string
          referral_tier?: Database["public"]["Enums"]["referral_tier"] | null
          referred_by?: string | null
          shipping_address?: string | null
          shipping_address2?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_first_name?: string | null
          shipping_last_name?: string | null
          shipping_postcode?: string | null
          shipping_state?: string | null
          source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      realtime_consultations: {
        Row: {
          chart_data: Json
          chart_date: string
          created_at: string
          id: string
          issue: string | null
          title: string | null
          topic: string | null
          user_id: string | null
        }
        Insert: {
          chart_data: Json
          chart_date: string
          created_at?: string
          id?: string
          issue?: string | null
          title?: string | null
          topic?: string | null
          user_id?: string | null
        }
        Update: {
          chart_data?: Json
          chart_date?: string
          created_at?: string
          id?: string
          issue?: string | null
          title?: string | null
          topic?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      realtime_interpretations: {
        Row: {
          consultation_id: string
          content: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          consultation_id: string
          content: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          consultation_id?: string
          content?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "realtime_interpretations_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "realtime_consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_applications: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          requested_tier: Database["public"]["Enums"]["referral_tier"]
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          requested_tier: Database["public"]["Enums"]["referral_tier"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          requested_tier?: Database["public"]["Enums"]["referral_tier"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_commissions: {
        Row: {
          commission_amount: number
          created_at: string
          currency: string
          id: string
          notes: string | null
          referee_id: string
          referrer_id: string
          source_id: string | null
          source_type: string
          status: string
          updated_at: string
        }
        Insert: {
          commission_amount?: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          referee_id: string
          referrer_id: string
          source_id?: string | null
          source_type?: string
          status?: string
          updated_at?: string
        }
        Update: {
          commission_amount?: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          referee_id?: string
          referrer_id?: string
          source_id?: string | null
          source_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      referral_income: {
        Row: {
          amount: number
          application_id: string | null
          created_at: string
          currency: string
          id: string
          notes: string | null
          tier: string
          user_id: string
        }
        Insert: {
          amount?: number
          application_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          tier: string
          user_id: string
        }
        Update: {
          amount?: number
          application_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          tier?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_income_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "referral_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_payouts: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          notes: string | null
          paid_by: string | null
          referrer_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          paid_by?: string | null
          referrer_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          paid_by?: string | null
          referrer_id?: string
        }
        Relationships: []
      }
      synastry_consultations: {
        Row: {
          chart_data_1: Json
          chart_data_2: Json
          client_id_1: string
          client_id_2: string
          created_at: string
          id: string
          title: string | null
          topic: string | null
          user_id: string
        }
        Insert: {
          chart_data_1: Json
          chart_data_2: Json
          client_id_1: string
          client_id_2: string
          created_at?: string
          id?: string
          title?: string | null
          topic?: string | null
          user_id: string
        }
        Update: {
          chart_data_1?: Json
          chart_data_2?: Json
          client_id_1?: string
          client_id_2?: string
          created_at?: string
          id?: string
          title?: string | null
          topic?: string | null
          user_id?: string
        }
        Relationships: []
      }
      synastry_interpretations: {
        Row: {
          consultation_id: string
          content: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          consultation_id: string
          content: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          consultation_id?: string
          content?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "synastry_interpretations_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "synastry_consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      unlocked_clients: {
        Row: {
          client_id: string
          id: string
          payment_amount: number
          payment_currency: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          id?: string
          payment_amount?: number
          payment_currency?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          id?: string
          payment_amount?: number
          payment_currency?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unlocked_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feature_packages: {
        Row: {
          created_at: string
          id: string
          package_key: Database["public"]["Enums"]["feature_package"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          package_key: Database["public"]["Enums"]["feature_package"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          package_key?: Database["public"]["Enums"]["feature_package"]
          user_id?: string
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_stock: {
        Args: { p_product_id: string; p_quantity: number }
        Returns: undefined
      }
      decrement_variant_stock: {
        Args: { p_quantity: number; p_variant_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_coupon_usage: {
        Args: { p_coupon_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user" | "superadmin" | "owner"
      feature_package:
        | "marketing"
        | "numerology"
        | "professional_fengshui"
        | "real_estate"
      member_tier: "normal" | "vip" | "vip_plus" | "subscriber"
      referral_tier:
        | "member"
        | "promoter"
        | "super_promoter"
        | "starlight"
        | "king"
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
      app_role: ["admin", "user", "superadmin", "owner"],
      feature_package: [
        "marketing",
        "numerology",
        "professional_fengshui",
        "real_estate",
      ],
      member_tier: ["normal", "vip", "vip_plus", "subscriber"],
      referral_tier: [
        "member",
        "promoter",
        "super_promoter",
        "starlight",
        "king",
      ],
    },
  },
} as const
