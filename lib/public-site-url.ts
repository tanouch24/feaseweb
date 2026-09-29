export function normalizePublicSiteUrl(value?: string | null) {
  const raw = value?.trim();
  if (!raw) return null;
  if (raw.startsWith("//")) return null;
  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString().replace(/\/$/, "");
  } catch { return null; }
}

export function displayPublicSiteUrl(value?: string | null) {
  const normalized = normalizePublicSiteUrl(value);
  if (!normalized) return null;
  return normalized.replace(/^https?:\/\//i, "");
}
