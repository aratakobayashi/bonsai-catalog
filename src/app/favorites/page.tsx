import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CONTAINER } from '@/components/ui/design'
import { FavoritesView } from './FavoritesView'
import { SharedFavorites } from './SharedFavorites'
import { RelatedTools } from '@/components/layout/RelatedTools'

// ブラウザに保存した「気になる」の一覧なので、検索結果には出さない
export const metadata: Metadata = {
  title: '気になる盆栽を比べる - 盆栽コレクション',
  description: '「気になる」に入れた盆栽を、価格・サイズ・見頃・置き場所で並べて比べられます。',
  alternates: { canonical: '/favorites' },
  robots: { index: false, follow: true },
}

export default function FavoritesPage() {
  return (
    <div className={`${CONTAINER} pb-16`}>
      {/* 販売ページへのボタンが並ぶため、PR表記は内容より先に出す */}
      {/* 共有されたURL（/favorites?ids=a,b）は、ブラウザで id を読む */}
      <Suspense fallback={<FavoritesView sharedIds={[]} />}>
        <SharedFavorites />
      </Suspense>
      <RelatedTools hrefs={['/soroeru', '/note', '/okurimono']} />
    </div>
  )
}
