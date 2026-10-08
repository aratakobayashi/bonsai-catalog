import Link from 'next/link'
import { CONTAINER } from '@/components/ui/design'

const DESTINATIONS = [
  { href: '/products', title: '探す', body: '盆栽・鉢・道具を比べる' },
  { href: '/guides', title: '育て方', body: '記事とよくある質問' },
  { href: '/gardens', title: '出かける', body: '盆栽園・イベント' },
  { href: '/', title: 'ホーム', body: 'トップページへ' },
]

export default function NotFound() {
  return (
    <div className={`${CONTAINER} pb-14 pt-12 text-center lg:pb-16 lg:pt-20`}>
      <p className="text-[13px] font-bold tracking-[0.2em] text-gold">404</p>
      <h1 className="mt-2 font-mincho text-2xl font-bold leading-snug text-navy lg:text-[34px]">
        お探しのページが<br className="lg:hidden" />見つかりませんでした
      </h1>
      <p className="mt-4 text-[13.5px] leading-[1.9] text-ink-soft lg:text-[14.5px]">
        ページが移動したか、削除された可能性があります。
        <span className="hidden lg:inline"><br />キーワードで探すか、下のページからお進みください。</span>
      </p>

      {/* 商品一覧の検索に送る（JavaScript なしでも動くフォーム） */}
      <form action="/products" method="get" role="search" className="mx-auto mt-6 flex max-w-[540px] items-center rounded-xl border border-navy bg-white p-1.5 lg:mt-8">
        <input
          type="search"
          name="q"
          required
          placeholder="樹種・商品名・記事を検索"
          aria-label="サイト内を検索"
          className="h-10 min-w-0 flex-1 bg-transparent px-2.5 text-[14px] text-ink placeholder:text-ink-muted outline-none"
        />
        <button type="submit" className="hidden h-10 shrink-0 rounded-lg bg-navy px-4 text-[13.5px] font-bold text-white hover:bg-navy-light lg:block">
          検索
        </button>
      </form>

      <nav aria-label="おもなページ" className="mx-auto mt-5 grid max-w-[720px] grid-cols-2 gap-2.5 text-left lg:mt-8 lg:grid-cols-4 lg:gap-3">
        {DESTINATIONS.map(d => (
          <Link key={d.href} href={d.href} className="rounded-xl border border-line bg-white px-4 py-3.5 hover:border-gold lg:py-4 lg:pb-6">
            <span className="block text-[14.5px] font-bold text-navy">{d.title}</span>
            <span className="mt-0.5 block text-[12px] leading-relaxed text-ink-soft">{d.body}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
