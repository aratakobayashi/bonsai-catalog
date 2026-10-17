'use client'

import { GardenMap, type GardenMapPoint } from '@/components/gardens/GardenMap'

// 都道府県のまとめページの地図（地図の部品はブラウザでだけ動くため、この小さな部品に分ける）
export function AreaMap({ points }: { points: GardenMapPoint[] }) {
  return <GardenMap points={points} showPopup />
}
