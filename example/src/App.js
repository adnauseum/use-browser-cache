import React from 'react'

import { useMyHook } from '@adnauseum/use-browser-cache'

const App = () => {
  const example = useMyHook()
  return (
    <div>
      {example}
    </div>
  )
}
export default App
