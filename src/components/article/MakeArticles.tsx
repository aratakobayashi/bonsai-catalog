import Image from 'next/image'
import Link from 'next/link'

// 「作ってみる」：苔玉・挿し木・実生など、自分で作る・増やす記事への入口（トップと /guides）
// 画像は記事のサムネイル（public/images/articles/thumbs/<slug>.jpg）
export const MAKE_ARTICLES = [
  { slug: 'kokedama-making', label: '苔玉の作り方', note: '土・苔・7つの手順' },
  { slug: 'moss-terrarium', label: '苔テラリウム', note: 'ガラスの中に苔の景色' },
  { slug: 'bonsai-from-nursery-stock', label: '苗木から盆栽を作る', note: '選び方と最初の手順' },
  { slug: 'bonsai-forest-planting', label: '寄せ植えで森を作る', note: '本数と並べ方' },
  { slug: 'bonsai-cuttings', label: '挿し木で増やす', note: '時期と挿し穂の作り方' },
  { slug: 'bonsai-from-seed', label: '種から育てる', note: '採り方・まき時・発芽後' },
] as const

export function MakeArticles({ className = '', headingLevel = 2 }: { className?: string; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <section aria-labelledby="make-articles" className={className}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <H id="make-articles" className="font-mincho text-xl font-bold tracking-[0.06em] text-ink lg:text-[24px]">作ってみる</H>
        <p className="text-[12.5px] text-ink-muted">苔玉・寄せ植え・挿し木。手を動かして盆栽を楽しむ</p>
        <Link href="/taiken" className="-my-3 ml-auto inline-flex min-h-11 items-center text-[13px] text-ink lg:my-0 lg:min-h-0">
          <span className="border-b border-ink pb-0.5">教室で習う</span>
        </Link>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-3.5 gap-y-5 sm:grid-cols-3 lg:mt-6 lg:grid-cols-6 lg:gap-5">
        {MAKE_ARTICLES.map(a => (
          <li key={a.slug} className="min-w-0">
            <Link href={`/guides/${a.slug}`} className="group block">
              <span className="relative block aspect-[40/21] overflow-hidden bg-paper-deep">
                <Image src={`/images/articles/thumbs/${a.slug}.jpg`} alt="" fill sizes="(max-width: 639px) 46vw, (max-width: 1023px) 30vw, 180px" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
              </span>
              <span className="mt-2 block font-mincho text-[15px] font-bold leading-snug text-ink group-hover:text-gold-dark">{a.label}</span>
              <span className="mt-0.5 block text-[12px] text-ink-muted">{a.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
