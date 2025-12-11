export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: {
          client_email: string | null;
          client_name: string;
          client_phone: string | null;
          created_at: string;
          duration_minutes: number;
          id: string;
          notes: string | null;
          salon_id: string;
          service_id: string | null;
          start_at: string;
          status: Database["public"]["Enums"]["appointment_status"];
          updated_at: string;
          workstation_id: string;
        };
        Insert: {
          client_email?: string | null;
          client_name: string;
          client_phone?: string | null;
          created_at?: string;
          duration_minutes: number;
          id?: string;
          notes?: string | null;
          salon_id: string;
          service_id?: string | null;
          start_at: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          updated_at?: string;
          workstation_id: string;
        };
        Update: {
          client_email?: string | null;
          client_name?: string;
          client_phone?: string | null;
          created_at?: string;
          duration_minutes?: number;
          id?: string;
          notes?: string | null;
          salon_id?: string;
          service_id?: string | null;
          start_at?: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          updated_at?: string;
          workstation_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_salon_id_fkey";
            columns: ["salon_id"];
            referencedRelation: "salons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_service_id_fkey";
            columns: ["service_id"];
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_workstation_id_fkey";
            columns: ["workstation_id"];
            referencedRelation: "workstations";
            referencedColumns: ["id"];
          },
        ];
      };
      closed_days: {
        Row: {
          created_at: string;
          date: string;
          id: string;
          reason: string | null;
          salon_id: string;
        };
        Insert: {
          created_at?: string;
          date: string;
          id?: string;
          reason?: string | null;
          salon_id: string;
        };
        Update: {
          created_at?: string;
          date?: string;
          id?: string;
          reason?: string | null;
          salon_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "closed_days_salon_id_fkey";
            columns: ["salon_id"];
            referencedRelation: "salons";
            referencedColumns: ["id"];
          },
        ];
      };
      opening_hours: {
        Row: {
          close_time: string | null;
          created_at: string;
          id: string;
          is_closed: boolean;
          open_time: string | null;
          salon_id: string;
          weekday: number;
        };
        Insert: {
          close_time?: string | null;
          created_at?: string;
          id?: string;
          is_closed?: boolean;
          open_time?: string | null;
          salon_id: string;
          weekday: number;
        };
        Update: {
          close_time?: string | null;
          created_at?: string;
          id?: string;
          is_closed?: boolean;
          open_time?: string | null;
          salon_id?: string;
          weekday?: number;
        };
        Relationships: [
          {
            foreignKeyName: "opening_hours_salon_id_fkey";
            columns: ["salon_id"];
            referencedRelation: "salons";
            referencedColumns: ["id"];
          },
        ];
      };
      salons: {
        Row: {
          address: string | null;
          country: string | null;
          created_at: string;
          currency: Database["public"]["Enums"]["currency_code"];
          default_locale: Database["public"]["Enums"]["supported_locale"];
          email: string | null;
          id: string;
          name: string;
          owner_user_id: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          country?: string | null;
          created_at?: string;
          currency?: Database["public"]["Enums"]["currency_code"];
          default_locale?: Database["public"]["Enums"]["supported_locale"];
          email?: string | null;
          id?: string;
          name: string;
          owner_user_id: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          country?: string | null;
          created_at?: string;
          currency?: Database["public"]["Enums"]["currency_code"];
          default_locale?: Database["public"]["Enums"]["supported_locale"];
          email?: string | null;
          id?: string;
          name?: string;
          owner_user_id?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "salons_owner_user_id_fkey";
            columns: ["owner_user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      services: {
        Row: {
          created_at: string;
          currency: Database["public"]["Enums"]["currency_code"];
          description: string | null;
          duration_minutes: number;
          id: string;
          is_active: boolean;
          name: string;
          price: number;
          salon_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          currency?: Database["public"]["Enums"]["currency_code"];
          description?: string | null;
          duration_minutes: number;
          id?: string;
          is_active?: boolean;
          name: string;
          price?: number;
          salon_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          currency?: Database["public"]["Enums"]["currency_code"];
          description?: string | null;
          duration_minutes?: number;
          id?: string;
          is_active?: boolean;
          name?: string;
          price?: number;
          salon_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "services_salon_id_fkey";
            columns: ["salon_id"];
            referencedRelation: "salons";
            referencedColumns: ["id"];
          },
        ];
      };
      workstations: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          order_index: number;
          salon_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          order_index?: number;
          salon_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          order_index?: number;
          salon_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workstations_salon_id_fkey";
            columns: ["salon_id"];
            referencedRelation: "salons";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      appointment_status: "scheduled" | "cancelled" | "completed" | "no_show";
      currency_code: "EUR" | "PLN";
      supported_locale: "es" | "pl" | "en";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
