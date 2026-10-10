import Link from 'next/link'
import { CareIcon } from '@/components/catalog/CareIcon'
import { jstMonth } from '@/lib/seasons'
import { SITE_TOOLS, type SiteTool } from './site-tools'

// ページの下に置く「あわせて使える」案内。hrefs の順に、SITE_TOOLS のカードを並べる
export function RelatedTools({ hrefs, title = 'あわせて使える', className = 'mt-14 lg:mt-20', stacked = false }: { hrefs: string[]; title?: string; className?: string; stacked?: boolean }) {
  const tools = hrefs.map(href => SITE_TOOLS.find(t => t.href === href)).filter((t): t is SiteTool => Boolean(t))
  if (tools.length === 0) return null
  const month = jstMonth()
  return (
    <section aria-labelledby="related-tools" className={`border-t border-ink pt-7 lg:pt-9 ${className}`}>
      <h2 id="related-tools" className="font-mincho text-lg font-bold tracking-[0.06em] text-ink lg:text-[22px]">{title}</h2>
      <ul className={`mt-4 grid grid-cols-[minmax(0,1fr)] gap-3 ${stacked ? '' : 'sm:grid-cols-3 lg:gap-5'}`}>
        {tools.map(t => (
          <li key={t.href} className="min-w-0">
            <Link href={t.href === '/teire' ? `/teire/${month}` : t.href} className="group flex h-full min-h-[64px] items-center gap-3 border border-line bg-white px-4 py-3.5 hover:border-gold">
              <span className="flex h-10 w-10 flex-none items-center justify-center bg-paper-deep text-gold-dark">
                <CareIcon name={t.icon} className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14.5px] font-bold leading-snug text-ink group-hover:text-gold-dark">{t.href === '/teire' ? `${month}月の手入れ` : t.label}</span>
                <span className="mt-0.5 block text-[12px] leading-[1.6] text-ink-muted">{t.note}</span>
              </span>
              <span aria-hidden="true" className="text-ink-muted">›</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
