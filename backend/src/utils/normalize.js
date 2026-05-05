export function normalizeText(value) {
  if (!value) return null;

  return String(value)
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

export function normalizeId(value) {
  if (!value) return null;

  return String(value)
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9]/gi, "")
    .toUpperCase();
}
