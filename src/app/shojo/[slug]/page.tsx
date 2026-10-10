import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCatalogProducts } from '@/lib/catalog'
import type { CatalogProduct } from '@/lib/catalog-model'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { ArticleCardGrid, type ArticleCardItem } from '@/components/article/RelatedArticleRows'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { CONTAINER, PageHeading, SectionTitle, chipClass } from '@/components/ui/design'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { ShojoIcon } from '@/components/shojo/ShojoIcon'
import { getArticleOverride, thumbnailPath } from '@/lib/article-overrides'
import { SITE_URL } from '@/lib/site'
import { SHOJO, getShojo, shojoProducts } from '@/lib/shojo'
import { RelatedTools } from '@/components/layout/RelatedTools'

export const revalidate = 3600

interface PageProps {
  params: { slug: string }
}

// ビルド時にまとめて商品を取ると失敗しやすいため、初回アクセス時に作る（存在しない slug・月は notFound）
export function generateStaticParams() {
  return []
}

export function generateMetadata({ params }: PageProps): Metadata {
  const shojo = getShojo(params.slug)
  if (!shojo) return {}
  return {
    title: `${shojo.title}｜考えられる原因と確かめ方・対処 - 盆栽コレクション`,
    description: shojo.description,
    alternates: { canonical: `/shojo/${shojo.slug}` },
  }
}

function SignList({ title, items, tone }: { title: string; items: string[]; tone: 'calm' | 'act' }) {
  return (
    <div className={`border bg-white px-4 py-4 lg:px-5 ${tone === 'act' ? 'border-ink' : 'border-line'}`}>
      <h3 className="text-[14.5px] font-bold text-ink">{title}</h3>
      <ul className="mt-2.5 space-y-2 text-[13.5px] leading-[1.8] text-ink-soft">
        {items.map(item => (
          <li key={item} className="grid grid-cols-[14px_minmax(0,1fr)] gap-2">
            <span aria-hidden="true" className={`mt-[9px] block h-1.5 w-1.5 ${tone === 'act' ? 'bg-ink' : 'bg-gold'}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default async function ShojoDetailPage({ params }: PageProps) {
  const shojo = getShojo(params.slug)
  if (!shojo) notFound()

  const allProducts = shojo.products?.length ? await getCatalogProducts().catch(() => [] as CatalogProduct[]) : []
  const productGroups = shojoProducts(shojo, allProducts)
  const articles: ArticleCardItem[] = shojo.articles
    .map(slug => ({ href: `/guides/${slug}`, title: getArticleOverride(slug)?.title ?? '', image: thumbnailPath(slug) }))
    .filter(item => item.title)
  const others = SHOJO.filter(s => s.slug !== shojo.slug)
  const pageUrl = `${SITE_URL}/shojo/${shojo.slug}`

  return (
    <>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: '症状から調べる', url: `${SITE_URL}/shojo`, position: 2 },
          { name: shojo.label, url: pageUrl, position: 3 },
        ]}
      />
      <div className={`${CONTAINER} pb-14 lg:pb-20`}>
        <PageHeading
          title={
            <span className="flex items-start gap-3">
              <ShojoIcon name={shojo.icon} className="mt-1 h-8 w-8 text-ink-soft lg:h-10 lg:w-10" />
              <span className="min-w-0">{shojo.title}</span>
            </span>
          }
          lead={shojo.lead}
          crumbs={[{ label: 'ホーム', href: '/' }, { label: '症状から調べる', href: '/shojo' }, { label: shojo.label }]}
        />
        {productGroups.length > 0 && <PrDisclosure compact className="mt-4" />}

        {/* 今すぐやること */}
        <section aria-labelledby="now" className="mt-6 bg-navy px-5 py-5 text-white lg:mt-10 lg:px-7 lg:py-6">
          <h2 id="now" className="font-mincho text-[18px] font-bold tracking-[0.05em] lg:text-[21px]">今すぐやること</h2>
          <ol className="mt-3 space-y-2.5 text-[14px] leading-[1.8]">
            {shojo.now.map((step, i) => (
              <li key={step} className="grid grid-cols-[26px_minmax(0,1fr)] gap-2">
                <span className="flex h-6 w-6 items-center justify-center border border-white/50 text-[12px] font-bold">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* 絞り込みのヒント */}
        <section className="pt-10 lg:pt-14">
          <SectionTitle>季節と置き場所で絞り込む</SectionTitle>
          <ul className="mt-4 space-y-2.5 border-t border-line pt-4 text-[14px] leading-[1.85] text-ink-soft">
            {shojo.narrow.map(hint => (
              <li key={hint} className="grid grid-cols-[14px_minmax(0,1fr)] gap-2">
                <span aria-hidden="true" className="mt-[10px] block h-1.5 w-1.5 bg-gold" />
                <span>{hint}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 考えられる原因 */}
        <section className="pt-10 lg:pt-14">
          <SectionTitle>考えられる原因（多い順）</SectionTitle>
          <ol className="mt-4 border-t border-line">
            {shojo.causes.map((cause, i) => (
              <li key={cause.title} className="border-b border-line py-5 lg:py-6">
                <h3 className="flex items-baseline gap-3 font-mincho text-[17px] font-bold leading-snug text-ink lg:text-[19px]">
                  <span className="flex-none text-[14px] text-gold-dark">{String(i + 1).padStart(2, '0')}</span>
                  <span className="min-w-0">{cause.title}</span>
                </h3>
                <p className="mt-2 text-[12.5px] leading-[1.8] text-ink-muted">
                  <span className="mr-2 inline-block border border-line bg-paper px-1.5 text-[11.5px] text-ink-soft">多いとき</span>
                  {cause.often}
                </p>
                <dl className="mt-3 grid gap-3 text-[14px] leading-[1.85] lg:grid-cols-[repeat(2,minmax(0,1fr))] lg:gap-8">
                  <div className="min-w-0">
                    <dt className="text-[12.5px] font-bold text-ink">確かめ方</dt>
                    <dd className="mt-1 text-ink-soft">{cause.check}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[12.5px] font-bold text-ink">対処</dt>
                    <dd className="mt-1 text-ink-soft">{cause.fix}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[11.5px] leading-[1.8] text-ink-muted">関東の平地を想定した一般的な目安です。原因が分からないまま、肥料・活力剤・薬剤をまとめて与えるのは避け、一つずつ変えて様子を見てください。</p>
        </section>

        {/* 様子を見てよいとき／すぐ手を打つとき */}
        <section className="pt-10 lg:pt-14">
          <SectionTitle>様子を見てよいとき・すぐ手を打つとき</SectionTitle>
          <div className="mt-4 grid gap-3 lg:grid-cols-[repeat(2,minmax(0,1fr))] lg:gap-6">
            <SignList title="様子を見てよいとき" items={shojo.wait} tone="calm" />
            <SignList title="すぐ手を打つとき" items={shojo.act} tone="act" />
          </div>
          <p className="mt-3 text-[13px] leading-[1.85] text-ink-soft">
            弱ってしまったときの手順は
            <Link href="/guides/bonsai-revival-dying-rescue-methods" className="mx-1 border-b border-ink text-ink">盆栽が枯れそうなときの対処</Link>
            で説明しています。
          </p>
        </section>

        {/* 関連記事 */}
        {articles.length > 0 && (
          <section className="pt-10 lg:pt-14">
            <SectionTitle action={<Link href="/guides" className="border-b border-ink pb-0.5 text-[13px] text-ink">記事をすべて見る</Link>}>くわしく読む</SectionTitle>
            <div className="mt-4 lg:mt-6">
              <ArticleCardGrid items={articles} />
            </div>
          </section>
        )}

        {/* 役に立つもの */}
        {productGroups.length > 0 && (
          <section className="pt-10 lg:pt-14">
            <SectionTitle>手当てに使うもの</SectionTitle>
            {productGroups.map(group => (
              <div key={group.label} className="mt-5 border-t border-line pt-4 lg:mt-7">
                <h3 className="text-[15px] font-bold text-ink">{group.label}</h3>
                <p className="mt-1 text-[12.5px] leading-[1.8] text-ink-muted">{group.note}</p>
                <div className="mt-4 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-x-3.5 gap-y-6 sm:grid-cols-[repeat(3,minmax(0,1fr))] lg:gap-6">
                  {group.products.map(p => <CatalogProductCard key={p.id} product={p} sizes="(max-width: 639px) 46vw, 260px" />)}
                </div>
              </div>
            ))}
            <p className="mt-6 text-[13px] text-ink-soft">
              鉢・土・道具を樹に合わせてまとめて選ぶときは
              <Link href="/soroeru" className="mx-1 border-b border-ink text-ink">鉢・土・道具をそろえる</Link>
              が使えます。
            </p>
          </section>
        )}

        {/* ほかの症状 */}
        <section className="pt-10 lg:pt-14">
          <SectionTitle action={<Link href="/shojo" className="border-b border-ink pb-0.5 text-[13px] text-ink">症状の一覧</Link>}>ほかの症状から調べる</SectionTitle>
          <div className="mt-4 flex flex-wrap gap-2">
            {others.map(s => (
              <Link key={s.slug} href={`/shojo/${s.slug}`} className={`${chipClass()} min-h-[44px]`}>{s.label}</Link>
            ))}
          </div>
          <p className="mt-6 text-[13px] text-ink-soft">
            届いたばかりの盆栽なら
            <Link href="/hajimete" className="mx-1 border-b border-ink text-ink">はじめての1か月ガイド</Link>
            もあわせてご覧ください。
          </p>
        </section>
        <RelatedTools hrefs={['/teire', '/note', '/soroeru']} />
      </div>
    </>
  )
}
