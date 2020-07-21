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
type CachedItem = {
  key: string;
  value: any;
  options: CacheOptions;
};
type HookApi = {
  cacheIsReady: boolean;
  getItemAsync: (key: string) => Promise<any | null>;
  setItemAsync: (
    key: string,
    value: any,
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

  async function setItemAsync(key: string, value: any, options?: CacheOptions) {
    if (!browserCache) throw new Error("No instance of browser cache exists.");
    try {
      // Under the hood, each item is stored as an object: { value: any, options: CachedItemOptions }
      // to enable the ability to expire individual items in the cache
      await browserCache.setItem(key, {
        value: value,
        options: options || {},
      });
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async function getItemAsync(key: string): Promise<any> {
    if (!browserCache) throw new Error("No instance of browser cache exists.");
    try {
      const cachedItem: CachedItem = await browserCache.getItem(key);

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
    getItemAsync,
    setItemAsync,
    cacheIsReady: browserCache !== null,
  };
}
