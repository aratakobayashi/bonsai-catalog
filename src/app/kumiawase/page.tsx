import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getCatalogProducts } from '@/lib/catalog-data'
import { KumiawaseView } from './KumiawaseView'
import { KumiawaseClient } from './KumiawaseClient'

export const metadata: Metadata = {
  title: '組み合わせで選ぶ自分だけの一鉢｜樹・大きさ・鉢・仕上げから盆栽を探す - 盆栽コレクション',
  description:
    'もみじ・五葉松・桜・苔玉などの樹、大きさ、鉢の色と形、苔付き・石付き・受け皿付きなどの仕上げを順に選ぶと、植え付け済みで届く楽天市場の盆栽から組み合わせに合うものを探せます。届いたらそのまま飾れ、植え付けの手間はかかりません。',
  alternates: { canonical: '/kumiawase' },
}

// 既定の表示を作り置きし、条件付きのURL（選んだあとの答えなど）はブラウザで描き直す
export default async function Page() {
  const products = await getCatalogProducts()
  const view = <KumiawaseView params={{}} products={products} />
  return (
    <Suspense fallback={view}>
      <KumiawaseClient>{view}</KumiawaseClient>
    </Suspense>
  )
}
