import type { Metadata } from 'next'
import { CONTAINER } from '@/components/ui/design'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { FavoritesView } from './FavoritesView'
import { RelatedTools } from '@/components/layout/RelatedTools'

interface FavoritesPageProps {
  searchParams: Record<string, string | string[] | undefined>
}

// ブラウザに保存した「気になる」の一覧なので、検索結果には出さない
export const metadata: Metadata = {
  title: '気になる盆栽を比べる - 盆栽コレクション',
  description: '「気になる」に入れた盆栽を、価格・サイズ・見頃・置き場所で並べて比べられます。',
  alternates: { canonical: '/favorites' },
  robots: { index: false, follow: true },
}

// 共有されたURL（/favorites?ids=a,b）の id。形式が正しいものだけ、30件まで
function parseIds(value: string | string[] | undefined): string[] {
  const raw = Array.isArray(value) ? value.join(',') : value ?? ''
  return Array.from(new Set(raw.split(',').map(v => v.trim()).filter(v => /^[\w-]{1,64}$/.test(v)))).slice(0, 30)
}

export default function FavoritesPage({ searchParams }: FavoritesPageProps) {
  return (
    <div className={`${CONTAINER} pb-16`}>
      {/* 販売ページへのボタンが並ぶため、PR表記は内容より先に出す */}
      <PrDisclosure compact className="pt-4 lg:pt-6" />
      <FavoritesView sharedIds={parseIds(searchParams.ids)} />
      <RelatedTools hrefs={['/soroeru', '/note', '/okurimono']} />
    </div>
  )
}
