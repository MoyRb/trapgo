import type { Database } from "@/lib/database.types";

export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];
export type ClientUpdate = Database["public"]["Tables"]["clients"]["Update"];
export type Trap = Database["public"]["Tables"]["traps"]["Row"];
export type TrapInsert = Database["public"]["Tables"]["traps"]["Insert"];
export type TrapUpdate = Database["public"]["Tables"]["traps"]["Update"];
export type Site = Database["public"]["Tables"]["sites"]["Row"];
export type Zone = Database["public"]["Tables"]["zones"]["Row"];
export type TrapStatus = Trap["status"];
export type ClientStatus = Client["status"];
