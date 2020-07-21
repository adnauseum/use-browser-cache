import { useBrowserCache } from "./";
import { renderHook } from "@testing-library/react-hooks";
import FakeTimers from "@sinonjs/fake-timers";

it("uses existing caches and drops expired caches at initialization", async () => {
  const clock = FakeTimers.install({ now: 0, shouldAdvanceTime: false });
  const {
    result: result1,
    waitForNextUpdate: waitForNextUpdate_1,
  } = renderHook(() => useBrowserCache({ expireCacheAfterXMilliseconds: 2 }));
  expect(result1.current.cacheIsReady).toBe(false);
  await waitForNextUpdate_1();
  expect(result1.current.cacheIsReady).toBe(true);
  await result1.current.setItemAsync("burriedTreasure", ["💎", "💰", "🏆"]);

  await clock.tickAsync(1); // Cache is has one more ms before expiration

  const {
    result: result2,
    waitForNextUpdate: waitForNextUpdate_2,
  } = renderHook(() => useBrowserCache());
  expect(result2.current.cacheIsReady).toBe(false);
  await waitForNextUpdate_2();
  expect(result2.current.cacheIsReady).toBe(true);
  const existingTreasure = await result2.current.getItemAsync(
    "burriedTreasure"
  );
  expect(existingTreasure).toEqual(["💎", "💰", "🏆"]);

  await clock.tickAsync(1); // We have reached the 2 ms of expiration 🚽

  const {
    result: result3,
    waitForNextUpdate: waitForNextUpdate_3,
  } = renderHook(() => useBrowserCache());
  expect(result3.current.cacheIsReady).toBe(false);

  await waitForNextUpdate_3();
  expect(result3.current.cacheIsReady).toBe(true);

  const treasure = await result3.current.getItemAsync("burriedTreasure");
  expect(treasure).toEqual(null);

  clock.uninstall();
});

it("expires individual items in cache", async () => {
  const clock = FakeTimers.install({ now: 0, shouldAdvanceTime: false });

  const {
    result: result1,
    waitForNextUpdate: waitForNextUpdate_1,
  } = renderHook(() => useBrowserCache());
  expect(result1.current.cacheIsReady).toBe(false);
  await waitForNextUpdate_1();
  expect(result1.current.cacheIsReady).toBe(true);
  await result1.current.setItemAsync("theFleetingTreasure", [1, 2, 3], {
    expireCacheAfterXMilliseconds: 2,
  });
  await result1.current.setItemAsync("theRealTreasure", ["👑", "💰"]);

  await clock.tickAsync(1); // One second left for item expiration

  const {
    result: result2,
    waitForNextUpdate: waitForNextUpdate_2,
  } = renderHook(() => useBrowserCache());
  expect(result2.current.cacheIsReady).toBe(false);
  await waitForNextUpdate_2();
  expect(result2.current.cacheIsReady).toBe(true);
  const unexpiredTreasure = await result2.current.getItemAsync(
    "theFleetingTreasure"
  );
  expect(unexpiredTreasure).toEqual([1, 2, 3]);

  await clock.tickAsync(2); // theFleetingTreasure has expired

  const {
    result: result3,
    waitForNextUpdate: waitForNextUpdate_3,
  } = renderHook(() => useBrowserCache());
  expect(result3.current.cacheIsReady).toBe(false);
  await waitForNextUpdate_3();
  expect(result3.current.cacheIsReady).toBe(true);

  const expiredTreasure = await result3.current.getItemAsync(
    "theFleetingTreasure"
  );
  expect(expiredTreasure).toEqual(null);

  const theRealTreasure = await result3.current.getItemAsync("theRealTreasure");
  expect(theRealTreasure).toEqual(["👑", "💰"]);

  clock.uninstall();
});

it("becomes ready after async initialization", async () => {
  const { result, waitForNextUpdate } = renderHook(() => useBrowserCache());
  expect(result.current.cacheIsReady).toBe(false);
  await waitForNextUpdate();
  expect(result.current.cacheIsReady).toBe(true);
});

it("stores values", async () => {
  const { result, waitForNextUpdate } = renderHook(() => useBrowserCache());
  expect(result.current.cacheIsReady).toBe(false);
  await waitForNextUpdate();
  expect(result.current.cacheIsReady).toBe(true);

  await result.current.setItemAsync("burriedTreasure", ["💎", "💰", "🏆"]);
  const treasure = await result.current.getItemAsync("burriedTreasure");
  expect(treasure).toEqual(["💎", "💰", "🏆"]);
});
