import dynamic from 'next/dynamic'

const RecycleGameAsync = dynamic(() => import('./game'), {
  ssr: false
})

export default RecycleGameAsync
