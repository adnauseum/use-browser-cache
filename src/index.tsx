import { useEffect, useState } from "react";
import localforage from "localforage";

const TWENTY_FOUR_HOURS_IN_MILLIS = 86400000;

enum InternalCacheKeys {
  DEFAULT_STORE_NAME = "USE_BROWSER_STORAGE",
  STORE_EXPIRATION = "STORE_EXPIRATION",
}

type CacheOptions = {
  expireCacheAfterXMilliseconds?: number;
};
type CachedItem<T> = {
  key: string;
  value: T;
  options: CacheOptions;
};
type HookApi = {
  clearCache: () => void;
  cacheIsReady: boolean;
  getItemAsync: <T>(key: string) => Promise<T | null>;
  setItemAsync: <T>(
    key: string,
    value: T,
    options?: CacheOptions
  ) => Promise<void>;
};

export function useBrowserCache(configuration: CacheOptions = {}): HookApi {
  const [browserCache, setBrowserCache] = useState<LocalForage | null>(null);

  useEffect(() => {
    if (browserCache) return;

    async function createNewInstanceIfExistingHasExpired() {
      // Create a namespaced store in the browser's cache APIs. If the store exists already,
      // and hasn't expired, the store is returned. The localforage method might be more aptly
      // named: `createOrReturnInstance` ¯\_(ツ)_/¯
      const newOrExistingStore = localforage.createInstance({
        name: InternalCacheKeys.DEFAULT_STORE_NAME,
        ...configuration,
      });

      const actualExpirationDate:
        | number
        | null = await newOrExistingStore.getItem(
        InternalCacheKeys.STORE_EXPIRATION
      );

      const now = Date.now();
      const {
        expireCacheAfterXMilliseconds = TWENTY_FOUR_HOURS_IN_MILLIS,
      } = configuration;
      const expirationDate = now + expireCacheAfterXMilliseconds;

      if (!actualExpirationDate) {
        await newOrExistingStore.setItem(
          InternalCacheKeys.STORE_EXPIRATION,
          expirationDate
        );
        return setBrowserCache(newOrExistingStore);
      }

      if (now < actualExpirationDate) {
        return setBrowserCache(newOrExistingStore);
      }

      // Drop the cache when it expires
      await localforage.dropInstance({
        name: InternalCacheKeys.DEFAULT_STORE_NAME,
      });
      const newStore = localforage.createInstance({
        name: InternalCacheKeys.DEFAULT_STORE_NAME,
      });
      await newStore.setItem(
        InternalCacheKeys.STORE_EXPIRATION,
        expirationDate
      );
      return setBrowserCache(newStore);
    }

    let current = true;
    if (current) createNewInstanceIfExistingHasExpired();
    return () => {
      current = false;
    };
  }, [browserCache, configuration]);

  async function setItemAsync<T>(
    key: string,
    value: T,
    options?: CacheOptions
  ) {
    if (!browserCache) throw new Error("No instance of browser cache exists.");
    try {
      // Under the hood, each item is stored as an object: { value: any, options: CachedItemOptions }
      // to enable the ability to expire individual items in the cache
      await browserCache.setItem(key, {
        value,
        options: options || {},
      });
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async function getItemAsync<T>(key: string): Promise<T | null> {
    if (!browserCache) throw new Error("No instance of browser cache exists.");
    try {
      const cachedItem: CachedItem<T> = await browserCache.getItem(key);

      if (!cachedItem) return null;

      const expiresAtMillis = cachedItem.options.expireCacheAfterXMilliseconds;
      if (expiresAtMillis && Date.now() >= expiresAtMillis) {
        browserCache.setItem(key, null);
        return null;
      }

      return cachedItem.value;
    } catch (error) {
      console.error(error);
      return error;
    }
  }
  return {
    cacheIsReady: browserCache !== null,
    clearCache: () => {
      if (browserCache) browserCache.clear();
    },
    getItemAsync,
    setItemAsync,
  };
}
