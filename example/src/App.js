import React, { useEffect, useState } from "react";
import { useBrowserCache } from "@adnauseum/use-browser-cache";

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
