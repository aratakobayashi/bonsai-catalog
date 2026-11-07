import type { Metadata } from 'next'
import Link from 'next/link'
import { heroPhoto } from '@/lib/hero-photo'
import { CONTAINER, PageHeading } from '@/components/ui/design'
import { EN_CHECKED, EnExternal, EnFacts, EnNextLinks, EnNote, EnSection } from '@/components/en/EnParts'

// 訪日客向けの英語のページ（試験）。日本で盆栽を見る・体験する場所と、行く前に知っておきたいこと
export const metadata: Metadata = {
  title: 'Where to See Bonsai in Japan — A Visitor’s Guide | Bonsai Collection',
  description: 'A practical guide to seeing bonsai in Japan: Omiya Bonsai Village near Tokyo, Shunka-en in Tokyo, the major bonsai exhibitions in Kyoto and Tokyo, garden etiquette, and what to know before buying bonsai to take home.',
  alternates: { canonical: '/en' },
  openGraph: { locale: 'en_US', type: 'website', title: 'Where to See Bonsai in Japan — A Visitor’s Guide', url: 'https://www.bonsai-collection.com/en' },
}

export default function EnglishHome() {
  return (
    <div lang="en" className={`${CONTAINER} pb-16 lg:pb-24`}>
      <PageHeading
        eyebrow="Bonsai in Japan"
        photo={heroPhoto('/images/articles/photos/bonsai-club-beginner-guide-2.jpg', 'Visitors looking at bonsai at an exhibition in Japan')}
        title="Where to see bonsai in Japan"
        lead="A practical guide for visitors: bonsai gardens you can walk into, the great exhibitions of the season, and a few things to know before you go."
      />

      <EnSection id="where" title="Three places to start" lead="If you have one day for bonsai near Tokyo, Omiya Bonsai Village is the classic choice. For the very best trees, time your trip with one of the major exhibitions.">
        <ul className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-3">
          {[
            { href: '/en/omiya-bonsai-village', tag: 'Saitama · 35 min from Tokyo', title: 'Omiya Bonsai Village', body: 'A quiet neighborhood of bonsai gardens, some over a century old, next to the Omiya Bonsai Art Museum. Garden entry is free.' },
            { href: '/en#shunka-en', tag: 'Edogawa, Tokyo', title: 'Shunka-en BONSAI Museum', body: 'The garden of master Kunio Kobayashi, with remarkable old trees and bookable hands-on bonsai classes.' },
            { href: '/en/exhibitions', tag: 'Kyoto · Tokyo', title: 'Bonsai exhibitions', body: 'Taikan-ten (Kyoto, November), Gafu-ten (Kyoto, January) and Kokufu-ten (Tokyo, February) show the finest bonsai in Japan.' },
          ].map(c => (
            <li key={c.title}>
              <Link href={c.href} className="group flex h-full flex-col border border-line bg-white px-5 py-5 hover:border-ink">
                <span className="text-[11.5px] tracking-[0.06em] text-gold-dark">{c.tag}</span>
                <span className="mt-1.5 font-mincho text-[19px] font-bold text-ink group-hover:text-gold-dark">{c.title}</span>
                <span className="mt-2 text-[13.5px] leading-[1.8] text-ink-soft">{c.body}</span>
                <span className="mt-auto pt-3 text-[13px] text-ink">Read more ›</span>
              </Link>
            </li>
          ))}
        </ul>
      </EnSection>

      <section id="shunka-en" className="scroll-mt-24">
        <EnSection id="shunka-en-title" title="Shunka-en BONSAI Museum (Tokyo)" lead="A private bonsai garden and museum in Edogawa, eastern Tokyo, run by bonsai master Kunio Kobayashi.">
          <EnFacts
            rows={[
              { k: 'Admission', v: '¥2,000 (tax included), cash' },
              { k: 'Hours', v: '10:00–17:00 (last entry 30 minutes before closing)' },
              { k: 'Closed', v: 'Mondays (open on national holidays) and over the New Year holidays' },
              { k: 'Bonsai class', v: 'Tuesday, Thursday and Saturday at 10:00 and 14:00. ¥12,000 plus tax per person (museum admission included). Book at least 4 days ahead.' },
              { k: 'Access', v: 'From Mizue Station (Toei Shinjuku Line) or Koiwa Station (JR Sobu Line), take Keisei Bus No. 76 to “Keiyō-guchi”, then walk 3 minutes.' },
              { k: 'Official site', v: <><EnExternal href="https://kunio-kobayashi.com/en/syunkaen.html">kunio-kobayashi.com</EnExternal> (classes: <EnExternal href="https://kunio-kobayashi.com/en/kyoushitsu.html">booking information</EnExternal>)</> },
            ]}
          />
        </EnSection>
      </section>

      <section id="before-you-go" className="scroll-mt-24">
        <EnSection id="before-title" title="Before you go">
          <h3 className="mt-5 font-mincho text-[18px] font-bold text-ink">Garden etiquette</h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[14px] leading-[1.8] text-ink-soft">
            <li>Bonsai gardens are working nurseries and family homes. Greet the staff, and keep your voice low.</li>
            <li>Please do not touch the trees, pots or display stands.</li>
            <li>Photography is generally not allowed in the Omiya gardens and in parts of the museum. Always ask first.</li>
            <li>Many gardens close on Thursdays and on irregular days. Check before you travel.</li>
          </ul>

          <h3 className="mt-7 font-mincho text-[18px] font-bold text-ink">Can I take a bonsai home?</h3>
          <p className="mt-2 max-w-[760px] text-[14px] leading-[1.85] text-ink-soft">For most visitors, it is not realistic. Japan requires a plant inspection and a phytosanitary certificate before export, and most countries strictly limit importing living trees:</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[14px] leading-[1.8] text-ink-soft">
            <li><strong className="text-ink">United States:</strong> plants must be bare-root (no soil), with a certificate, and in small numbers.</li>
            <li><strong className="text-ink">European Union:</strong> soil is not allowed, and most conifers such as pines and junipers from outside Europe are prohibited.</li>
            <li><strong className="text-ink">Australia:</strong> bonsai need an import permit.</li>
          </ul>
          <EnNote>Bonsai tools, pots and books are easy to bring home and make great souvenirs. If you want a tree, ask the garden about specialist export services, and check your country’s plant import rules well in advance.</EnNote>
          <p className="mt-3 text-[12.5px] text-ink-muted">
            Sources: <EnExternal href="https://www.maff.go.jp/pps/j/introduction/english_exp.html">Plant Protection Station, Japan</EnExternal>{' · '}
            <EnExternal href="https://www.aphis.usda.gov/traveling-with-ag-products/plants-plant-parts">USDA APHIS</EnExternal>{' · '}
            <EnExternal href="https://www.agriculture.gov.au/biosecurity-trade/import/goods/plant-products/how-to-import-plants">Australian Government</EnExternal>
          </p>
        </EnSection>
      </section>

      <EnSection id="more" title="Plan your visit">
        <EnNextLinks
          links={[
            { href: '/en/omiya-bonsai-village', label: 'Omiya Bonsai Village guide', note: 'Getting there, the museum, the six gardens' },
            { href: '/en/exhibitions', label: 'Bonsai exhibitions 2026–2027', note: 'Taikan-ten, Gafu-ten, Kokufu-ten and more' },
          ]}
        />
        <p className="mt-6 text-[12px] leading-[1.8] text-ink-muted">{EN_CHECKED} This site is mainly in Japanese; the English pages are a guide for visitors.</p>
      </EnSection>
    </div>
  )
}
