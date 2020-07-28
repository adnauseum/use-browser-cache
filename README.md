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

export function Component({ userId }) {
  // Don't render `useBrowserCache` in all your components.  localforage has to "connect"
  // to the browser storage APIs asynchronously. Instead, initialize the browser cache hook
  // once when the app boots and pass it as a prop to children and/or functions who need it.
  const browserCache = useBrowserCache();
  const { error, isLoading, posts = [] } = useFetchPosts(userId, browserCache);

  return (
    <ul>
      {error && <ErrorMessage error={error} />}
      {isLoading && <LoadingSpinner message="Fetching posts" />}
      {posts.map((post) => (
        <li key={post.id}>{post.content}</li>
      ))}
    </ul>
  );
}

function useFetchPosts(userId, browserCache) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setIsLoading] = useState(null);
  const [posts, setPosts] = useState(null);

  try {
    setIsLoading(true);
    setError(null);
    const cachedPosts = await browserCache.getItemAsync("posts");
    if (cachedPosts) {
      setPosts(cachedPosts);
      // Serve the cached posts and then fetch fresh posts in the background
      fetchPosts(userId).then((posts) => setPosts(posts));
      return;
    }
    // When there are no cached posts
    const posts = await fetchPosts(userId);
    setPosts(posts);
  } catch (error) {
    setError(error);
  } finally {
    setIsLoading(false);
  }
  return {
    hasError,
    isLoading,
    posts,
  };
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

This hook wraps [localforage](https://www.npmjs.com/package/localforage), a great library helping developers persist data using various browser persistence APIs.

### When should this hook be used?

This hook is ideal for caching data which is not particularly sensitive. Additionally, your application will have to not mind serving stale data. For instance, if my app has to query the network to get a list of navigation items, you can make your UI snappier by serving cached content and fetching the items in the background. Then, when the network request has resolved, you can update the navigation items in the cache as well as those presented to the user (which probably didn't even change).

This is in the spirit of a caching strategy called "stale-while-revalidate," which means you serve stale content while a network request resolves. Some great projects like [React Query](https://github.com/tannerlinsley/react-query) or [Zeit's useSWR](https://github.com/vercel/swr) do this, but with an ephemeral in-memory cache which is wiped at page refresh.

This hook is very general and can be what you make it.

### When should this hook _not_ be used?

As with local storage, don't put anything sensitive into browser stores (like JWTs). As you are using JavaScript to set/get those items, it is clear that they are accesible via JavaScript and are prime targets for XSS attacks.

## License

MIT © [adnauseum](https://github.com/adnauseum)

---

This hook is created using [create-react-hook](https://github.com/hermanya/create-react-hook).
