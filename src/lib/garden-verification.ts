// 盆栽園の掲載情報の確認結果（公式サイトなどの公開情報と照合した結果）
// 実在を確認できない園・閉園した園・盆栽を扱わない園は掲載しない
import verification from '@/data/garden-verification.json'
import type { Garden } from '@/types'

const hiddenIds = new Set<string>(verification.hiddenIds)
const sourcesById = verification.sourcesById as Record<string, string[]>
const sourcesByKey = verification.sourcesByKey as Record<string, string[]>

export const GARDEN_VERIFIED_AT: string | null = verification.verifiedAt

export function isGardenPublished(garden: Pick<Garden, 'id'>): boolean {
  return !hiddenIds.has(garden.id)
}

export function getGardenSources(garden: Pick<Garden, 'id' | 'name' | 'prefecture'>): string[] {
  return sourcesById[garden.id] ?? sourcesByKey[`${garden.name}|${garden.prefecture}`] ?? []
}

export function isGardenHiddenId(id: string): boolean {
  return hiddenIds.has(id)
}
