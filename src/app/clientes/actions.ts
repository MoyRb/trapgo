"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formText } from "@/lib/crud/helpers";
import type { ClientInsert, ClientUpdate } from "@/lib/crud/types";

function payload(formData: FormData): ClientInsert {
  const name = formText(formData, "name");
  if (!name) throw new Error("El nombre del cliente es obligatorio.");
  return { name, contact_name: formText(formData, "contact_name"), email: formText(formData, "email"), phone: formText(formData, "phone"), is_active: formData.get("is_active") !== "false" };
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
  const { error } = await supabase.from("clients").update({ is_active: false }).eq("id", id);
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
