import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getCatalogProducts } from '@/lib/catalog-data'
import { SoroeruView } from './SoroeruView'
import { SoroeruClient } from './SoroeruClient'

export const metadata: Metadata = {
  title: '盆栽の鉢・土・道具をそろえる｜樹の種類と大きさに合う号数・配合・道具の目安 - 盆栽コレクション',
  description: '樹の種類（松柏類・雑木類・花もの・さつき・室内向き）と大きさ、目的（はじめての手入れ・植え替え）を選ぶと、合う鉢の号数、用土の配合、そろえたい道具の目安と、楽天市場で買える商品をまとめて表示します。',
  alternates: { canonical: '/soroeru' },
}

// 既定の表示を作り置きし、条件付きのURL（選んだあとの答えなど）はブラウザで描き直す
export default async function Page() {
  const products = await getCatalogProducts()
  const view = <SoroeruView params={{}} products={products} />
  return (
    <Suspense fallback={view}>
      <SoroeruClient>{view}</SoroeruClient>
    </Suspense>
  )
}
