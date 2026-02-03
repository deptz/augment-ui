export function isTruthyQueryParam(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(isTruthyQueryParam);
  }
  if (typeof value !== 'string') return false;
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}
