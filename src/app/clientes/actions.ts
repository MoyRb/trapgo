"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formText } from "@/lib/crud/helpers";
import type { ClientInsert, ClientStatus, ClientUpdate } from "@/lib/crud/types";

const statuses = new Set<ClientStatus>(["active", "inactive"]);

function payload(formData: FormData): ClientInsert {
  const name = formText(formData, "name");
  const status = (formText(formData, "status") ?? "active") as ClientStatus;
  if (!name) throw new Error("El nombre del cliente es obligatorio.");
  if (!statuses.has(status)) throw new Error("Estado de cliente inválido.");
  return {
    name,
    business_name: formText(formData, "business_name"),
    contact_name: formText(formData, "contact_name"),
    email: formText(formData, "email"),
    contact_phone: formText(formData, "contact_phone"),
    address: formText(formData, "address"),
    notes: formText(formData, "notes"),
    status,
  };
}

export async function createClient(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("clients").insert(payload(formData)).select("id").single();
  if (error) throw new Error(error.message);
  revalidatePath("/clientes");
  redirect(`/clientes/${data.id}`);
}

export async function updateClient(id: string, formData: FormData) {
  const update = payload(formData) as ClientUpdate;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("clients").update(update).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  redirect(`/clientes/${id}`);
}

export async function deactivateClient(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("clients").update({ status: "inactive" }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
}

export async function deleteClient(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/clientes");
  redirect("/clientes");
}
