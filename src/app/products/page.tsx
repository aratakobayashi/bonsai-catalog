import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SHOP_NAMES_AND } from '@/lib/affiliate'
import { getCatalogProducts } from '@/lib/catalog-data'
import { ProductsView } from '@/components/catalog/ProductsView'
import { ProductsClient } from './ProductsClient'

const TITLE = `盆栽・苔玉を探す｜${SHOP_NAMES_AND}の盆栽を価格・樹種・サイズで比較 - 盆栽コレクション`
const DESCRIPTION = `${SHOP_NAMES_AND}の盆栽・苔玉・盆栽鉢・土・道具を、樹種・価格・サイズ・送料込・レビュー件数でまとめて絞り込み、比較できます。`

// 絞り込み・ページ送りのURLは、一覧トップを正規のURLにする（条件付きのURLは robots.txt で巡回させない）
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/products' },
}

// ビルド時に条件なしの一覧を作り置きし、条件付きのURL（?max=3000 など）はブラウザで描き直す
export default async function ProductsPage() {
  const all = await getCatalogProducts()
  const view = <ProductsView all={all} params={{}} />
  return (
    <Suspense fallback={view}>
      <ProductsClient>{view}</ProductsClient>
    </Suspense>
  )
}
