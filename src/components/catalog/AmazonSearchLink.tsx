import { AFFILIATE_LINK_REL, AMAZON_LINKS_ENABLED, amazonSearchUrl } from '@/lib/affiliate'

// Amazon の検索結果へのボタン（価格・画像は出さない）。楽天の商品や一覧の下に「Amazonでも探す」として添える
// 楽天のボタン（墨の塗り）より控えめな枠線のボタンにし、行き先が Amazon であることを文言に書く
// クリックは GoogleAnalytics の affiliate_click（shop=amazon）として、data-place と一緒に記録される
export function AmazonSearchLink({ keyword, label, place, className = '', block = false }: { keyword: string; label?: string; place: string; className?: string; block?: boolean }) {
  if (!AMAZON_LINKS_ENABLED) return null
  return (
    <div data-place={place} className={`${block ? 'flex' : 'inline-flex'} flex-col gap-1 ${className}`}>
      <a
        href={amazonSearchUrl(keyword)}
        target="_blank"
        rel={AFFILIATE_LINK_REL}
        className={`${block ? 'flex w-full' : 'inline-flex'} min-h-11 items-center justify-center gap-2 border border-ink bg-white px-4 text-[13px] text-ink hover:border-gold-dark hover:text-gold-dark`}
      >
        {label ?? `Amazonで「${keyword}」を探す`}<span aria-hidden="true">↗</span>
      </a>
      <span className="text-[10.5px] text-ink-muted">PR・Amazon の検索結果が開きます</span>
    </div>
  )
}
