export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type ClientStatus = "active" | "inactive";
type TrapStatus = "active" | "inactive" | "maintenance" | "missing";
type CheckStatus = "ok" | "activity_detected" | "damaged" | "missing" | "needs_replacement";
type ActivityLevel = "none" | "low" | "medium" | "high";

export type Database = {
  public: {
    Tables: {

      profiles: {
        Row: { id: string; full_name: string | null; role: string; created_at: string; updated_at: string | null };
        Insert: { id: string; full_name?: string | null; role?: string; created_at?: string; updated_at?: string | null };
        Update: { full_name?: string | null; role?: string; updated_at?: string | null };
      };
      service_orders: {
        Row: { id: string; client_id: string; site_id: string; technician_id: string | null; scheduled_date: string; status: string; notes: string | null; created_at: string; updated_at: string | null };
        Insert: { id?: string; client_id: string; site_id: string; technician_id?: string | null; scheduled_date: string; status?: string; notes?: string | null; created_at?: string; updated_at?: string | null };
        Update: { client_id?: string; site_id?: string; technician_id?: string | null; scheduled_date?: string; status?: string; notes?: string | null; updated_at?: string | null };
      };
      clients: {
        Row: { id: string; name: string; business_name: string | null; contact_name: string | null; email: string | null; contact_phone: string | null; address: string | null; notes: string | null; status: ClientStatus; created_at: string; updated_at: string | null };
        Insert: { id?: string; name: string; business_name?: string | null; contact_name?: string | null; email?: string | null; contact_phone?: string | null; address?: string | null; notes?: string | null; status?: ClientStatus; created_at?: string; updated_at?: string | null };
        Update: { name?: string; business_name?: string | null; contact_name?: string | null; email?: string | null; contact_phone?: string | null; address?: string | null; notes?: string | null; status?: ClientStatus; updated_at?: string | null };
      };
      sites: {
        Row: { id: string; client_id: string; name: string; address: string | null; notes: string | null; created_at: string; updated_at: string | null };
        Insert: { id?: string; client_id: string; name: string; address?: string | null; notes?: string | null; created_at?: string; updated_at?: string | null };
        Update: { client_id?: string; name?: string; address?: string | null; notes?: string | null; updated_at?: string | null };
      };
      zones: {
        Row: { id: string; site_id: string; name: string; description: string | null; created_at: string; updated_at: string | null };
        Insert: { id?: string; site_id: string; name: string; description?: string | null; created_at?: string; updated_at?: string | null };
        Update: { site_id?: string; name?: string; description?: string | null; updated_at?: string | null };
      };
      traps: {
        Row: { id: string; client_id: string; site_id: string; zone_id: string | null; public_code: string; name: string; expected_location: string | null; nfc_code: string | null; qr_url: string | null; status: TrapStatus; created_at: string; updated_at: string | null };
        Insert: { id?: string; client_id: string; site_id: string; zone_id?: string | null; public_code: string; name: string; expected_location?: string | null; nfc_code?: string | null; qr_url?: string | null; status?: TrapStatus; created_at?: string; updated_at?: string | null };
        Update: { client_id?: string; site_id?: string; zone_id?: string | null; public_code?: string; name?: string; expected_location?: string | null; nfc_code?: string | null; qr_url?: string | null; status?: TrapStatus; updated_at?: string | null };
      };
      trap_checks: {
        Row: { id: string; service_order_id: string | null; trap_id: string; technician_id: string | null; technician_name: string | null; checked_at: string; latitude: number | null; longitude: number | null; trap_status: CheckStatus; activity_level: ActivityLevel | null; notes: string | null; photo_url: string | null; created_at: string };
        Insert: { id?: string; service_order_id?: string | null; trap_id: string; technician_id?: string | null; technician_name?: string | null; checked_at?: string; latitude?: number | null; longitude?: number | null; trap_status: CheckStatus; activity_level?: ActivityLevel | null; notes?: string | null; photo_url?: string | null; created_at?: string };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
