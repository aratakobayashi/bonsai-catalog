'use client'

import { useSearchParams } from 'next/navigation'
import { FavoritesView } from './FavoritesView'

// 共有されたURL（/favorites?ids=a,b）の id。形式が正しいものだけ、30件まで
function parseIds(raw: string): string[] {
  return Array.from(new Set(raw.split(',').map(v => v.trim()).filter(v => /^[\w-]{1,64}$/.test(v)))).slice(0, 30)
}

export function SharedFavorites() {
  const ids = useSearchParams().getAll('ids').join(',')
  return <FavoritesView sharedIds={parseIds(ids)} />
}
