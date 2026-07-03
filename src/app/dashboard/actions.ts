"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

export async function createClientAction(formData: FormData) {
  const name = value(formData, "name");
  if (!name) throw new Error("El nombre del cliente es obligatorio.");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("clients").insert({
    name,
    contact_name: value(formData, "contact_name"),
    email: value(formData, "email"),
    phone: value(formData, "phone"),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function createTrapAction(formData: FormData) {
  const clientId = value(formData, "client_id");
  const label = value(formData, "label");
  const code = value(formData, "code")?.toUpperCase().replace(/[^A-Z0-9-]/g, "-");
  if (!clientId || !label || !code) throw new Error("Cliente, etiqueta y código son obligatorios.");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("traps").insert({
    client_id: clientId,
    label,
    code,
    location_description: value(formData, "location_description"),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}
