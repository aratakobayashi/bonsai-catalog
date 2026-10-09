import Link from 'next/link'
import { SHOP_CATEGORIES } from '@/lib/shop-categories'

// 商品データを一時的に取得できなかったときの一覧ページ（例外を投げずにこのページを出す）
export function CatalogLoadError({ title, retryHref = '/products' }: { title?: string; retryHref?: string }) {
  const links = SHOP_CATEGORIES.filter(c => ['goyomatsu', 'kuromatsu', 'momiji', 'hachi', 'dougu'].includes(c.slug))
  return (
    <div className="mx-auto max-w-[720px] px-4 py-14 lg:py-20">
      {title && <h1 className="mb-3 font-mincho text-2xl font-bold tracking-[0.06em] text-ink">{title}</h1>}
      <p className="font-mincho text-base font-bold text-ink" role="status">商品を読み込めませんでした。時間をおいて再度お試しください。</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">通信が混み合っているか、一時的に商品データを取得できない状態です。</p>
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        {/* 読み込み直しは、ブラウザに残った表示を使わないよう通常のリンクにする */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href={retryHref} className="flex h-11 items-center bg-sumi px-5 tracking-[0.06em] text-white hover:bg-sumi-light hover:text-white">読み込み直す</a>
        <Link href="/" className="flex h-11 items-center border border-line px-5 text-ink hover:border-ink">トップへ戻る</Link>
      </div>
      <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <Link href="/guides" className="inline-flex min-h-11 items-center text-ink underline decoration-line underline-offset-4">育て方を読む</Link>
        <Link href="/selection" className="inline-flex min-h-11 items-center text-ink underline decoration-line underline-offset-4">特集から探す</Link>
        {links.map(c => (
          <Link key={c.slug} href={`/products/category/${c.slug}`} className="inline-flex min-h-11 items-center text-ink underline decoration-line underline-offset-4">{c.name}</Link>
        ))}
      </div>
    </div>
  )
}
