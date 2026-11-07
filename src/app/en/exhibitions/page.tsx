import type { Metadata } from 'next'
import { heroPhoto } from '@/lib/hero-photo'
import { CONTAINER, PageHeading } from '@/components/ui/design'
import { EN_CHECKED, EnExternal, EnNextLinks, EnSection } from '@/components/en/EnParts'

export const metadata: Metadata = {
  title: 'Bonsai Exhibitions in Japan 2026–2027 — Taikan-ten, Gafu-ten, Kokufu-ten | Bonsai Collection',
  description: 'The major bonsai exhibitions in Japan for winter 2026–2027: Nippon Bonsai Taikan-ten in Kyoto (November), Gafu-ten in Kyoto (January), the Kokufu Bonsai Exhibition in Tokyo (February) and the Great Bonsai Festival in Omiya (May), with venues and admission fees.',
  alternates: { canonical: '/en/exhibitions' },
  openGraph: { locale: 'en_US', type: 'article', title: 'Bonsai Exhibitions in Japan 2026–2027', url: 'https://www.bonsai-collection.com/en/exhibitions' },
}

const SHOWS = [
  {
    when: 'November 20–23, 2026', city: 'Kyoto', name: 'Nippon Bonsai Taikan-ten', ja: '日本盆栽大観展',
    venue: 'Miyako Messe (Kyoto International Exhibition Hall)', fee: '¥1,500',
    body: 'Japan’s largest autumn bonsai exhibition, with masterpiece trees and a large sales area for bonsai, pots and tools.',
    jaHref: '/events/taikan-ten-2026',
  },
  {
    when: 'January 8–10, 2027', city: 'Kyoto', name: 'Gafu-ten (52nd)', ja: '雅風展',
    venue: 'Miyako Messe', fee: '¥1,200 (18 and under free)',
    body: 'The national exhibition of shohin (small) bonsai, shown in traditional multi-tree display stands.',
    jaHref: '/events/gafu-ten-2027',
  },
  {
    when: 'February 2027 (two periods)', city: 'Tokyo', name: 'Kokufu Bonsai Exhibition (101st)', ja: '国風盆栽展',
    venue: 'Tokyo Metropolitan Art Museum, Ueno Park', fee: 'Please check the official announcement',
    body: 'Held for over 100 years, the most prestigious bonsai exhibition in Japan. The display changes between the first and second periods.',
    jaHref: '/events/kokufu-bonsai-ten-2027',
  },
  {
    when: 'May 3–5 (every year)', city: 'Saitama', name: 'Great Bonsai Festival', ja: '大盆栽まつり',
    venue: 'Omiya Bonsai Village', fee: 'Free',
    body: 'The village’s spring festival: bonsai market, pots and tools, and a citizens’ exhibition. 2027 dates to be announced.',
    jaHref: '/en/omiya-bonsai-village#festival',
  },
]

export default function ExhibitionsPage() {
  return (
    <div lang="en" className={`${CONTAINER} pb-16 lg:pb-24`}>
      <PageHeading
        eyebrow="Season 2026–2027"
        photo={heroPhoto('/images/articles/photos/bonsai-club-beginner-guide-2.jpg', 'Bonsai exhibition hall')}
        title="Bonsai exhibitions in Japan"
        lead="The great exhibitions are the best chance to see Japan’s finest bonsai. Most also have a sales area where you can buy pots, tools and small trees."
      />

      <EnSection id="calendar" title="Winter 2026 – spring 2027">
        <ol className="mt-5 border-t border-ink">
          {SHOWS.map(s => (
            <li key={s.name} className="grid grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-1.5 border-b border-line py-5 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div>
                <p className="font-mincho text-[17px] font-bold text-gold-dark">{s.when}</p>
                <p className="text-[12.5px] text-ink-muted">{s.city}</p>
              </div>
              <div>
                <p className="flex flex-wrap items-baseline gap-x-2"><span className="font-mincho text-[19px] font-bold text-ink">{s.name}</span><span lang="ja" className="text-[12.5px] text-ink-muted">{s.ja}</span></p>
                <p className="mt-1 text-[13.5px] leading-[1.8] text-ink-soft">{s.body}</p>
                <p className="mt-1.5 text-[13px] text-ink"><span className="text-ink-muted">Venue:</span> {s.venue} · <span className="text-ink-muted">Admission:</span> {s.fee}</p>
                <a href={s.jaHref} className="mt-1 inline-flex min-h-10 items-center text-[12.5px] text-ink underline decoration-line underline-offset-4 hover:decoration-ink">{s.jaHref.startsWith('/en') ? 'Festival details ›' : 'Details (Japanese page) ›'}</a>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-[13px] leading-[1.8] text-ink-soft">
          Kokufu-ten dates and fees are announced by the Nippon Bonsai Association: <EnExternal href="https://bonsai-kyokai.or.jp/">bonsai-kyokai.or.jp</EnExternal>.
          Satsuki azalea bonsai shows are held in many places from late May to early June.
        </p>
      </EnSection>

      <EnSection id="tips" title="Tips for exhibition visits">
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[14px] leading-[1.8] text-ink-soft">
          <li>Go early on a weekday if you can — weekends and the final day are crowded.</li>
          <li>Photography rules differ by exhibition. Look for signs at the entrance.</li>
          <li>Bring cash for admission and sales stands.</li>
          <li>Planning to buy a tree? Read <a href="/en#before-you-go" className="border-b border-ink text-ink">Can I take a bonsai home?</a> first.</li>
        </ul>
      </EnSection>

      <EnSection id="next" title="More bonsai in Japan">
        <EnNextLinks
          links={[
            { href: '/en/omiya-bonsai-village', label: 'Omiya Bonsai Village guide', note: 'Gardens and museum near Tokyo' },
            { href: '/en', label: 'Where to see bonsai in Japan', note: 'Shunka-en in Tokyo, etiquette, taking bonsai home' },
          ]}
        />
        <p className="mt-6 text-[12px] leading-[1.8] text-ink-muted">{EN_CHECKED}</p>
      </EnSection>
    </div>
  )
}
