// Server-side in-memory store for PKCE code verifiers.
// Using globalThis so the Map survives Next.js hot-module reloads in dev.
declare global {
  // eslint-disable-next-line no-var
  var __pkceStore:
    | Map<string, { value: string; expiresAt: number }>
    | undefined;
}

const store: Map<string, { value: string; expiresAt: number }> =
  globalThis.__pkceStore ??
  (globalThis.__pkceStore = new Map());

const TTL_MS = 10 * 60 * 1000; // 10 minutes

export function setPkceVerifier(id: string, cookieValue: string): void {
  store.set(id, { value: cookieValue, expiresAt: Date.now() + TTL_MS });
}

export function getPkceVerifier(id: string): string | null {
  const entry = store.get(id);
  store.delete(id); // one-time use
  if (!entry || entry.expiresAt < Date.now()) return null;
  return entry.value;
}
