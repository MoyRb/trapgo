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

export function generatePublicCode() {
  return `TG-${crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

export function trapQrUrl(publicCode: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
  return `${baseUrl}/check/${encodeURIComponent(publicCode)}`;
}
