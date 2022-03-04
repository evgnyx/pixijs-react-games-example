# pixijs-react-games-example

> The assets were not added due to copyright

An example of code of two educational games on garbage sorting and nature protection.
Built with PixiJS, TypeScript and React for Next.js.

## Usage
```jsx
import { useRef, useCallback } from 'react'
import FirstGame from './game1'

export default function GameContainer() {
  const gameRef = useRef(null)

  const handleRestart = useCallback(() => {
    gameRef.current?.restart()
  }, [])

  return (
    <div>
      <GameControls
        onRestart={ handleRestart }
      />
      <FirstGame gameRef={ gameRef } />
    </div>
  )
}
```
