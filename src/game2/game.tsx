import { useEffect, useImperativeHandle, useRef } from 'react'
import { AppReduce } from './app'

export interface ReduceGameProps {
  gameRef: any
}

export default function ReduceGame({
  gameRef
}: ReduceGameProps) {
  const container = useRef<HTMLDivElement | null>(null)
  const appRef = useRef<AppReduce | null>(null)

  useImperativeHandle(gameRef, () => ({
    restart: () => {
      appRef.current?.restart()
    }
  }))

  useEffect(() => {
    if (!container.current) return
    const app = new AppReduce()
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
