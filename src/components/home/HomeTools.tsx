import Image from 'next/image'
import Link from 'next/link'
import { CareIcon } from '@/components/catalog/CareIcon'
import { ProductThumb } from '@/components/catalog/ProductThumb'
import { SITE_TOOLS } from '@/components/layout/site-tools'
import { CARE_GROUPS, getMonthCare } from '@/lib/care-calendar'
import { COLOR_OPTIONS, type ColorKey, type TreeOption } from '@/lib/kumiawase'
import type { CatalogProduct } from '@/lib/catalog-model'
import photoCredits from '@/data/photo-credits.json'

// トップの「迷ったら、ここから」：墨色の帯に、実物の写真で3つの機能を大きく見せ、残りは写真のタイルで並べる。
// 写真は無料で使える実物の盆栽写真（出典は src/data/photo-credits.json。帯の下にまとめて表示する）
const MAIN = ['/shindan', '/kumiawase', '/teire']

const SHINDAN_PHOTO = '/images/articles/photos/article-10-1.jpg'
// 今月の手入れの写真（季節ごと）
const SEASON_PHOTO: Record<number, string> = {
  12: '/images/articles/photos/article-7-2.jpg', 1: '/images/articles/photos/article-7-2.jpg', 2: '/images/articles/photos/article-7-2.jpg',
  3: '/images/articles/photos/article-46-1.jpg', 4: '/images/articles/photos/article-46-1.jpg', 5: '/images/articles/photos/article-46-1.jpg',
  6: '/images/articles/photos/bonsai-diplomacy-gift-etiquette-2.jpg', 7: '/images/articles/photos/bonsai-diplomacy-gift-etiquette-2.jpg', 8: '/images/articles/photos/bonsai-diplomacy-gift-etiquette-2.jpg',
  9: '/images/articles/photos/bonsai-exhibition-viewing-guide-1.jpg', 10: '/images/articles/photos/bonsai-exhibition-viewing-guide-1.jpg', 11: '/images/articles/photos/bonsai-exhibition-viewing-guide-1.jpg',
}
// そのほかの機能の写真
const TOOL_PHOTO: Record<string, string> = {
  '/okurimono': '/images/selections/photos/bonsai-gift.jpg',
  '/soroeru': '/images/articles/photos/article-16-1.jpg',
  '/shojo': '/images/articles/photos/article-10-2.jpg',
  '/hajimete': '/images/selections/photos/beginner-mini-bonsai.jpg',
  '/zukan': '/images/articles/photos/american-bonsai-west-coast-style-2.jpg',
  '/note': '/images/articles/photos/bonsai-experience-programs-complete-guide-2.jpg',
}

// 診断の最初の質問（/shindan の1問目と同じ選択肢。押すとその答えを選んだ状態で診断が開く）
const FIRST_OPTIONS = [
  { value: 'first', label: '自分用（はじめて）' },
  { value: 'self', label: '自分用（経験あり）' },
  { value: 'gift', label: '贈り物にしたい' },
]

// 今月の手入れから、カードに出す3行（どの樹にも共通すること→樹種のグループごとの最初の作業）
function monthHighlights(month: number): { who: string; title: string }[] {
  const care = getMonthCare(month)
  const rows = care.common.map(task => ({ who: 'どの樹も', title: task.title }))
  for (const group of CARE_GROUPS) {
    const task = care.groups[group.key]?.tasks[0]
    if (task && !rows.some(r => r.title === task.title)) rows.push({ who: group.label, title: task.title })
  }
  return rows.slice(0, 3)
}

type Credit = { creator?: string; license?: string; source?: string }
const CREDITS = photoCredits as Record<string, Credit>

const eyebrow = 'text-[11.5px] tracking-[0.24em] text-gold'
const cardTitle = 'font-mincho text-[21px] font-bold leading-[1.5] tracking-[0.06em] text-white lg:text-[24px]'

export interface PotShowcase {
  tree: TreeOption
  items: { product: CatalogProduct; color: ColorKey }[]
}

export function HomeTools({ month, readyCount, showcase }: { month: number; readyCount: number; showcase: PotShowcase | null }) {
  const care = getMonthCare(month)
  const highlights = monthHighlights(month)
  const others = SITE_TOOLS.filter(t => !MAIN.includes(t.href))
  const seasonPhoto = SEASON_PHOTO[month]
  const usedPhotos = [SHINDAN_PHOTO, seasonPhoto, ...others.map(t => TOOL_PHOTO[t.href]).filter(Boolean)]
  const creditNames = Array.from(new Set(usedPhotos.map(src => CREDITS[src]).filter((c): c is Credit => Boolean(c?.creator)).map(c => `${c.creator}（${c.license}）`)))

  return (
    // 画面の端まで墨色の帯
    <section aria-labelledby="home-tools" className="mt-12 bg-sumi text-white lg:mt-24">
      <div className="mx-auto max-w-[1184px] px-4 pb-10 pt-11 lg:px-12 lg:pb-16 lg:pt-20">
        <div className="lg:flex lg:items-end lg:justify-between lg:gap-10">
          <div>
            <p className={eyebrow}>HOW TO USE</p>
            <h2 id="home-tools" className="mt-2.5 font-mincho text-[26px] font-bold leading-[1.4] tracking-[0.1em] lg:text-[38px]">迷ったら、ここから</h2>
          </div>
          <p className="mt-3 max-w-[420px] text-[13.5px] leading-[1.9] text-white/70 lg:mt-0 lg:text-right">
            質問に答える、鉢を組み合わせる、今月やることを確かめる。盆栽えらびと日々の手入れを、ここから始められます。
          </p>
        </div>

        <div className="mt-7 grid grid-cols-[minmax(0,1fr)] gap-4 lg:mt-12 lg:grid-cols-12 lg:gap-6">
          {/* 壱 かんたん盆栽診断：写真の上で1問目に答えられる */}
          <div className="relative min-h-[600px] overflow-hidden sm:min-h-[520px] lg:col-span-5 lg:row-span-2 lg:min-h-0">
            <Image src={SHINDAN_PHOTO} alt="白い壁の前に置かれた黒松の盆栽" fill sizes="(max-width: 1023px) 100vw, 460px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/45 to-black/85" />
            <div className="relative flex h-full flex-col justify-end p-5 lg:p-8">
              <p className="font-mincho text-[44px] leading-none text-gold/90 lg:text-[56px]">壱</p>
              <p className={`${eyebrow} mt-3`}>かんたん盆栽診断</p>
              <h3 className={`${cardTitle} mt-2`}>4つの質問で、<br />あなたに合う一鉢を</h3>
              <p className="mt-5 text-[13px] font-bold tracking-[0.06em] text-white/90">Q1. どなたが育てますか？</p>
              <div className="mt-2.5 grid grid-cols-[minmax(0,1fr)] gap-2">
                {FIRST_OPTIONS.map(option => (
                  <Link key={option.value} href={`/shindan?who=${option.value}#shindan-form`} className="flex min-h-12 items-center justify-between border border-white/35 bg-black/25 px-4 text-[14px] text-white backdrop-blur-[2px] hover:border-gold hover:bg-black/40 hover:text-white">
                    {option.label}<span aria-hidden="true" className="text-gold">→</span>
                  </Link>
                ))}
              </div>
              <Link href="/shindan" className="mt-4 self-start border-b border-white/50 pb-0.5 text-[12.5px] text-white/85 hover:border-gold hover:text-white">置き場所・予算・楽しみ方も選ぶ</Link>
            </div>
          </div>

          {/* 弐 組み合わせで選ぶ：同じ樹で鉢の違う実際の商品を並べる */}
          <Link href="/kumiawase" className="group flex min-w-0 flex-col bg-[#2c2a25] p-5 hover:bg-[#33302a] lg:col-span-7 lg:p-7">
            <div className="flex items-start gap-4">
              <p className="font-mincho text-[44px] leading-none text-gold/90 lg:text-[48px]">弐</p>
              <div className="min-w-0">
                <p className={eyebrow}>組み合わせで選ぶ</p>
                <h3 className={`${cardTitle} mt-1.5`}>同じ{showcase ? showcase.tree.label : '樹'}でも、鉢で表情が変わる</h3>
              </div>
            </div>
            {showcase && (
              <div className="mt-5 grid grid-cols-3 gap-2 lg:gap-3">
                {showcase.items.map(({ product, color }) => {
                  const c = COLOR_OPTIONS.find(o => o.value === color)!
                  return (
                    <figure key={product.id} className="min-w-0">
                      <div className="relative aspect-square overflow-hidden bg-white">
                        <ProductThumb src={product.imageUrl} alt={product.displayName} sizes="(max-width: 1023px) 30vw, 200px" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                      </div>
                      <figcaption className="mt-2 flex items-center gap-1.5 text-[12px] text-white/80">
                        <span className="h-3 w-3 flex-none rounded-full border border-white/40" style={{ background: c.swatch }} />
                        {c.label}
                      </figcaption>
                    </figure>
                  )
                })}
              </div>
            )}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4">
              <p className="text-[12.5px] text-white/70">樹 → 大きさ → 鉢の色と形 → 苔や石の仕上げ{readyCount > 0 && <>　植え付け済みの<strong className="mx-0.5 font-bold text-white">{readyCount.toLocaleString()}鉢</strong>から</>}</p>
              <span className="inline-flex min-h-11 items-center gap-2 bg-gold px-4 text-[13.5px] font-bold text-sumi group-hover:bg-white">組み合わせを選ぶ<span aria-hidden="true">→</span></span>
            </div>
          </Link>

          {/* 参 今月の手入れ：季節の写真と今月の作業 */}
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] overflow-hidden bg-[#2c2a25] sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:col-span-7">
            <div className="relative aspect-[16/9] sm:aspect-auto">
              <Image src={seasonPhoto} alt="" fill sizes="(max-width: 639px) 100vw, 300px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-[#2c2a25]/40" />
              <p className="absolute bottom-3 left-4 font-mincho text-[40px] font-bold leading-none text-white lg:text-[52px]">{month}<span className="ml-1 text-[18px] lg:text-[20px]">月</span></p>
            </div>
            <div className="flex min-w-0 flex-col p-5 lg:p-6">
              <div className="flex items-start gap-4">
                <p className="font-mincho text-[44px] leading-none text-gold/90 lg:text-[48px]">参</p>
                <div className="min-w-0">
                  <p className={eyebrow}>今月の手入れ</p>
                  <h3 className={`${cardTitle} mt-1.5`}>{care.phase}</h3>
                </div>
              </div>
              <ul className="mt-4 border-t border-white/15">
                {highlights.map(row => (
                  <li key={row.title} className="flex gap-3 border-b border-white/15 py-2.5 text-[13.5px] leading-[1.6]">
                    <span className="w-[60px] flex-none text-[11.5px] leading-[1.95] text-gold">{row.who}</span>
                    <span className="min-w-0 font-bold">{row.title}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-1 pt-4">
                <Link href={`/teire/${month}`} className="inline-flex min-h-11 items-center gap-2 text-[13.5px] font-bold text-white hover:text-gold">{month}月の手入れをすべて見る<span aria-hidden="true" className="text-gold">→</span></Link>
                <Link href="/note" className="inline-flex min-h-11 items-center text-[12.5px] text-white/70 underline decoration-white/30 underline-offset-4 hover:text-white">育てている樹だけ表示する</Link>
              </div>
            </div>
          </div>
        </div>

        {/* そのほかの機能：写真のタイル */}
        <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:mt-6 lg:grid-cols-6 lg:gap-4">
          {others.map(t => (
            <li key={t.href} className="min-w-0">
              <Link href={t.href} className="group relative block aspect-square overflow-hidden bg-sumi-light sm:aspect-[4/3] lg:aspect-[3/4]">
                {TOOL_PHOTO[t.href] && <Image src={TOOL_PHOTO[t.href]} alt="" fill sizes="(max-width: 639px) 46vw, (max-width: 1023px) 30vw, 180px" className="object-cover opacity-80 transition duration-500 group-hover:scale-[1.04] group-hover:opacity-100" />}
                <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/0" />
                <span className="absolute inset-x-0 bottom-0 p-3 lg:p-3.5">
                  <CareIcon name={t.icon} className="h-5 w-5 text-gold" />
                  <span className="mt-1.5 block font-mincho text-[15px] font-bold leading-snug tracking-[0.02em] text-white lg:text-[14px] lg:tracking-normal">{t.label}</span>
                  <span className="mt-1 block text-[11px] leading-[1.55] text-white/75">{t.note}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {creditNames.length > 0 && (
          <p className="mt-5 text-[10.5px] leading-[1.7] text-white/45">写真：{creditNames.join('、')}</p>
        )}
      </div>
    </section>
  )
}
