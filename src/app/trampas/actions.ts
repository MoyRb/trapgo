"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formText, generatePublicCode, normalizePublicCode, trapQrUrl } from "@/lib/crud/helpers";
import type { TrapInsert, TrapStatus, TrapUpdate } from "@/lib/crud/types";

const statuses = new Set<TrapStatus>(["active", "inactive", "maintenance", "lost"]);

function trapPayload(formData: FormData): TrapInsert {
  const client_id = formText(formData, "client_id");
  const label = formText(formData, "label");
  const site = formText(formData, "site");
  const zone = formText(formData, "zone");
  if (!client_id || !label || !site || !zone) throw new Error("Cliente, etiqueta, sitio y zona son obligatorios.");
  const providedCode = formText(formData, "public_code");
  const public_code = providedCode ? normalizePublicCode(providedCode) : generatePublicCode(label);
  const status = formText(formData, "status") ?? "active";
  if (!statuses.has(status as TrapStatus)) throw new Error("Estado de trampa inválido.");
  return { client_id, label, site, zone, public_code, code: public_code, qr_url: trapQrUrl(public_code), status, location_description: formText(formData, "location_description") };
}

export async function createTrap(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("traps").insert(trapPayload(formData)).select("id").single();
  if (error) throw new Error(error.message);
  revalidatePath("/trampas");
  redirect(`/trampas/${data.id}`);
}

export async function updateTrap(id: string, formData: FormData) {
  const update = trapPayload(formData) as TrapUpdate;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("traps").update(update).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/trampas");
  revalidatePath(`/trampas/${id}`);
  redirect(`/trampas/${id}`);
}

export async function changeTrapStatus(id: string, status: TrapStatus) {
  if (!statuses.has(status)) throw new Error("Estado de trampa inválido.");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("traps").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/trampas");
  revalidatePath(`/trampas/${id}`);
}
