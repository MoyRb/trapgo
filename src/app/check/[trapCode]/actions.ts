"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const allowedStatuses = new Set(["ok", "activity_detected", "damaged", "missing", "needs_replacement"]);
const allowedLevels = new Set(["none", "low", "medium", "high"]);

function text(formData: FormData, key: string) { const raw = formData.get(key); return typeof raw === "string" && raw.trim() ? raw.trim() : null; }
function numberOrNull(formData: FormData, key: string) { const raw = text(formData, key); if (!raw) return null; const parsed = Number(raw); return Number.isFinite(parsed) ? parsed : null; }

export async function createTrapCheckAction(trapCode: string, trapId: string, formData: FormData) {
  const trap_status = text(formData, "trap_status") ?? "ok";
  const activity_level = text(formData, "activity_level") ?? "none";
  if (!allowedStatuses.has(trap_status)) throw new Error("Estado inválido.");
  if (!allowedLevels.has(activity_level)) throw new Error("Nivel de actividad inválido.");
  const supabase = await createSupabaseServerClient();
  let photo_url: string | null = null;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const extension = photo.name.split(".").pop() || "jpg";
    const photoPath = `${trapCode}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("trap-evidence").upload(photoPath, photo, { contentType: photo.type || "image/jpeg", upsert: false });
    if (uploadError) throw new Error(`${uploadError.message}. Verifica que exista el bucket trap-evidence.`);
    photo_url = supabase.storage.from("trap-evidence").getPublicUrl(photoPath).data.publicUrl;
  }
  const { error } = await supabase.from("trap_checks").insert({ trap_id: trapId, technician_name: text(formData, "technician_name"), trap_status, activity_level, notes: text(formData, "notes"), photo_url, latitude: numberOrNull(formData, "latitude"), longitude: numberOrNull(formData, "longitude") });
  if (error) throw new Error(error.message);
  revalidatePath(`/check/${trapCode}`);
  revalidatePath("/dashboard");
}
