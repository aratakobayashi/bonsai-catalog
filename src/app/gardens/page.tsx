import { Metadata } from 'next'
import Link from 'next/link'
import { GardensPageClient } from './GardensPageClient'
import { getGardenList } from '@/lib/gardens-list'
import { GardenAreaLinks } from '@/components/gardens/GardenAreaLinks'
import { getCatalogProducts } from '@/lib/catalog-data'
import type { CatalogProduct } from '@/lib/catalog-model'
import { GardenShopBridge, pickBridgeProducts } from '@/components/gardens/GardenShopBridge'

export const metadata: Metadata = {
  title: '全国の盆栽園一覧｜都道府県・現在地から探す - 盆栽コレクション',
  description: '全国の盆栽園・盆栽店を都道府県や現在地から探せます。所在地・地図・公式サイト・電話番号、体験教室やオンライン購入の有無をまとめています。',
  alternates: { canonical: '/gardens' },
}

export const revalidate = 21600

export default async function GardensPage() {
  const [gardens, products] = await Promise.all([getGardenList(), getCatalogProducts().catch(() => [] as CatalogProduct[])])
  // 商品が取れなかったときはビルドを止める（空のページを公開しない。前の公開がそのまま残る）
  if (products.length === 0) throw new Error('商品データを取得できませんでした')
  // 一覧の途中に出す、通販への案内（盆栽園を探しに来た人に、近くにない・すぐ欲しいときの選択肢として）
  const bridge = <GardenShopBridge products={pickBridgeProducts(products)} className="my-6 lg:my-8" />

  return (
    <>
      <GardensPageClient gardens={gardens} shopBridge={bridge} />
      {/* 都道府県ごとのまとめページへ（検索から地域名で探す人の入口） */}
      <GardenAreaLinks gardens={gardens} className="mx-auto max-w-[1280px] px-4 pb-8 lg:px-12" />
      {/* 盆栽園の方への案内（掲載情報の追加・修正） */}
      <p className="mx-auto max-w-[1280px] px-4 pb-16 text-[13px] text-ink-muted lg:px-12">
        盆栽園・盆栽店の方へ：
        <Link href="/gardens/owners" className="border-b border-ink-muted text-ink hover:text-gold-dark">掲載情報の追加・修正（無料）</Link>
      </p>
    </>
  )
}
