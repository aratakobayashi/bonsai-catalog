import { AFFILIATE_LINK_REL, AMAZON_LINKS_ENABLED, amazonSearchUrl } from '@/lib/affiliate'
import type { AmazonPickSet } from '@/lib/amazon-picks'

// 話題に合う道具・用品を、Amazon の検索結果への文字のリンクで並べる（価格・画像は出さない）
// クリックは GoogleAnalytics の affiliate_click（shop=amazon）として、data-place と一緒に記録される
export function AmazonPicks({ set, place, className = '' }: { set: AmazonPickSet | null; place: string; className?: string }) {
  if (!AMAZON_LINKS_ENABLED || !set || set.picks.length === 0) return null
  return (
    <section data-place={place} className={`border-t border-ink pt-6 ${className}`}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-mincho text-[18px] font-bold tracking-[0.05em] text-ink lg:text-[20px]">{set.heading}</h2>
        <span className="text-[11px] text-ink-muted"><span className="mr-1.5 text-ink-soft">PR</span>Amazonアソシエイト</span>
      </div>
      {set.note && <p className="mt-1.5 text-[12px] leading-[1.8] text-ink-muted">{set.note}</p>}
      <ul className="mt-3 grid border-t border-line sm:grid-cols-2 sm:gap-x-8">
        {set.picks.map(pick => (
          <li key={pick.keyword} className="border-b border-line">
            <a href={amazonSearchUrl(pick.keyword)} target="_blank" rel={AFFILIATE_LINK_REL} className="group flex min-h-[52px] items-center gap-3 py-2.5">
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-bold text-ink group-hover:text-gold-dark">{pick.label}</span>
                {pick.note && <span className="block text-[11.5px] leading-[1.6] text-ink-muted">{pick.note}</span>}
              </span>
              <span className="flex-none text-[12px] text-ink-soft group-hover:text-gold-dark">Amazonで探す<span className="ml-1" aria-hidden="true">↗</span></span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
