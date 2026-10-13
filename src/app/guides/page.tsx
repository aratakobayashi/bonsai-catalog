import { Metadata } from 'next'
import { Suspense } from 'react'
import { GuidesView } from '@/components/features/GuidesView'
import { getGuidesData } from '@/lib/guides-data'
import { GuidesClient } from './GuidesClient'

export const metadata: Metadata = {
  title: '盆栽ガイド記事一覧 - 盆栽コレクション',
  description: '盆栽の育て方、選び方、種類別ガイドなど、盆栽に関する詳しい情報をお届けします。初心者から上級者まで役立つコンテンツを豊富にご用意しています。',
  keywords: '盆栽, 育て方, 管理, ガイド, 初心者, もみじ, 松, 桜, コツ',
  alternates: { canonical: '/guides' },
  openGraph: {
    title: '盆栽ガイド記事一覧 - 盆栽コレクション',
    description: '盆栽の育て方、選び方、種類別ガイドなど、盆栽に関する詳しい情報をお届けします。',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '盆栽ガイド記事一覧 - 盆栽コレクション',
    description: '盆栽の育て方、選び方、種類別ガイドなど、盆栽に関する詳しい情報をお届けします。',
  },
}

// 条件なしの1ページ目を作り置きし、カテゴリ・検索・並び順・ページ送りはブラウザで描き直す
export default async function ArticlesPage() {
  const data = await getGuidesData()
  const view = <GuidesView data={data} params={{}} />
  return (
    <Suspense fallback={view}>
      <GuidesClient>{view}</GuidesClient>
    </Suspense>
  )
}
