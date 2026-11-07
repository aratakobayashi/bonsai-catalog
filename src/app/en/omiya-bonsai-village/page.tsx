import type { Metadata } from 'next'
import { heroPhoto } from '@/lib/hero-photo'
import { CONTAINER, PageHeading } from '@/components/ui/design'
import { EN_CHECKED, EnExternal, EnFacts, EnNextLinks, EnNote, EnSection } from '@/components/en/EnParts'

export const metadata: Metadata = {
  title: 'Omiya Bonsai Village Guide — Getting There, Museum and Gardens | Bonsai Collection',
  description: 'How to visit Omiya Bonsai Village in Saitama, 35 minutes from Tokyo: trains from Tokyo, the Omiya Bonsai Art Museum (hours, fees and the January 2027 closure), the six bonsai gardens, the Great Bonsai Festival in May, and garden etiquette.',
  alternates: { canonical: '/en/omiya-bonsai-village' },
  openGraph: { locale: 'en_US', type: 'article', title: 'Omiya Bonsai Village Guide', url: 'https://www.bonsai-collection.com/en/omiya-bonsai-village' },
}

const GARDENS = [
  { name: 'Kyuka-en', ja: '九霞園', since: 'founded 1929', note: 'Over 300 kinds of trees and companion plants, in a natural style.' },
  { name: 'Seikou-en', ja: '清香園', since: 'founded in the 1850s, in Omiya since 1943', note: 'Known for colorful, modern “saika bonsai”; runs bonsai classes.' },
  { name: 'Toju-en', ja: '藤樹園', since: 'founded 1931', note: 'Five-needle pines and small (shohin) bonsai; classes since 1966.' },
  { name: 'Fuyo-en', ja: '芙蓉園', since: 'founded 1939', note: 'Deciduous trees and forest-style group plantings.' },
  { name: 'Mansei-en', ja: '蔓青園', since: 'in Omiya since 1925', note: 'Ancient junipers, viewing stones and traditional alcove displays.' },
  { name: 'Shosetsu-en', ja: '松雪園', since: 'founded 1977', note: 'Runs classes; the owner exhibits his work every year.' },
]

export default function OmiyaPage() {
  return (
    <div lang="en" className={`${CONTAINER} pb-16 lg:pb-24`}>
      <PageHeading
        eyebrow="Saitama · near Tokyo"
        photo={heroPhoto('/images/articles/photos/bonsai-exhibition-viewing-guide-1.jpg', 'Bonsai on display')}
        title="Omiya Bonsai Village"
        lead="A quiet residential district in Saitama City where bonsai gardens have gathered since the 1920s — the best place near Tokyo to see bonsai being grown."
      />

      <EnSection id="getting-there" title="Getting there" lead="The village is about 35 minutes from Tokyo by train. The museum and gardens are all within a few minutes’ walk of each other.">
        <EnFacts
          rows={[
            { k: 'Toro Station', v: 'JR Utsunomiya Line / Ueno-Tokyo Line — about 36 minutes from Tokyo Station. About 5 minutes’ walk from the East Exit to the museum.' },
            { k: 'Ōmiya-kōen Station', v: 'Tobu Urban Park Line, two stops from Ōmiya Station — about 10 minutes’ walk to the museum.' },
          ]}
        />
      </EnSection>

      <EnSection id="museum" title="Omiya Bonsai Art Museum" lead="The world’s first public bonsai museum, run by Saitama City. Start here: the collection includes masterpiece trees, pots and viewing stones, with displays that change with the seasons.">
        <EnFacts
          rows={[
            { k: 'Hours', v: 'March–October 9:00–16:30, November–February 9:00–16:00 (last entry 30 minutes before closing)' },
            { k: 'Closed', v: 'Thursdays (open on national holidays), December 29 – January 3, and during exhibition changes' },
            { k: 'Admission', v: 'Adults ¥310 · high school/university students and 65+ ¥150 · elementary/junior high students ¥100' },
            { k: 'Address', v: '2-24-3 Toro-chō, Kita-ku, Saitama City' },
            { k: 'Official information', v: <EnExternal href="https://omiyabonsai.jp/museum">omiyabonsai.jp</EnExternal> },
          ]}
        />
        <EnNote><strong>Temporary closure:</strong> the museum is closed from January 14 to February 7, 2027 for lighting work. Saitama City says more closure days may be added — please check before visiting in winter.</EnNote>
        <p className="mt-3 max-w-[760px] text-[13.5px] leading-[1.8] text-ink-soft">Photography of the main exhibits is not allowed; there is a designated area where you can take photos.</p>
      </EnSection>

      <EnSection id="gardens" title="The bonsai gardens" lead="Six gardens of the Omiya Bonsai Cooperative are open to visitors. Entry is free. Most close on Thursdays and on some irregular days, and hours differ by garden — roughly from 9:00 until late afternoon.">
        <ul className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GARDENS.map(g => (
            <li key={g.name} className="border border-line bg-white px-4 py-4">
              <p className="flex items-baseline gap-2"><span className="font-mincho text-[18px] font-bold text-ink">{g.name}</span><span lang="ja" className="text-[12.5px] text-ink-muted">{g.ja}</span></p>
              <p className="text-[11.5px] text-gold-dark">{g.since}</p>
              <p className="mt-1.5 text-[13.5px] leading-[1.75] text-ink-soft">{g.note}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[13px] text-ink-soft">Garden details and maps: <EnExternal href="https://omiyabonsai.jp/gardens">omiyabonsai.jp/gardens</EnExternal></p>
      </EnSection>

      <EnSection id="festival" title="The Great Bonsai Festival (May 3–5)" lead="Every year during Golden Week, the whole village becomes a bonsai market, with trees, pots and tools for sale and a citizens’ exhibition. Entry is free, 9:00–17:00. About 80,000 people visited over the three days in 2025.">
        <p className="mt-3 text-[13px] text-ink-muted">The 2027 dates have not been announced yet; the festival is traditionally held on May 3–5.</p>
      </EnSection>

      <EnSection id="etiquette" title="Etiquette">
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[14px] leading-[1.8] text-ink-soft">
          <li>The gardens are working nurseries and family homes — greet the staff and keep your voice low.</li>
          <li>Do not touch the trees, pots or stands.</li>
          <li>Photography is generally not allowed in the gardens. Ask before taking any photo.</li>
          <li>Thinking of buying a tree? Taking bonsai abroad is strictly limited by most countries — see <a href="/en#before-you-go" className="border-b border-ink text-ink">Can I take a bonsai home?</a></li>
        </ul>
      </EnSection>

      <EnSection id="next" title="More bonsai in Japan">
        <EnNextLinks
          links={[
            { href: '/en/exhibitions', label: 'Bonsai exhibitions 2026–2027', note: 'Taikan-ten, Gafu-ten, Kokufu-ten and more' },
            { href: '/en', label: 'Where to see bonsai in Japan', note: 'Shunka-en in Tokyo, etiquette, taking bonsai home' },
          ]}
        />
        <p className="mt-6 text-[12px] leading-[1.8] text-ink-muted">{EN_CHECKED} Sources: Saitama City, omiyabonsai.jp (Omiya Bonsai Village), Japan Tourism Agency.</p>
      </EnSection>
    </div>
  )
}
