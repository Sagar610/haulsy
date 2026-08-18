export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function samePhone(a: string, b: string): boolean {
  const da = phoneDigits(a);
  const db = phoneDigits(b);
  if (da.length < 7 || db.length < 7) return false;
  return da === db || da.endsWith(db) || db.endsWith(da);
}

export function isEmail(value: string): boolean {
  return value.includes("@");
}

export function looksLikePhone(value: string): boolean {
  return phoneDigits(value).length >= 10;
}

export function isDemoPhone(value: string): boolean {
  return /555/.test(phoneDigits(value));
}

export function e164Canada(value: string): string {
  let d = phoneDigits(value);
  if (d.length === 10) d = `1${d}`;
  return `+${d}`;
}
