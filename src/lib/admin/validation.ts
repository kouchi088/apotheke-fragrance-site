export function isSlug(value: string) {
  return /^[a-z0-9-]{3,80}$/.test(value);
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export function isNonNegativeMoney(value: number) {
  return Number.isFinite(value) && value >= 0 && Number(value.toFixed(2)) === value;
}

export function requireString(value: unknown, field: string, min = 1, max = 255) {
  if (typeof value !== 'string') throw new Error(`${field} must be a string`);
  const v = value.trim();
  if (v.length < min || v.length > max) throw new Error(`${field} length must be between ${min} and ${max}`);
  return v;
}

export function requireNumber(value: unknown, field: string, min?: number, max?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`${field} must be a number`);
  if (min !== undefined && value < min) throw new Error(`${field} must be >= ${min}`);
  if (max !== undefined && value > max) throw new Error(`${field} must be <= ${max}`);
  return value;
}
