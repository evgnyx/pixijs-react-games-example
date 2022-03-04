import { useEffect, useImperativeHandle, useRef } from 'react'
import { AppRecycle } from './app'

export interface RecycleGameProps {
  gameRef: any
}

export default function RecycleGame({
  gameRef
}: RecycleGameProps) {
  const container = useRef<HTMLDivElement | null>(null)
  const appRef = useRef<AppRecycle | null>(null)

  useImperativeHandle(gameRef, () => ({
    restart: () => {
      appRef.current?.restart()
    }
  }))

  useEffect(() => {
    if (!container.current) return
    const app = new AppRecycle()
    appRef.current = app
    container.current.appendChild(app.view)
    return () => {
      app.view.remove()
      app.destroy()
    }
  }, [])

  return (
    <div ref={ container } />
  )
}
