import Image from 'next/image'
import Link from 'next/link'
import { CareIcon } from '@/components/catalog/CareIcon'
import { jstMonth } from '@/lib/seasons'
import { SITE_TOOLS, type SiteTool } from './site-tools'

const GROUP_LABEL: Record<SiteTool['group'], string> = { choose: '選ぶ', grow: '育てる' }

// ページの下に置く「あわせて使える」案内。hrefs の順に、SITE_TOOLS のカードを並べる
// 左に写真（トップの「迷ったら、ここから」と同じ写真）、右に名前と一言。写真は小さく、画面に近づいてから読み込む
export function RelatedTools({ hrefs, title = 'あわせて使える', className = 'mt-14 lg:mt-20', stacked = false }: { hrefs: string[]; title?: string; className?: string; stacked?: boolean }) {
  const tools = hrefs.map(href => SITE_TOOLS.find(t => t.href === href)).filter((t): t is SiteTool => Boolean(t))
  if (tools.length === 0) return null
  const month = jstMonth()
  const credits = Array.from(new Set(tools.map(t => t.credit).filter((c): c is string => Boolean(c))))
  return (
    <section aria-labelledby="related-tools" className={`border-t border-ink pt-7 lg:pt-9 ${className}`}>
      <h2 id="related-tools" className="font-mincho text-lg font-bold tracking-[0.06em] text-ink lg:text-[22px]">{title}</h2>
      <ul className={`mt-4 grid grid-cols-[minmax(0,1fr)] gap-3 ${stacked ? '' : 'lg:grid-cols-3 lg:gap-5'}`}>
        {tools.map(t => {
          const photo = t.photo
          return (
            <li key={t.href} className="min-w-0">
              <Link href={t.href === '/teire' ? `/teire/${month}` : t.href} className="group flex h-full min-h-[96px] overflow-hidden border border-line bg-white transition-colors hover:border-ink">
                <span className="relative w-[96px] flex-none overflow-hidden bg-sumi lg:w-[104px]">
                  {photo && <Image src={photo} alt="" fill sizes="104px" className="object-cover opacity-90 transition duration-500 group-hover:scale-[1.06] group-hover:opacity-100" />}
                  <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/0" aria-hidden="true" />
                  <CareIcon name={t.icon} className="absolute bottom-2 left-2 h-[18px] w-[18px] text-gold" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3">
                  <span className="text-[10.5px] tracking-[0.16em] text-gold-dark">{GROUP_LABEL[t.group]}</span>
                  <span className="mt-0.5 block font-mincho text-[15.5px] font-bold leading-snug text-ink group-hover:text-gold-dark">{t.href === '/teire' ? `${month}月の手入れ` : t.label}</span>
                  <span className="mt-1 block text-[12px] leading-[1.6] text-ink-muted">{t.note}</span>
                </span>
                <span aria-hidden="true" className="flex items-center pr-3 text-ink-muted transition-transform group-hover:translate-x-0.5">›</span>
              </Link>
            </li>
          )
        })}
      </ul>
      {credits.length > 0 && <p className="mt-2.5 text-[10.5px] leading-[1.7] text-ink-muted">写真：{credits.join('、')}</p>}
    </section>
  )
}
