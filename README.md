# use-browser-cache

> A React hook which manages a localforage instance you can use to persist data in your web applications.

[![NPM](https://img.shields.io/npm/v/use-browser-cache.svg)](https://www.npmjs.com/package/@adnauseum/use-browser-cache) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save use-browser-cache
```

## Usage

You can [play with an example here](https://adnauseum.github.io/use-browser-cache/) or just look at the code:

```tsx
import React, { useEffect, useState } from "react";
import { useBrowserCache } from "use-browser-cache";

export function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const browserCache = useBrowserCache();
  window.browserCache = browserCache;

  const [isUsingHook, setIsUsingHook] = useState(true);
  const [isFetchingData, setIsFetchingData] = useState(false);

  async function fetchData(pageNumberToFetch) {
    if (isFetchingData) return;
    try {
      if (isUsingHook) {
        const cachedResults = await browserCache.getItemAsync(
          String(pageNumberToFetch)
        );
        setData(cachedResults);
      }

      // Perform fetch in the background
      setIsFetchingData(true);
      const data = await mockServer(pageNumberToFetch);
      setData(data);

      // Cache the data
      if (isUsingHook) {
        browserCache.setItemAsync(String(pageNumberToFetch), data);
      }
    } catch (error) {
      console.error(error);
      setError(error);
    } finally {
      setIsFetchingData(false);
    }
  }

  const [pageNumber, setPageNumber] = useState(1);
  function handlePageClick(pageNumber) {
    if (pageNumber > 3) return;
    if (pageNumber < 1) return;
    setPageNumber(pageNumber);
    fetchData(pageNumber);
  }

  return (
    <Page>
      <nav>
        <ul>
          <li>
            <button
              disabled={isFetchingData}
              onClick={() => setIsUsingHook((useHook) => !useHook)}
            >
              Turn {isUsingHook === true ? "off" : "on"}{" "}
              <code>useBrowserCache</code> hook
            </button>
            <button
              onClick={() => browserCache.clearCache()}
              disabled={isFetchingData}
            >
              Clear Cache
            </button>
          </li>
        </ul>
      </nav>
      <h1>
        <code>useBrowserCache</code> example
      </h1>

      <CopyBox>
        <p>
          When you load this page for the first time, or after the cache is
          cleared, you will see a loading spinner. In the background, your items
          are being fetched.
        </p>
        <p>
          You can also play with the cache in your dev tools via{" "}
          <code>window.browserCache</code>
        </p>
      </CopyBox>

      <div>
        <div>
          <p>Data:</p>
          {data && (
            <p>
              {isFetchingData
                ? "You're seeing stale data while new data is fetching in the background ⌛"
                : "You're seeing the most recent data ✅"}
            </p>
          )}
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {!isFetchingData && data === null ? (
            <button onClick={() => fetchData(1)}>Fetch data</button>
          ) : (
            <>
              <button
                disabled={isFetchingData || pageNumber === 1}
                onClick={() => handlePageClick(pageNumber - 1)}
              >
                Previous Page
              </button>
              <p>Page number: {pageNumber} </p>
              <button
                disabled={isFetchingData || pageNumber === 3}
                onClick={() => handlePageClick(pageNumber + 1)}
              >
                Next page
              </button>
            </>
          )}
        </div>
      </div>
    </Page>
  );
}

function Page({ children }) {
  return <div>{children}</div>;
}

function CopyBox({ children }) {
  return <div style={{ maxWidth: 1000 }}>{children}</div>;
}

function mockServer(pageNumber) {
  const results = {
    page: pageNumber,
    randomValues: crypto.getRandomValues(new Uint32Array(1)),
  };
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(results);
    }, 5000);
  });
}
```

## Burning Questions

[Burning Questions](#burning-questions)

- [How does this work?](#how-does-this-work-)
- [What does memory usage look like?](#what-does-memory-usage-look-like-)
- [How will this impact performance?](#how-will-this-impact-performance-)
- [When should this hook be used?](#when-should-this-hook-be-used-)
- [When should this hook _not_ be used?](#when-should-this-hook--not--be-used-)

### How does this work?

This hook wraps [localforage](https://www.npmjs.com/package/localforage) which is a great library helping developers persist data using various browser persistence APIs.

### When should this hook be used?

This hook is ideal for caching content that does not change frequently and is not particularly sensitive. For instance, if my app has to query the network to get a list of navigation items, you can make your UI snappier by serving cached content and fetching the items in the background. Then, when the network request has resolved, you can update the navigation items in the cache and those presented to the user (which probably didn't change).

This is in the spirit of a caching strategy called "stale-while-revalidate," which means you serve stale content while a network request resolves.

### When should this hook _not_ be used?

As with local storage, don't put anything sensitive into browser stores (like JWTs). As you are using JavaScript to set/get those items, it is clear that they are accesible via JavaScript and are prime targets for XSS attacks.

### What does memory usage look like?

Pass

### How will this impact performance?

Pass

## License

MIT © [adnauseum](https://github.com/adnauseum)

---

This hook is created using [create-react-hook](https://github.com/hermanya/create-react-hook).
