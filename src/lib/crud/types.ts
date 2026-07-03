import type { Database } from "@/lib/database.types";

export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];
export type ClientUpdate = Database["public"]["Tables"]["clients"]["Update"];
export type Trap = Database["public"]["Tables"]["traps"]["Row"];
export type TrapInsert = Database["public"]["Tables"]["traps"]["Insert"];
export type TrapUpdate = Database["public"]["Tables"]["traps"]["Update"];

export type TrapStatus = "active" | "inactive" | "maintenance" | "lost";

export type TrapWithClient = Trap & {
  clients: Pick<Client, "id" | "name"> | null;
};
