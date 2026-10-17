// 盆栽園の一覧（盆栽園一覧と、都道府県ごとのまとめページで共通）。ビルド時に取得する
import { supabaseServer } from '@/lib/supabase-server'
import { isGardenPublished } from '@/lib/garden-verification'
import type { Garden } from '@/types'
import type { GardenListItem } from '@/app/gardens/GardensPageClient'
import { compareGardens, gardenSummary } from '@/components/gardens/GardenParts'

let memo: Promise<GardenListItem[]> | null = null

async function loadGardenList(): Promise<GardenListItem[]> {
  const { data, error } = await supabaseServer
    .from('gardens')
    // 一覧に必要な項目だけを取得する（ページの容量を減らして表示を速くするため）
    .select('id, name, prefecture, city, address, description, latitude, longitude, phone, website_url, online_sales, experience_programs')
    .order('name', { ascending: true })

  // 取れなかったときはビルドを止める（空の一覧を公開しない）
  if (error) throw new Error(`盆栽園データの取得エラー: ${error.message}`)

  // 実在が確認できない・閉園した園は一覧に出さない
  // 並びは都道府県（北から南）→ 市区町村 → 園名の順
  // 説明は「◯◯にある盆栽園。日本盆栽協同組合の組合員。」のような定型文なら送らない
  return ((data || []) as Garden[])
    .filter(garden => isGardenPublished(garden))
    .sort(compareGardens)
    .map(g => ({
      id: g.id,
      name: g.name,
      prefecture: g.prefecture || '',
      city: g.city || '',
      address: g.address,
      summary: gardenSummary(g),
      latitude: typeof g.latitude === 'number' ? g.latitude : undefined,
      longitude: typeof g.longitude === 'number' ? g.longitude : undefined,
      phone: g.phone || undefined,
      website_url: g.website_url || undefined,
      online_sales: Boolean(g.online_sales),
      experience_programs: Boolean(g.experience_programs),
    }))
}


export function getGardenList(): Promise<GardenListItem[]> {
  if (!memo) {
    memo = loadGardenList()
    memo.catch(() => { memo = null })
  }
  return memo
}
