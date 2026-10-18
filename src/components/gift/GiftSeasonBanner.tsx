import Image from 'next/image'
import Link from 'next/link'
import { activeGiftSeasons } from '@/lib/gift-seasons'

// いまの時期の贈り物（お歳暮・クリスマス・母の日など）。時期でないときは何も出さない
// placement：トップ（home）か贈り物ナビ（okurimono）か。贈り物ナビでは、ナビへのリンクを「この場面で選ぶ」に変える
export default function GiftSeasonBanner({ placement, className = '' }: { placement: 'home' | 'okurimono'; className?: string }) {
  const seasons = activeGiftSeasons()
  if (seasons.length === 0) return null
  return (
    <section aria-labelledby={`gift-season-${placement}`} className={className}>
      <p id={`gift-season-${placement}`} className="text-[11.5px] tracking-[0.14em] text-gold-dark">いまの時期の贈り物</p>
      <ul className={`mt-2 grid gap-3 ${seasons.length > 1 ? 'lg:grid-cols-2' : ''}`}>
        {seasons.map(s => (
          <li key={s.key} className="flex overflow-hidden border border-line bg-white">
            <Link href={`/guides/${s.guide}`} className="relative w-[104px] shrink-0 bg-ink sm:w-[150px] lg:w-[180px]" tabIndex={-1} aria-hidden="true">
              <Image src={s.photo} alt="" fill sizes="180px" className="object-cover" />
            </Link>
            <div className="min-w-0 flex-1 px-3.5 py-3 lg:px-5 lg:py-4">
              <p className="font-mincho text-[17px] font-bold tracking-[0.05em] text-ink lg:text-[20px]">{s.label}に盆栽を</p>
              <p className="mt-1 text-[12.5px] leading-[1.6] text-ink-muted lg:text-[13.5px]">{s.deadline}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] lg:text-[14px]">
                <Link href={`/guides/${s.guide}`} className="inline-flex min-h-[36px] items-center bg-ink px-3.5 font-bold text-white hover:bg-ink/85">
                  {s.guideLabel} ›
                </Link>
                {s.selection && (
                  <Link href={`/selection/${s.selection}`} className="inline-flex min-h-[36px] items-center text-ink underline decoration-line underline-offset-4 hover:text-gold-dark">
                    {s.selectionLabel}
                  </Link>
                )}
                {s.scene && (
                  <Link
                    href={placement === 'okurimono' ? `/okurimono?who=family&scene=${s.scene}&budget=5000#result` : `/okurimono?scene=${s.scene}#result`}
                    className="inline-flex min-h-[36px] items-center text-ink underline decoration-line underline-offset-4 hover:text-gold-dark"
                  >
                    {placement === 'okurimono' ? 'この場面で選ぶ' : '贈り物ナビで選ぶ'}
                  </Link>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
