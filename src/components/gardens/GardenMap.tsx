'use client'

import dynamic from 'next/dynamic'
import { Placeholder } from '@/components/ui/design'

export interface GardenMapPoint {
  id: string
  name: string
  lat: number
  lng: number
  // 「埼玉県さいたま市」など
  area?: string
  href?: string
}

const GardenMapInner = dynamic(() => import('./GardenMapInner'), {
  ssr: false,
  loading: () => <Placeholder label="地図を読み込み中…" className="h-full w-full" />,
})

export function GardenMap(props: {
  points: GardenMapPoint[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  showPopup?: boolean
}) {
  return <GardenMapInner {...props} />
}
