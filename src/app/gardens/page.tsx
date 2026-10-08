import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MapPin, Globe, Phone, ExternalLink, Users, Calendar } from 'lucide-react'
import { REGIONS, getRegionFromPrefecture, getRegionTheme } from '@/lib/utils'
import type { Garden } from '@/types'
import { GardensPageClient } from './GardensPageClient'

export const metadata: Metadata = {
  title: '全国の盆栽園一覧｜都道府県から探す - 盆栽コレクション',
  description: '全国の盆栽園・盆栽店を都道府県から探せます。所在地・営業時間・アクセス・取り扱い樹種などをまとめています。',
  alternates: { canonical: '/gardens' },
}

async function getGardens(): Promise<Garden[]> {
  const { data, error } = await supabaseServer
    .from('gardens')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('盆栽園データの取得エラー:', error)
    return []
  }

  // 仮の画像サービスやダミーURLは画像なしとして扱う
  // 実在が確認できない・閉園した園は一覧に出さない
  return ((data || []) as Garden[]).filter(garden => garden.is_published !== false).map(garden => ({
    ...garden,
    image_url: garden.image_url && !/via\.placeholder\.com|example\.com/.test(garden.image_url) ? garden.image_url : undefined,
  }))
}


export default async function GardensPage() {
  const gardens = await getGardens()

  return <GardensPageClient gardens={gardens} />
}