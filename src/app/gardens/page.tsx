import { Metadata } from 'next'
import { supabaseServer } from '@/lib/supabase-server'
import { isGardenPublished } from '@/lib/garden-verification'
import type { Garden } from '@/types'
import { GardensPageClient } from './GardensPageClient'
import { compareGardens } from '@/components/gardens/GardenParts'

export const metadata: Metadata = {
  title: '全国の盆栽園一覧｜都道府県から探す - 盆栽コレクション',
  description: '全国の盆栽園・盆栽店を都道府県から探せます。所在地・営業時間・アクセス・取り扱い樹種などをまとめています。',
  alternates: { canonical: '/gardens' },
}

async function getGardens(): Promise<Garden[]> {
  const { data, error } = await supabaseServer
    .from('gardens')
    // 一覧に必要な項目だけを取得する（ページの容量を減らして表示を速くするため）
    .select('id, name, prefecture, city, address, description, latitude, longitude, business_hours, phone, website_url, specialties, online_sales, experience_programs, image_url, featured, created_at')
    .order('name', { ascending: true })

  if (error) {
    console.error('盆栽園データの取得エラー:', error)
    return []
  }

  // 仮の画像サービスやダミーURLは画像なしとして扱う
  // 実在が確認できない・閉園した園は一覧に出さない
  // 並びは都道府県（北から南）→ 市区町村 → 園名の順
  return ((data || []) as Garden[]).filter(garden => isGardenPublished(garden)).map(garden => ({
    ...garden,
    image_url: garden.image_url && !/via\.placeholder\.com|example\.com/.test(garden.image_url) ? garden.image_url : undefined,
  })).sort(compareGardens)
}

export default async function GardensPage() {
  const gardens = await getGardens()

  return <GardensPageClient gardens={gardens} />
}
