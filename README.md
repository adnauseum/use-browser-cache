# @adnauseum/use-browser-cache

> A React hook which manages a localforage instance you can use to persist data in your web applications.

[![NPM](https://img.shields.io/npm/v/@adnauseum/use-browser-cache.svg)](https://www.npmjs.com/package/@adnauseum/use-browser-cache) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save @adnauseum/use-browser-cache
```

## Usage

```tsx
import * as React from "react";

import { useMyHook } from "@adnauseum/use-browser-cache";

const Example = () => {
  const example = useMyHook();
  return <div>{example}</div>;
};
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
