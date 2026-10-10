import type { Metadata } from 'next'
import Link from 'next/link'
import { getCatalogProducts } from '@/lib/catalog'
import type { CatalogProduct } from '@/lib/catalog-model'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { AddAllButton } from '@/components/soroeru/AddAllButton'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { CONTAINER, PageHeading, SectionTitle } from '@/components/ui/design'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { SITE_URL } from '@/lib/site'
import {
  GROUP_OPTIONS,
  PURPOSE_OPTIONS,
  SIZE_OPTIONS,
  parseSoroeru,
  soroeruGuide,
  soroeruHref,
  soroeruPicks,
  type SoroeruState,
} from '@/lib/soroeru'
import { RelatedTools } from '@/components/layout/RelatedTools'

export const metadata: Metadata = {
  title: '盆栽の鉢・土・道具をそろえる｜樹の種類と大きさに合う号数・配合・道具の目安 - 盆栽コレクション',
  description: '樹の種類（松柏類・雑木類・花もの・さつき・室内向き）と大きさ、目的（はじめての手入れ・植え替え）を選ぶと、合う鉢の号数、用土の配合、そろえたい道具の目安と、楽天市場で買える商品をまとめて表示します。',
  alternates: { canonical: '/soroeru' },
}

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>
}

function Choice<T extends string>({ title, name, options, state }: { title: string; name: keyof SoroeruState; options: { value: T; label: string; note: string }[]; state: SoroeruState }) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-[13px] font-bold text-ink">{title}</legend>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {options.map(option => {
          const active = state[name] === option.value
          return (
            <Link
              key={option.value}
              href={soroeruHref(state, { [name]: option.value } as Partial<SoroeruState>)}
              scroll={false}
              aria-current={active ? 'true' : undefined}
              className={`flex min-h-12 flex-col justify-center border px-3.5 py-1.5 text-left ${active ? 'border-ink bg-ink text-white hover:text-white' : 'border-line bg-paper text-ink hover:border-ink'}`}
            >
              <span className="text-[14px] font-bold leading-snug">{option.label}</span>
              <span className={`text-[11px] leading-snug ${active ? 'text-white/80' : 'text-ink-muted'}`}>{option.note}</span>
            </Link>
          )
        })}
      </div>
    </fieldset>
  )
}

function ProductRow({ products }: { products: CatalogProduct[] }) {
  if (products.length === 0) return <p className="mt-3 text-[13px] text-ink-muted">条件に合う掲載商品が見つかりませんでした。一覧から探してください。</p>
  return (
    <div className="mt-4 grid grid-cols-2 gap-x-3.5 gap-y-6 sm:grid-cols-3 lg:gap-6">
      {products.map(p => <CatalogProductCard key={p.id} product={p} sizes="(max-width: 639px) 46vw, 260px" />)}
    </div>
  )
}

export default async function SoroeruPage({ searchParams }: PageProps) {
  const state = parseSoroeru(searchParams)
  const guide = soroeruGuide(state)
  const products = await getCatalogProducts().catch(() => [] as CatalogProduct[])
  const picks = soroeruPicks(state, guide, products)
  // まとめて「気になる」に入れる商品（各項目の1つ目）
  const firstPicks = [picks.pots[0], picks.soils[0], ...picks.tools.map(t => t.products[0])].filter((p): p is CatalogProduct => Boolean(p))
  const group = GROUP_OPTIONS.find(o => o.value === state.group)!
  const size = SIZE_OPTIONS.find(o => o.value === state.size)!
  const purpose = PURPOSE_OPTIONS.find(o => o.value === state.purpose)!

  return (
    <>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: '鉢・土・道具をそろえる', url: `${SITE_URL}/soroeru`, position: 2 },
        ]}
      />
      <div className={`${CONTAINER} pb-14 lg:pb-20`}>
        <PageHeading
          title="鉢・土・道具をそろえる"
          lead="樹の種類と大きさ、目的を選ぶと、合う鉢の大きさ・土の配合・道具の目安と、掲載中の商品をまとめて出します。"
          crumbs={[{ label: 'ホーム', href: '/' }, { label: '鉢・土・道具をそろえる' }]}
        />

        {/* 選ぶ（リンクで切り替える。JavaScript がなくても動く） */}
        <div className="mt-6 grid gap-6 border-y border-line py-6 lg:mt-10 lg:grid-cols-3 lg:gap-10 lg:py-8">
          <Choice title="1. 樹の種類" name="group" options={GROUP_OPTIONS} state={state} />
          <Choice title="2. 樹の大きさ" name="size" options={SIZE_OPTIONS} state={state} />
          <Choice title="3. 目的" name="purpose" options={PURPOSE_OPTIONS} state={state} />
        </div>

        <section id="list" className="scroll-mt-20 pt-8 lg:pt-12">
          <p className="text-[12px] tracking-[0.12em] text-gold-dark">そろえるリスト</p>
          <h2 className="mt-1.5 font-mincho text-[21px] font-bold leading-snug tracking-[0.05em] text-ink lg:text-[28px]">
            {group.label}・{size.label}の{purpose.label}
          </h2>

          {/* 目安のまとめ */}
          <dl className="mt-5 grid border-t border-line text-[13.5px] leading-[1.8] lg:mt-7 lg:grid-cols-2 lg:gap-x-12">
            {state.purpose === 'repot' && (
              <>
                <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 border-b border-line py-3.5">
                  <dt className="text-ink-muted">鉢の大きさ</dt>
                  <dd className="text-ink"><span className="font-bold">{guide.pot.range}</span><span className="block text-[12px] text-ink-soft">{guide.pot.note}</span></dd>
                </div>
                <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 border-b border-line py-3.5">
                  <dt className="text-ink-muted">土の配合</dt>
                  <dd className="text-ink"><span className="font-bold">{guide.soil.mix}</span>（{guide.soil.grain}）<span className="block text-[12px] text-ink-soft">{guide.soil.why}。はじめてなら、盆栽用の配合土でも十分です</span></dd>
                </div>
              </>
            )}
            <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 border-b border-line py-3.5 lg:col-span-2">
              <dt className="text-ink-muted">道具</dt>
              <dd className="text-ink">{guide.tools.map(t => t.label).join('・')}</dd>
            </div>
          </dl>
          <p className="mt-2 text-[11.5px] text-ink-muted">一般的な目安です。樹の状態や置き場所によって変わるため、商品ごとの説明もあわせてご確認ください。</p>

          <div className="mt-6">
            <AddAllButton ids={firstPicks.map(p => p.id)} />
          </div>
          <PrDisclosure className="mt-4" />

          {state.purpose === 'repot' && (
            <>
              <section className="pt-10 lg:pt-14">
                <SectionTitle action={<Link href="/products?type=pot" className="border-b border-ink pb-0.5 text-[13px] text-ink">鉢をすべて見る</Link>}>鉢（{guide.pot.range}）</SectionTitle>
                <ProductRow products={picks.pots} />
              </section>
              <section className="pt-10 lg:pt-14">
                <SectionTitle action={<Link href="/products?type=soil" className="border-b border-ink pb-0.5 text-[13px] text-ink">土をすべて見る</Link>}>土</SectionTitle>
                <p className="mt-2 text-[13px] text-ink-soft">{guide.soil.mix}（{guide.soil.grain}）</p>
                <ProductRow products={picks.soils} />
              </section>
            </>
          )}

          <section className="pt-10 lg:pt-14">
            <SectionTitle action={<Link href="/products?type=parts" className="border-b border-ink pb-0.5 text-[13px] text-ink">道具をすべて見る</Link>}>道具</SectionTitle>
            {picks.tools.map(tool => (
              <div key={tool.label} className="mt-6 border-t border-line pt-4 lg:mt-8">
                <h3 className="text-[15px] font-bold text-ink">{tool.label}<span className="ml-2 text-[12px] font-normal text-ink-muted">{tool.note}</span></h3>
                <ProductRow products={tool.products} />
              </div>
            ))}
          </section>

          {/* 手順の記事へ */}
          <section className="mt-12 border-t border-ink pt-8 lg:mt-16">
            <h2 className="font-mincho text-lg font-bold tracking-[0.05em] text-ink lg:text-[22px]">手順を読む</h2>
            <ul className="mt-3 border-t border-line text-[14px]">
              {[
                { href: '/guides/article-16', label: '盆栽の植え替え｜必要な時期の見分け方と、基本の手順' },
                { href: '/guides/soil-science-ph-nutrition-guide', label: '盆栽の用土の選び方｜樹種ごとの配合の目安' },
                { href: '/guides/article-9', label: '盆栽の道具｜最初にそろえたい7つと、選び方' },
              ].map(link => (
                <li key={link.href} className="border-b border-line">
                  <Link href={link.href} className="flex min-h-12 items-center py-3 font-mincho font-bold text-ink hover:text-gold-dark">
                    {link.label}<span className="ml-auto pl-3 font-sans font-normal text-ink-muted" aria-hidden="true">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </section>
        <RelatedTools hrefs={['/kumiawase', '/teire', '/hajimete']} />
      </div>
    </>
  )
}
