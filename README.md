# @adnauseum/use-browser-cache

> A React hook which manages a localfoorage instance you can use to persist data in your web applications.

[![NPM](https://img.shields.io/npm/v/@adnauseum/use-browser-cache.svg)](https://www.npmjs.com/package/@adnauseum/use-browser-cache) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save @adnauseum/use-browser-cache
```

## Usage

```tsx
import * as React from 'react'

import { useMyHook } from '@adnauseum/use-browser-cache'

const Example = () => {
  const example = useMyHook()
  return (
    <div>
      {example}
    </div>
  )
}
```

## License

MIT © [adnauseum](https://github.com/adnauseum)

---

This hook is created using [create-react-hook](https://github.com/hermanya/create-react-hook).
