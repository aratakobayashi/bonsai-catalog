import DATA from '@/data/garden-partners.json'

// 掲載パートナー（園の方に掲載内容を確かめていただいた盆栽園。無料）。
// 確認済みの表示を出すだけで、一覧の並び順や表示の大きさは変えない
export interface GardenPartner { id: string; confirmedAt: string }

const PARTNERS = (DATA.partners as GardenPartner[]).filter(p => p.id && /^\d{4}-\d{2}-\d{2}$/.test(p.confirmedAt))

export function gardenPartner(id: string): GardenPartner | null {
  return PARTNERS.find(p => p.id === id) ?? null
}

export const partnerCount = () => PARTNERS.length

export const formatConfirmedAt = (d: string) => { const [y, m] = d.split('-').map(Number); return `${y}年${m}月` }
