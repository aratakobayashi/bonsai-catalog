import { Metadata } from 'next'
import { supabaseServer } from '@/lib/supabase-server'
import { isGardenPublished } from '@/lib/garden-verification'
import type { Garden } from '@/types'
import { GardensPageClient, type GardenListItem } from './GardensPageClient'
import { compareGardens, gardenSummary } from '@/components/gardens/GardenParts'
import { getCatalogProducts } from '@/lib/catalog-data'
import type { CatalogProduct } from '@/lib/catalog-model'
import { GardenShopBridge, pickBridgeProducts } from '@/components/gardens/GardenShopBridge'

export const metadata: Metadata = {
  title: '全国の盆栽園一覧｜都道府県・現在地から探す - 盆栽コレクション',
  description: '全国の盆栽園・盆栽店を都道府県や現在地から探せます。所在地・地図・公式サイト・電話番号、体験教室やオンライン購入の有無をまとめています。',
  alternates: { canonical: '/gardens' },
}

async function getGardens(): Promise<GardenListItem[]> {
  const { data, error } = await supabaseServer
    .from('gardens')
    // 一覧に必要な項目だけを取得する（ページの容量を減らして表示を速くするため）
    .select('id, name, prefecture, city, address, description, latitude, longitude, phone, website_url, online_sales, experience_programs')
    .order('name', { ascending: true })

  if (error) {
    console.error('盆栽園データの取得エラー:', error)
    return []
  }

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

export const revalidate = 21600

export default async function GardensPage() {
  const [gardens, products] = await Promise.all([getGardens(), getCatalogProducts().catch(() => [] as CatalogProduct[])])
  // 商品が取れなかったときはビルドを止める（空のページを公開しない。前の公開がそのまま残る）
  if (products.length === 0) throw new Error('商品データを取得できませんでした')
  // 一覧の途中に出す、通販への案内（盆栽園を探しに来た人に、近くにない・すぐ欲しいときの選択肢として）
  const bridge = <GardenShopBridge products={pickBridgeProducts(products)} className="my-6 lg:my-8" />

  return <GardensPageClient gardens={gardens} shopBridge={bridge} />
}
