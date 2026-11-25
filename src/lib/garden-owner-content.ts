// 園の方が管理画面（/owner）で登録した情報と商品を、ビルド時に読む。
// 表（supabase/migrations/20261125000000_owner_portal.sql）がまだ無いときや、読めなかったときは何も足さない
import { supabaseServer } from '@/lib/supabase-server'
import type { Garden } from '@/types'
import type { GardenShop } from '@/lib/garden-shops'

export interface GardenOwnerInfo {
  garden_id: string
  description: string | null
  business_hours: string | null
  closed_days: string | null
  visit_info: string | null
  access_info: string | null
  parking_info: string | null
  phone: string | null
  website_url: string | null
  shop_url: string | null
  instagram_url: string | null
  taiken_info: string | null
  photos: string[]
  updated_at: string
}

export interface GardenOwnerProduct {
  id: string
  garden_id: string
  name: string
  price: number | null
  price_note: string | null
  description: string | null
  image_url: string | null
  buy_method: 'url' | 'phone' | 'email' | 'visit'
  buy_url: string | null
  in_stock: boolean
  sort: number
}

let infoMemo: Promise<Map<string, GardenOwnerInfo>> | null = null
let productMemo: Promise<Map<string, GardenOwnerProduct[]>> | null = null

export function getOwnerInfoMap(): Promise<Map<string, GardenOwnerInfo>> {
  if (!infoMemo) {
    infoMemo = (async () => {
      const { data, error } = await supabaseServer.from('garden_owner_info' as never).select('*').limit(1000)
      const map = new Map<string, GardenOwnerInfo>()
      if (error || !data) return map
      for (const row of data as unknown as GardenOwnerInfo[]) map.set(row.garden_id, { ...row, photos: Array.isArray(row.photos) ? row.photos.filter(p => typeof p === 'string') : [] })
      return map
    })().catch(() => new Map())
  }
  return infoMemo
}

export function getOwnerProductMap(): Promise<Map<string, GardenOwnerProduct[]>> {
  if (!productMemo) {
    productMemo = (async () => {
      const { data, error } = await supabaseServer
        .from('garden_products' as never)
        .select('id, garden_id, name, price, price_note, description, image_url, buy_method, buy_url, in_stock, sort')
        .eq('published', true)
        .order('sort', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(1000)
      const map = new Map<string, GardenOwnerProduct[]>()
      if (error || !data) return map
      for (const row of data as unknown as GardenOwnerProduct[]) {
        if (!map.has(row.garden_id)) map.set(row.garden_id, [])
        map.get(row.garden_id)!.push(row)
      }
      return map
    })().catch(() => new Map())
  }
  return productMemo
}

const filled = (v: string | null | undefined) => (v && v.trim() ? v.trim() : undefined)

// 園の方が書いた項目を、公開情報より優先する（空の項目は公開情報のまま）
export function applyOwnerInfo(garden: Garden, info: GardenOwnerInfo | undefined): Garden {
  if (!info) return garden
  const closed = filled(info.closed_days)
  return {
    ...garden,
    description: filled(info.description) ?? garden.description,
    business_hours: filled(info.business_hours) ?? garden.business_hours,
    closed_days: closed ? [closed] : garden.closed_days,
    access_info: filled(info.access_info) ?? garden.access_info,
    parking_info: filled(info.parking_info) ?? garden.parking_info,
    phone: filled(info.phone) ?? garden.phone,
    website_url: filled(info.website_url) ?? garden.website_url,
    social_instagram: filled(info.instagram_url) ?? garden.social_instagram,
    image_url: info.photos[0] ?? garden.image_url,
    experience_programs: filled(info.taiken_info) ? true : garden.experience_programs,
    online_sales: filled(info.shop_url) ? true : garden.online_sales,
  }
}

export function ownerShop(info: GardenOwnerInfo | undefined): GardenShop | null {
  const url = filled(info?.shop_url)
  return url ? { url, type: '自社通販' } : null
}

export const formatYen = (n: number) => `${n.toLocaleString('ja-JP')}円`
