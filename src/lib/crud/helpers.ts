export function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function normalizePublicCode(value: string) {
  return value
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function generatePublicCode(label?: string | null) {
  const prefix = normalizePublicCode(label || "TRAMPA") || "TRAMPA";
  const suffix = crypto.randomUUID().split("-")[0].toUpperCase();
  return `${prefix}-${suffix}`.slice(0, 64);
}

export function trapQrUrl(publicCode: string) {
  return `/check/${encodeURIComponent(publicCode)}`;
}
