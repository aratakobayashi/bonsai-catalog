import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { CONTAINER, PageHeading, SectionTitle, chipClass } from '@/components/ui/design'
import { SITE_URL } from '@/lib/site'
import { JUKEI_ENTRIES, MEISHO_ENTRIES, ZUKAN_GROUPS, zukanImage } from '@/lib/zukan'
import { RelatedTools } from '@/components/layout/RelatedTools'

export const metadata: Metadata = {
  title: '盆栽の名前・樹形図鑑｜直幹・模様木・懸崖などの樹形と、出猩々・糸魚川真柏などよく見る名前 - 盆栽コレクション',
  description:
    '直幹・模様木・懸崖・文人木・寄せ植えなど13の樹形を図で見分け、出猩々・糸魚川真柏・旭山桜・長寿梅など商品名によく出てくる名前の意味を調べられます。向いている樹種、育てるときの注意、その名前の付いた盆栽もあわせて紹介します。',
  alternates: { canonical: '/zukan' },
}

export default function ZukanIndexPage() {
  const groups = ZUKAN_GROUPS.map(group => ({ group, entries: MEISHO_ENTRIES.filter(entry => entry.group === group) })).filter(g => g.entries.length > 0)
  return (
    <>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: '盆栽の名前・樹形図鑑', url: `${SITE_URL}/zukan`, position: 2 },
        ]}
      />
      <div className={`${CONTAINER} pb-14 lg:pb-24`}>
        <PageHeading
          crumbs={[{ label: 'ホーム', href: '/' }, { label: '盆栽の名前・樹形図鑑' }]}
          title="盆栽の名前・樹形図鑑"
          lead="商品名に出てくる「模様木」「懸崖」などの樹形や、「出猩々」「八房」などの名前が何を指すのかを、ひとつずつ説明します。見分け方と育てるときの注意、その名前の付いた盆栽も見られます。"
        />
        <nav aria-label="図鑑の目次" className="mt-5 flex flex-wrap gap-2">
          <a href="#jukei" className={`${chipClass()} min-h-11`}>樹形（{JUKEI_ENTRIES.length}）</a>
          <a href="#meisho" className={`${chipClass()} min-h-11`}>品種・名前（{MEISHO_ENTRIES.length}）</a>
        </nav>

        {/* 樹形：シルエットのカード */}
        <section id="jukei" aria-labelledby="zukan-jukei" className="scroll-mt-20 pt-10 lg:pt-16">
          <SectionTitle><span id="zukan-jukei">樹形</span></SectionTitle>
          <p className="mt-2 text-[13.5px] leading-[1.9] text-ink-soft lg:text-sm">幹の立ち方や枝の流れ方による、盆栽の形の呼び名です。</p>
          <ul className="mt-5 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-x-3 gap-y-5 md:grid-cols-[repeat(3,minmax(0,1fr))] lg:grid-cols-[repeat(4,minmax(0,1fr))] lg:gap-x-6 lg:gap-y-8">
            {JUKEI_ENTRIES.map(entry => (
              <li key={entry.slug} className="min-w-0">
                <Link href={`/zukan/${entry.slug}`} className="group block text-ink hover:text-ink">
                  <div className="border border-line bg-white px-2 py-3 group-hover:border-ink">
                    <Image src={zukanImage(entry)!} alt={`${entry.name}の樹形のシルエット`} width={400} height={300} className="h-auto w-full" unoptimized />
                  </div>
                  <p className="mt-2.5 flex flex-wrap items-baseline gap-x-2">
                    <span className="font-mincho text-[17px] font-bold tracking-[0.04em] group-hover:text-gold-dark lg:text-lg">{entry.name}</span>
                    <span className="text-[11.5px] text-ink-muted">{entry.reading}</span>
                  </p>
                  <p className="mt-1 line-clamp-3 text-[12.5px] leading-[1.75] text-ink-soft lg:text-[13px]">{entry.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 品種・名前：分類ごとの行 */}
        <section id="meisho" aria-labelledby="zukan-meisho" className="scroll-mt-20 pt-12 lg:pt-20">
          <SectionTitle><span id="zukan-meisho">品種・名前</span></SectionTitle>
          <p className="mt-2 text-[13.5px] leading-[1.9] text-ink-soft lg:text-sm">商品名によく出てくる品種名や呼び名です。品種名ではなく、性質や花の色を表す言葉も含みます。</p>
          <div className="mt-4 lg:grid lg:grid-cols-[repeat(2,minmax(0,1fr))] lg:gap-x-12">
            {groups.map(({ group, entries }) => (
              <div key={group} className="mt-6 min-w-0">
                <h3 className="text-[13px] font-bold tracking-[0.06em] text-gold-dark">{group}</h3>
                <ul className="mt-2 border-t border-line">
                  {entries.map(entry => (
                    <li key={entry.slug} className="border-b border-line">
                      <Link href={`/zukan/${entry.slug}`} className="group flex min-h-11 items-center gap-3 py-3.5 text-ink hover:text-ink">
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-baseline gap-x-2">
                            <span className="font-mincho text-base font-bold tracking-[0.04em] group-hover:text-gold-dark">{entry.name}</span>
                            <span className="text-[11.5px] text-ink-muted">{entry.reading}</span>
                          </p>
                          <p className="mt-1 line-clamp-2 text-[12.5px] leading-[1.75] text-ink-soft lg:text-[13px]">{entry.summary}</p>
                        </div>
                        <span aria-hidden="true" className="flex-none text-ink-muted">›</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 border-t border-ink pt-8 lg:mt-20">
          <h2 className="font-mincho text-lg font-bold tracking-[0.06em] text-ink">名前から盆栽を探す</h2>
          <p className="mt-2 text-[13.5px] leading-[1.9] text-ink-soft">樹形や品種の名前は、商品一覧のキーワード検索でも探せます。</p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
            <Link href="/products" className="inline-flex min-h-11 items-center text-[13.5px] text-ink hover:text-gold-dark">
              <span className="border-b border-ink pb-0.5">盆栽の一覧を見る ›</span>
            </Link>
            <Link href="/guides/bonsai-english-terminology-guide" className="inline-flex min-h-11 items-center text-[13.5px] text-ink hover:text-gold-dark">
              <span className="border-b border-ink pb-0.5">樹形の英語の言い方 ›</span>
            </Link>
          </div>
        </section>
        <RelatedTools hrefs={['/kumiawase', '/shindan', '/teire']} />
      </div>
    </>
  )
}
