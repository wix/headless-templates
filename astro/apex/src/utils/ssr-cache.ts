// Module-scope SSR data cache. Wix pods keep the server bundle warm between
// requests, so a small in-memory TTL cache turns the per-request Wix API reads
// (the bulk of the ~1s in-grid render time) into instant hits. Expired entries
// are served stale once while a single background refresh runs — visitors
// never wait on the upstream query after a pod's first render. A failed first
// read propagates (nothing is cached), so pages keep their own fallbacks and
// the next request retries.
type Entry = { value: unknown; expires: number; refreshing: boolean };

const store = new Map<string, Entry>();

export async function cached<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && now < hit.expires) return hit.value as T;
  if (hit) {
    if (!hit.refreshing) {
      hit.refreshing = true;
      fn()
        .then((value) =>
          store.set(key, { value, expires: Date.now() + ttlMs, refreshing: false }),
        )
        .catch(() => {
          hit.refreshing = false; // keep serving stale; retry on a later request
        });
    }
    return hit.value as T;
  }
  const value = await fn();
  store.set(key, { value, expires: now + ttlMs, refreshing: false });
  return value;
}
