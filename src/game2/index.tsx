import dynamic from 'next/dynamic'

const ReduceGameAsync = dynamic(() => import('./game'),
  { ssr: false }
)

export default ReduceGameAsync
