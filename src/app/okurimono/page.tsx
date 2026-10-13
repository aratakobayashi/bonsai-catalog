import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getCatalogProducts } from '@/lib/catalog-data'
import { getArticleOverride, thumbnailPath } from '@/lib/article-overrides'
import { OkurimonoView, type ArticleMeta } from './OkurimonoView'
import { OkurimonoClient } from './OkurimonoClient'
import { SCENE_GUIDES, SCENE_OPTIONS } from '@/lib/okurimono'

// 入口のページは検索結果に出し、選んだあとの組み合わせごとのページは出さない
export const metadata: Metadata = {
  title: '贈り物ナビ｜相手・場面・予算から選ぶ盆栽と、のし・届ける時期の目安 - 盆栽コレクション',
  description: '贈る相手・場面・予算の3つを選ぶと、楽天市場に掲載中の盆栽から贈り物に向く3鉢を理由つきで選びます。母の日・敬老の日・長寿祝い・新築・開店祝いなど、場面ごとののしの表書きと届ける時期の目安、避けたいことも一緒にまとめました。',
  alternates: { canonical: '/okurimono' },
}

// 既定の表示を作り置きし、条件付きのURL（選んだあとの答えなど）はブラウザで描き直す
export default async function Page() {
  const products = await getCatalogProducts()
  const articleMeta: ArticleMeta = Object.fromEntries((Array.from(new Set([...SCENE_OPTIONS.flatMap(o => SCENE_GUIDES[o.value].articles), 'article-34', 'article-28']))).map(slug => [slug, { title: getArticleOverride(slug)?.title ?? slug, image: thumbnailPath(slug) ?? null }]))
  const view = <OkurimonoView params={{}} products={products} articleMeta={articleMeta} />
  return (
    <Suspense fallback={view}>
      <OkurimonoClient articleMeta={articleMeta}>{view}</OkurimonoClient>
    </Suspense>
  )
}
