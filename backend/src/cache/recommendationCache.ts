const cache = new Map();

export function getCachedRecommendation(key: string) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

export function setCachedRecommendation(key: string, value: unknown, ttlMs = 10 * 60 * 1000) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}
