// Client-only mock persistence (same keys as the template). Every access is
// wrapped in try/catch; if localStorage is blocked we fall back to memory.

export interface User {
  name: string;
}

export interface SavedScore {
  game: string;
  score: number;
  name: string;
  at: number;
}

const USER_KEY = "av_user";
const SCORES_KEY = "av_scores";

let memoryUser: string | null = null;
let cachedRaw: string | null | undefined;
let cachedUser: User | null = null;
const listeners = new Set<() => void>();

function readRawUser(): string | null {
  try {
    return window.localStorage.getItem(USER_KEY);
  } catch {
    return memoryUser;
  }
}

/** Snapshot for useSyncExternalStore — returns a stable reference while the raw value is unchanged. */
export function getUserSnapshot(): User | null {
  const raw = readRawUser();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedUser = raw ? (JSON.parse(raw) as User) : null;
    } catch {
      cachedUser = null;
    }
  }
  return cachedUser;
}

export function getServerUserSnapshot(): User | null {
  return null;
}

export function subscribeUser(onChange: () => void): () => void {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === USER_KEY || e.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function writeUser(user: User | null): void {
  const raw = user ? JSON.stringify(user) : null;
  memoryUser = raw;
  try {
    if (raw) window.localStorage.setItem(USER_KEY, raw);
    else window.localStorage.removeItem(USER_KEY);
  } catch {
    // storage blocked: keep the in-memory value
  }
  listeners.forEach((l) => l());
}

export function appendScore(entry: Omit<SavedScore, "at">): void {
  try {
    const all = JSON.parse(window.localStorage.getItem(SCORES_KEY) || "[]") as SavedScore[];
    all.push({ ...entry, at: Date.now() });
    window.localStorage.setItem(SCORES_KEY, JSON.stringify(all));
  } catch {
    // storage blocked or corrupt: the app keeps working without persisting
  }
}
