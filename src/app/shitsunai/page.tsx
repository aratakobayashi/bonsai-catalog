import type { Metadata } from 'next'
import Link from 'next/link'
import { INDOOR_KINDS, indoorEntriesOf, type IndoorEntry, type IndoorKind } from '@/lib/indoor-guide'
import { SITE_URL } from '@/lib/site'
import { heroPhoto } from '@/lib/hero-photo'
import { CareIcon } from '@/components/catalog/CareIcon'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { RelatedTools } from '@/components/layout/RelatedTools'
import { CONTAINER, PageHeading, SectionTitle } from '@/components/ui/design'

// 「室内で育てられる？」樹種ごとの早見表（/shitsunai）。「盆栽 室内」で探す人に、樹種ごとの答えを一覧で返す
export const metadata: Metadata = {
  title: '室内で育てられる盆栽は？樹種ごとの早見表｜室内OK・冬は室内・飾るのは数日 - 盆栽コレクション',
  description: '盆栽は室内で育てられる？ガジュマル・フィカスなど室内で育てられる樹と、松・真柏・もみじ・梅など屋外で育てて部屋に飾るのは2〜3日までの樹を、樹種ごとの早見表にまとめました。冬の置き場所、日当たり、部屋に飾るときの流れも紹介します。',
  alternates: { canonical: '/shitsunai' },
}

const ICON: Record<IndoorKind, string> = { indoor: 'indoor', winter: 'winter', display: 'outdoor' }
const TONE: Record<IndoorKind, string> = {
  indoor: 'border-[#5f7a4a] bg-[#eef3e8] text-[#3f5a2c]',
  winter: 'border-gold bg-gold-light text-gold-dark',
  display: 'border-line bg-paper-deep text-ink-soft',
}

const STEPS = [
  '飾る前日に、屋外で鉢底から流れるまで水を与える',
  '部屋では、直射日光とエアコンの風が当たらない、明るい場所に置く',
  '土の乾き具合を毎日確かめる（室内は乾き方がゆっくり）',
  '2〜3日たったら屋外に戻す。戻した直後の1日は半日陰で慣らす',
]

const FAQ = [
  { q: '盆栽は室内で育てられますか？', a: 'ガジュマルやフィカス（ベンジャミンなど）のような暖かい地域の樹は、明るい窓辺で一年中育てられます。松・真柏・もみじ・梅など多くの盆栽は、日光と季節の寒暖が必要なので屋外で育て、部屋に飾るのは2〜3日までにします。' },
  { q: '松や真柏の盆栽を、ずっと部屋に置いてもよいですか？', a: '長く置くのは避けます。日光が足りず枝が弱ったり、真柏ではとがった葉が出たりします。屋外の日なたで育て、正月や来客のときなど、2〜3日だけ飾るのが基本です。' },
  { q: '冬は盆栽を室内に入れたほうがよいですか？', a: '屋外で育てる樹は、冬も屋外で寒さに当てます。冬の寒さで休み、花芽が育つ樹も多いためです。ただし鉢の土が凍るほど冷える場所は避け、軒下や北風の当たらない場所に移します。ガジュマルなどは5℃を下回らない室内に取り込みます。' },
]

function EntryCells({ e }: { e: IndoorEntry }) {
  return (
    <>
      <span className="block text-[12.5px] leading-[1.7] text-ink"><span className="text-ink-muted">冬：</span>{e.winter}</span>
      <span className="block text-[12.5px] leading-[1.7] text-ink"><span className="text-ink-muted">日当たり：</span>{e.light}</span>
      {e.note && <span className="mt-1 block text-[11.5px] leading-[1.7] text-ink-muted">{e.note}</span>}
    </>
  )
}

export default function ShitsunaiPage() {
  const groups = INDOOR_KINDS.map(k => ({ ...k, entries: indoorEntriesOf(k.kind) }))

  return (
    <div className={`${CONTAINER} pb-16 lg:pb-24`}>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: '室内で育てられる盆栽の早見表', url: `${SITE_URL}/shitsunai`, position: 2 },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
          }),
        }}
      />
      <PageHeading
        eyebrow="室内で育てる"
        photo={heroPhoto('/images/selections/photos/indoor-bonsai.jpg', '窓辺に置かれた盆栽')}
        title="室内で育てられる盆栽は？"
        lead="盆栽には、室内で育てられる樹と、屋外で育てて部屋には数日だけ飾る樹があります。樹種ごとの扱いを早見表にまとめました。"
        crumbs={[{ label: 'ホーム', href: '/' }, { label: '室内で育てられる盆栽の早見表' }]}
      />

      {/* 3つの区分（押すとその区分の表へ） */}
      <ul className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-3 lg:mt-10 lg:grid-cols-3 lg:gap-4">
        {groups.map(g => (
          <li key={g.kind}>
            <a href={`#kind-${g.kind}`} className={`flex h-full flex-col border px-4 py-4 transition-colors hover:border-ink lg:px-5 ${TONE[g.kind]}`}>
              <span className="flex items-center gap-2 font-mincho text-[17px] font-bold"><CareIcon name={ICON[g.kind]} className="h-5 w-5" />{g.label}</span>
              <span className="mt-1.5 text-[12.5px] leading-[1.8] text-ink-soft">{g.lead}</span>
              <span className="mt-auto pt-2 text-[12px] text-ink">{g.entries.map(e => e.label.replace(/（.*）/, '')).join('・')}</span>
            </a>
          </li>
        ))}
      </ul>

      {/* 区分ごとの表（PC は表、SP はカード） */}
      {groups.map(g => (
        <section key={g.kind} id={`kind-${g.kind}`} aria-labelledby={`h-${g.kind}`} className="scroll-mt-20 pt-12 lg:pt-16">
          <SectionTitle><span id={`h-${g.kind}`}>{g.label}</span></SectionTitle>
          <p className="mt-2 max-w-[760px] text-[13.5px] leading-[1.9] text-ink-soft">{g.lead}</p>

          <table className="mt-4 hidden w-full table-fixed border-collapse text-left lg:table">
            <colgroup>
              <col className="w-[220px]" />
              <col className="w-[170px]" />
              <col />
              <col className="w-[260px]" />
              <col className="w-[110px]" />
            </colgroup>
            <thead>
              <tr className="border-b border-ink text-[12px] text-ink-muted">
                <th scope="col" className="w-[200px] py-2.5 pr-4 font-normal">樹種</th>
                <th scope="col" className="w-[150px] py-2.5 pr-4 font-normal">室内に置ける目安</th>
                <th scope="col" className="py-2.5 pr-4 font-normal">冬の置き場所</th>
                <th scope="col" className="py-2.5 pr-4 font-normal">日当たり</th>
                <th scope="col" className="w-[120px] py-2.5 font-normal"><span className="sr-only">商品</span></th>
              </tr>
            </thead>
            <tbody>
              {g.entries.map(e => (
                <tr key={e.key} className="border-b border-line align-top text-[13.5px]">
                  <th scope="row" className="py-3.5 pr-4 text-left">
                    <span className="block font-mincho text-[16px] font-bold text-ink">{e.label}</span>
                    {e.note && <span className="mt-1 block text-[11.5px] font-normal leading-[1.7] text-ink-muted">{e.note}</span>}
                  </th>
                  <td className="py-3.5 pr-4"><span className={`inline-block border px-2 py-0.5 text-[12px] ${TONE[g.kind]}`}>{e.stay}</span></td>
                  <td className="py-3.5 pr-4 leading-[1.7] text-ink">{e.winter}</td>
                  <td className="py-3.5 pr-4 leading-[1.7] text-ink">{e.light}</td>
                  <td className="py-3.5 text-right">
                    <Link href={e.category ? `/products/category/${e.category}` : `/products?q=${encodeURIComponent(e.label.replace(/（.*）/, ''))}`} className="inline-flex min-h-10 items-center border-b border-ink text-[12.5px] text-ink hover:text-gold-dark">商品を見る ›</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="mt-4 border-t border-ink lg:hidden">
            {g.entries.map(e => (
              <li key={e.key} className="border-b border-line py-3.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-mincho text-[16px] font-bold text-ink">{e.label}</span>
                  <span className={`flex-none border px-2 py-0.5 text-[11.5px] ${TONE[g.kind]}`}>{e.stay}</span>
                </div>
                <div className="mt-1.5"><EntryCells e={e} /></div>
                <Link href={e.category ? `/products/category/${e.category}` : `/products?q=${encodeURIComponent(e.label.replace(/（.*）/, ''))}`} className="mt-1 inline-flex min-h-11 items-center text-[13px] text-ink underline decoration-line underline-offset-4 hover:decoration-ink">{e.label.replace(/（.*）/, '')}の盆栽を見る ›</Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* 部屋に飾るときの流れ */}
      <section aria-labelledby="steps" className="pt-12 lg:pt-16">
        <SectionTitle><span id="steps">屋外の樹を部屋に飾るときの流れ</span></SectionTitle>
        <ol className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s} className="border-t-2 border-sumi bg-white px-4 pb-4 pt-3">
              <p className="font-mincho text-[13px] text-gold-dark">{String(i + 1).padStart(2, '0')}</p>
              <p className="mt-1 text-[13px] leading-[1.85] text-ink">{s}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* よくある質問 */}
      <section aria-labelledby="faq" className="pt-12 lg:pt-16">
        <SectionTitle><span id="faq">よくある質問</span></SectionTitle>
        <dl className="mt-3 border-t border-line">
          {FAQ.map(f => (
            <div key={f.q} className="border-b border-line py-4">
              <dt className="text-[14.5px] font-bold text-ink">{f.q}</dt>
              <dd className="mt-1.5 text-[13.5px] leading-[1.9] text-ink-soft">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 次に */}
      <section aria-labelledby="next" className="pt-12 lg:pt-16">
        <SectionTitle><span id="next">室内で楽しむなら</span></SectionTitle>
        <ul className="mt-3 grid grid-cols-[minmax(0,1fr)] border-t border-line sm:grid-cols-2 sm:gap-x-8">
          {[
            { href: '/osusume/indoor', label: '室内で育てやすい盆栽のおすすめ', note: 'レビューで選んだ、部屋に置ける一鉢' },
            { href: '/guides/article-25', label: '室内で育てやすい盆栽の選び方', note: '窓辺に向く樹と、飾るときの注意' },
            { href: '/guides/indoor-bonsai-winter-care', label: '冬に室内で盆栽を育てる', note: '暖房・窓辺の温度と乾燥への対策' },
            { href: '/guides/indoor-bonsai-watering', label: '室内の盆栽の水やり', note: '乾き方の見方と、受け皿・霧吹き' },
          ].map(l => (
            <li key={l.href} className="border-b border-line">
              <Link href={l.href} className="group flex min-h-[56px] items-center gap-3 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block font-mincho text-[15px] font-bold text-ink group-hover:text-gold-dark">{l.label}</span>
                  <span className="block text-[12px] text-ink-muted">{l.note}</span>
                </span>
                <span className="text-ink-muted" aria-hidden="true">›</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <RelatedTools hrefs={['/osusume', '/teire', '/shojo']} />
    </div>
  )
}
