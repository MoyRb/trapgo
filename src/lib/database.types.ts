export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: { id: string; name: string; contact_name: string | null; email: string | null; phone: string | null; created_at: string };
        Insert: { id?: string; name: string; contact_name?: string | null; email?: string | null; phone?: string | null; created_at?: string };
        Update: { name?: string; contact_name?: string | null; email?: string | null; phone?: string | null };
      };
      traps: {
        Row: { id: string; client_id: string; code: string; label: string; location_description: string | null; created_at: string };
        Insert: { id?: string; client_id: string; code: string; label: string; location_description?: string | null; created_at?: string };
        Update: { client_id?: string; code?: string; label?: string; location_description?: string | null };
      };
      trap_checks: {
        Row: { id: string; trap_id: string; status: string; observations: string | null; photo_path: string | null; latitude: number | null; longitude: number | null; created_at: string };
        Insert: { id?: string; trap_id: string; status: string; observations?: string | null; photo_path?: string | null; latitude?: number | null; longitude?: number | null; created_at?: string };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
