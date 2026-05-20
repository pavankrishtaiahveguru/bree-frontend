const STORAGE_PREFIX = 'bree_cache:';

const getStorage = (type) => {
  if (typeof window === 'undefined') return null;
  if (type === 'sessionStorage') return window.sessionStorage;
  return window.localStorage;
};

const getKey = (key) => `${STORAGE_PREFIX}${key}`;

const isStorageAvailable = (type) => {
  const storage = getStorage(type);
  if (!storage) return false;
  try {
    const testKey = getKey('__test__');
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

export const readCache = (key, storage = 'localStorage') => {
  if (typeof window === 'undefined' || !isStorageAvailable(storage)) return null;
  const raw = getStorage(storage).getItem(getKey(key));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (Date.now() > parsed.expiresAt) {
      getStorage(storage).removeItem(getKey(key));
      return null;
    }
    return parsed.data;
  } catch {
    getStorage(storage).removeItem(getKey(key));
    return null;
  }
};

export const writeCache = (key, value, ttlSeconds = 300, storage = 'localStorage') => {
  if (typeof window === 'undefined' || !isStorageAvailable(storage)) return;
  try {
    getStorage(storage).setItem(
      getKey(key),
      JSON.stringify({
        data: value,
        expiresAt: Date.now() + ttlSeconds * 1000,
      }),
    );
  } catch {
    // Ignore storage failures for performance caching
  }
};

export const clearCache = (key, storage = 'localStorage') => {
  if (typeof window === 'undefined' || !isStorageAvailable(storage)) return;
  getStorage(storage).removeItem(getKey(key));
};

export const fetchWithCache = async ({
  key,
  url,
  ttl = 300,
  storage = 'localStorage',
  axiosInstance,
}) => {
  const cached = readCache(key, storage);
  if (cached !== null) return cached;

  const client = axiosInstance || (await import('./api.js')).default;
  const response = await client.get(url);
  writeCache(key, response.data, ttl, storage);
  return response.data;
};

export default {
  readCache,
  writeCache,
  clearCache,
  fetchWithCache,
};
