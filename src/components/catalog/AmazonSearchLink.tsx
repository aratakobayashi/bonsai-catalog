import { AFFILIATE_LINK_REL, AMAZON_LINKS_ENABLED, amazonSearchUrl } from '@/lib/affiliate'

// Amazon の検索結果への文字のリンク（価格・画像は出さない）。道具・土・鉢の行の下に添える
// クリックは GoogleAnalytics の affiliate_click（shop=amazon）として、近くの data-place と一緒に記録される
export function AmazonSearchLink({ keyword, label, place, className = '' }: { keyword: string; label?: string; place: string; className?: string }) {
  if (!AMAZON_LINKS_ENABLED) return null
  return (
    <p data-place={place} className={`text-[12.5px] text-ink-soft ${className}`}>
      <a href={amazonSearchUrl(keyword)} target="_blank" rel={AFFILIATE_LINK_REL} className="inline-flex min-h-11 items-center border-b border-line hover:border-gold-dark hover:text-gold-dark">
        {label ?? `Amazonで「${keyword}」を探す`}<span className="ml-1" aria-hidden="true">↗</span>
      </a>
      <span className="ml-2 text-[11px] text-ink-muted">PR</span>
    </p>
  )
}
