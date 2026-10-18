// 盆栽園の通販サイト（公式サイトを見て確かめたもの。src/data/garden-shops.json）
// 確かめた園は、通販サイトが見つかったかどうかで「オンライン購入可」を決める（DB の online_sales より優先）
// 確かめていない園は DB の online_sales のまま
import shops from '@/data/garden-shops.json'

interface ShopEntry {
  url: string | null
  type?: string | null
  checkedAt: string
}

export interface GardenShop {
  url: string
  // 自社通販・楽天市場・BASE など
  type: string
}

const SHOPS = shops as Record<string, ShopEntry>

export function gardenShop(id: string): GardenShop | null {
  const entry = SHOPS[id]
  return entry?.url ? { url: entry.url, type: entry.type || '通販サイト' } : null
}

export function verifiedOnlineSales(id: string, fallback: boolean | null | undefined): boolean {
  const entry = SHOPS[id]
  return entry ? Boolean(entry.url) : Boolean(fallback)
}
