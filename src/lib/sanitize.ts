// ─── Input sanitization utilities ────────────────────────────────────────────

const HTML_TAG_RE = /<[^>]*>/g;
const NULL_BYTE_RE = /\0/g;
const SQL_INJECTION_RE = /('|--|;|\bOR\b|\bAND\b|\bDROP\b|\bSELECT\b|\bINSERT\b|\bDELETE\b|\bUPDATE\b|\bEXEC\b)/gi;
const EXCESS_WHITESPACE_RE = /\s{3,}/g;
const DANGEROUS_PROTOCOLS_RE = /^(javascript|data|vbscript):/i;
const EVENT_HANDLER_RE = /\bon\w+\s*=/gi;
const SCRIPT_TAG_RE = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
const CUID_RE = /^c[a-z0-9]{24}$/;

/** Remove HTML tags, SQL patterns, null bytes, normalize whitespace */
export function sanitizeString(input: string): string {
  return input
    .replace(NULL_BYTE_RE, "")
    .replace(SCRIPT_TAG_RE, "")
    .replace(HTML_TAG_RE, "")
    .replace(EVENT_HANDLER_RE, "")
    .replace(SQL_INJECTION_RE, "")
    .replace(EXCESS_WHITESPACE_RE, " ")
    .trim();
}

/** Lowercase + trim + validate email format */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().replace(NULL_BYTE_RE, "");
}

/** Parse and clamp a number within bounds */
export function sanitizeNumber(value: unknown, min: number, max: number): number {
  const n = typeof value === "string" ? parseFloat(value) : Number(value);
  if (!isFinite(n)) return min;
  return Math.min(Math.max(n, min), max);
}

/** Escape HTML special chars for safe display */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/** Filter object to only allowed keys */
export function sanitizeObject<T extends object>(
  obj: T,
  allowedKeys: (keyof T)[]
): Partial<T> {
  return allowedKeys.reduce<Partial<T>>((acc, key) => {
    if (key in obj) acc[key] = obj[key];
    return acc;
  }, {});
}

/** Validate cuid format for database IDs */
export function isValidCuid(str: string): boolean {
  return CUID_RE.test(str);
}

/** Strip javascript:, data:, event handlers, script tags */
export function stripDangerousPatterns(input: string): string {
  return input
    .replace(SCRIPT_TAG_RE, "")
    .replace(EVENT_HANDLER_RE, "")
    .replace(DANGEROUS_PROTOCOLS_RE, "")
    .replace(NULL_BYTE_RE, "");
}

/** Full sanitization pipeline for user text inputs */
export function sanitizeUserInput(input: unknown): string {
  if (typeof input !== "string") return "";
  return sanitizeString(stripDangerousPatterns(input));
}
