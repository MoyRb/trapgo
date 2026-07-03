"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formText, generatePublicCode, normalizePublicCode, trapQrUrl } from "@/lib/crud/helpers";
import type { TrapInsert, TrapStatus, TrapUpdate } from "@/lib/crud/types";

const statuses = new Set<TrapStatus>(["active", "inactive", "maintenance", "missing"]);

async function resolveSiteAndZone(clientId: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  let siteId = formText(formData, "site_id");
  let zoneId = formText(formData, "zone_id");

  if (!siteId) {
    const { data, error } = await supabase.from("sites").insert({ client_id: clientId, name: formText(formData, "site_name") ?? "Sitio principal" }).select("id").single();
    if (error) throw new Error(error.message);
    siteId = data.id;
  }

  if (!zoneId && siteId) {
    const { data, error } = await supabase.from("zones").insert({ site_id: siteId, name: formText(formData, "zone_name") ?? "Zona general" }).select("id").single();
    if (error) throw new Error(error.message);
    zoneId = data.id;
  }

  return { site_id: siteId, zone_id: zoneId };
}

async function trapPayload(formData: FormData): Promise<TrapInsert> {
  const client_id = formText(formData, "client_id");
  const name = formText(formData, "name");
  if (!client_id || !name) throw new Error("Cliente y nombre de trampa son obligatorios.");
  const { site_id, zone_id } = await resolveSiteAndZone(client_id, formData);
  if (!site_id) throw new Error("La trampa necesita un sitio.");
  const providedCode = formText(formData, "public_code");
  const public_code = providedCode ? normalizePublicCode(providedCode) : generatePublicCode();
  const status = (formText(formData, "status") ?? "active") as TrapStatus;
  if (!statuses.has(status)) throw new Error("Estado de trampa inválido.");
  return { client_id, site_id, zone_id, name, public_code, qr_url: trapQrUrl(public_code), status, expected_location: formText(formData, "expected_location"), nfc_code: formText(formData, "nfc_code") };
}

export async function createTrap(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("traps").insert(await trapPayload(formData)).select("id").single();
  if (error) throw new Error(error.message);
  revalidatePath("/trampas");
  redirect(`/trampas/${data.id}`);
}

export async function updateTrap(id: string, formData: FormData) {
  const update = (await trapPayload(formData)) as TrapUpdate;
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
