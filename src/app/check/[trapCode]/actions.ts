"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseClient } from "@/lib/supabase";

const allowedStatuses = new Set(["ok", "activity", "damaged", "missing"]);

function text(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

function numberOrNull(formData: FormData, key: string) {
  const raw = text(formData, key);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function createTrapCheckAction(trapCode: string, trapId: string, formData: FormData) {
  const status = text(formData, "status") ?? "ok";
  if (!allowedStatuses.has(status)) throw new Error("Estado inválido.");

  const supabase = createSupabaseClient();
  let photoPath: string | null = null;
  const photo = formData.get("photo");

  if (photo instanceof File && photo.size > 0) {
    const extension = photo.name.split(".").pop() || "jpg";
    photoPath = `${trapCode}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("trap-photos").upload(photoPath, photo, {
      contentType: photo.type || "image/jpeg",
      upsert: false,
    });
    if (uploadError) throw new Error(uploadError.message);
  }

  const { error } = await supabase.from("trap_checks").insert({
    trap_id: trapId,
    status,
    observations: text(formData, "observations"),
    photo_path: photoPath,
    latitude: numberOrNull(formData, "latitude"),
    longitude: numberOrNull(formData, "longitude"),
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/check/${trapCode}`);
  revalidatePath("/dashboard");
}
