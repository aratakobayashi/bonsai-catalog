import Link from 'next/link'
import { OSUSUME_METHOD, OSUSUME_THEMES } from '@/lib/osusume'

// おすすめの特集を切り替える札（いまの特集は塗り）
export function OsusumeTabs({ current }: { current?: string }) {
  return (
    <nav aria-label="おすすめの種類" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0 [&::-webkit-scrollbar]:hidden">
      {OSUSUME_THEMES.map(t => {
        const active = t.slug === current
        return (
          <Link
            key={t.slug}
            href={`/osusume/${t.slug}`}
            aria-current={active ? 'page' : undefined}
            className={`inline-flex min-h-11 flex-none items-center border px-4 text-[13.5px] ${active ? 'border-sumi bg-sumi text-white' : 'border-line bg-white text-ink hover:border-ink'}`}
          >
            {t.label}
          </Link>
        )
      })}
    </nav>
  )
}

// 点数の付け方（開閉できる。最初は閉じる）
export function OsusumeMethod({ updated }: { updated: string | null }) {
  return (
    <details className="group mt-10 border border-line bg-white lg:mt-14">
      <summary className="flex min-h-[56px] cursor-pointer list-none items-center gap-3 px-4 py-3 lg:px-6 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1">
          <span className="block font-mincho text-[16px] font-bold text-ink">どうやって選んでいるか</span>
          <span className="block text-[12px] text-ink-muted">点数の付け方を公開しています{updated ? `（データ：${updated}時点）` : ''}</span>
        </span>
        <span className="text-ink-muted transition-transform group-open:rotate-90" aria-hidden="true">›</span>
      </summary>
      <ol className="border-t border-line px-4 py-4 text-[13px] leading-[1.9] text-ink-soft lg:px-6">
        {OSUSUME_METHOD.map((m, i) => (
          <li key={m} className="flex gap-3 py-1">
            <span className="flex-none font-mincho text-gold-dark">{i + 1}</span>
            <span>{m}</span>
          </li>
        ))}
      </ol>
    </details>
  )
}
