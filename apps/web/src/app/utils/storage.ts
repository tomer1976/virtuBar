type ErrorHandler = (message: string) => void;

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage;
}

export function readJsonWithDefaults<T>(key: string, defaults: T, onError?: ErrorHandler): T {
  if (!canUseStorage()) return defaults;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<T>;
    return { ...defaults, ...parsed };
  } catch (error) {
    onError?.('Data could not be loaded; defaults restored.');
    console.warn(`Failed to read ${key} from storage`, error);
    try {
      window.localStorage.removeItem(key);
    } catch (cleanupError) {
      console.warn(`Failed to clear ${key} after read error`, cleanupError);
    }
    return defaults;
  }
}

export function writeJsonSafe(key: string, value: unknown, onError?: ErrorHandler): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    onError?.('Data could not be saved.');
    console.warn(`Failed to write ${key} to storage`, error);
  }
}

export function clearStorageKey(key: string, onError?: ErrorHandler): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    onError?.('Data could not be cleared.');
    console.warn(`Failed to clear ${key} from storage`, error);
  }
}
