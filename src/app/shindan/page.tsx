import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SHOP_NAMES_AND } from '@/lib/affiliate'
import { getCatalogProducts } from '@/lib/catalog-data'
import { ShindanView } from './ShindanView'
import { ShindanClient } from './ShindanClient'

// 診断ページそのものは検索結果に出し、回答後の結果ページは出さない
export const metadata: Metadata = {
  title: 'かんたん盆栽診断｜4つの質問であなたに合う盆栽を探す - 盆栽コレクション',
  description: `置き場所・予算・楽しみ方など4つの質問に答えるだけで、${SHOP_NAMES_AND}の盆栽から合いそうな商品を探せます。はじめての方や贈り物選びにも。`,
  alternates: { canonical: '/shindan' },
}

// 既定の表示を作り置きし、条件付きのURL（選んだあとの答えなど）はブラウザで描き直す
export default async function Page() {
  const products = await getCatalogProducts()
  const view = <ShindanView params={{}} products={products} />
  return (
    <Suspense fallback={view}>
      <ShindanClient>{view}</ShindanClient>
    </Suspense>
  )
}
