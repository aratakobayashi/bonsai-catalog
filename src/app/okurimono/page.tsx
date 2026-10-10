import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import photoCredits from '@/data/photo-credits.json'
import { getCatalogProducts } from '@/lib/catalog'
import type { CatalogProduct } from '@/lib/catalog-model'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { ArticleCardGrid } from '@/components/article/RelatedArticleRows'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { Breadcrumbs, CONTAINER, SectionTitle } from '@/components/ui/design'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { SITE_URL } from '@/lib/site'
import { getSelection } from '@/lib/selections'
import { getArticleOverride, thumbnailPath } from '@/lib/article-overrides'
import {
  BUDGET_OPTIONS,
  OTHER_SCENES,
  SCENE_GUIDES,
  SCENE_OPTIONS,
  WHO_OPTIONS,
  okurimonoCatalogLink,
  okurimonoHref,
  okurimonoPicks,
  parseOkurimono,
  type OkurimonoState,
  type Option,
} from '@/lib/okurimono'
import { RelatedTools } from '@/components/layout/RelatedTools'

export const revalidate = 3600

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>
}

const HERO_PHOTO = '/images/selections/photos/bonsai-gift.jpg'
const NUMERALS = ['一', '二', '三']

// 入口のページは検索結果に出し、選んだあとの組み合わせごとのページは出さない
export function generateMetadata({ searchParams }: PageProps): Metadata {
  const { chosen } = parseOkurimono(searchParams)
  return {
    title: '贈り物ナビ｜相手・場面・予算から選ぶ盆栽と、のし・届ける時期の目安 - 盆栽コレクション',
    description: '贈る相手・場面・予算の3つを選ぶと、楽天市場に掲載中の盆栽から贈り物に向く3鉢を理由つきで選びます。母の日・敬老の日・長寿祝い・新築・開店祝いなど、場面ごとののしの表書きと届ける時期の目安、避けたいことも一緒にまとめました。',
    alternates: { canonical: '/okurimono' },
    ...(chosen && { robots: { index: false, follow: true } }),
  }
}

function Choice<T extends string>({ title, name, options, state }: { title: string; name: keyof OkurimonoState; options: Option<T>[]; state: OkurimonoState }) {
  return (
    <fieldset className="min-w-0 border-b border-line py-5 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 lg:py-6">
      <legend className="sr-only">{title}</legend>
      <div aria-hidden="true" className="mb-3 font-mincho text-base font-bold tracking-[0.04em] text-ink lg:mb-0 lg:pt-2 lg:text-lg">{title}</div>
      <div className="flex flex-wrap gap-2">
        {options.map(option => {
          const active = state[name] === option.value
          return (
            <Link
              key={option.value}
              href={okurimonoHref(state, { [name]: option.value } as Partial<OkurimonoState>)}
              scroll={false}
              aria-current={active ? 'true' : undefined}
              className={`flex min-h-12 flex-col justify-center border px-3.5 py-1.5 text-left ${active ? 'border-sumi bg-sumi text-white hover:text-white' : 'border-line bg-white text-ink hover:border-ink'}`}
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

function articleTitle(slug: string): string {
  return getArticleOverride(slug)?.title ?? slug
}

export default async function OkurimonoPage({ searchParams }: PageProps) {
  const state = parseOkurimono(searchParams)
  const products = await getCatalogProducts().catch(() => [] as CatalogProduct[])
  const { top, others, total } = okurimonoPicks(state, products)
  const catalogLink = okurimonoCatalogLink(state, products)
  const who = WHO_OPTIONS.find(o => o.value === state.who)!
  const scene = SCENE_OPTIONS.find(o => o.value === state.scene)!
  const budget = BUDGET_OPTIONS.find(o => o.value === state.budget)!
  const guide = SCENE_GUIDES[state.scene]
  const selections = guide.selections.map(slug => getSelection(slug)).filter((s): s is NonNullable<typeof s> => Boolean(s))
  const articleCards = guide.articles.map(slug => ({ href: `/guides/${slug}`, title: articleTitle(slug), image: thumbnailPath(slug) ?? null }))
  const allArticles = Array.from(new Set([...SCENE_OPTIONS.flatMap(o => SCENE_GUIDES[o.value].articles), 'article-34', 'article-28']))
  const credit = (photoCredits as Record<string, { creator?: string; license?: string; source?: string }>)[HERO_PHOTO]
  const recipient = state.who === 'self' ? '自分へのごほうび' : `${who.label}へ`

  return (
    <>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: '贈り物ナビ', url: `${SITE_URL}/okurimono`, position: 2 },
        ]}
      />

      <div className="pb-14 lg:pb-20">
        {/* 見出し：特集ページと同じ、写真の上に明朝の大見出し */}
        <header>
          <div className="lg:mx-auto lg:max-w-[1184px] lg:px-12">
            <Breadcrumbs items={[{ label: 'ホーム', href: '/' }, { label: '贈り物ナビ' }]} className="hidden pt-6 lg:block" />
          </div>
          <div className="relative h-[220px] overflow-hidden bg-ink sm:h-[280px] lg:mx-auto lg:mt-6 lg:h-[360px] lg:max-w-[1184px]">
            <Image src={HERO_PHOTO} alt="" fill priority sizes="(max-width: 1183px) 100vw, 1184px" className="object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(18,16,13,.82)_0%,rgba(18,16,13,.35)_55%,rgba(18,16,13,.1)_100%)] lg:bg-[linear-gradient(90deg,rgba(18,16,13,.85)_0%,rgba(18,16,13,.55)_45%,rgba(18,16,13,.05)_85%)]" />
            <div className="absolute inset-x-0 bottom-0 px-4 pb-5 lg:inset-y-0 lg:left-0 lg:flex lg:max-w-[620px] lg:flex-col lg:justify-center lg:px-14 lg:pb-0">
              <p className="flex items-center gap-3 text-[11px] tracking-[0.24em] text-[#d6ba84] lg:text-xs">
                贈り物
                <span className="h-px w-10 bg-[#d6ba84]" aria-hidden="true" />
              </p>
              <h1 className="mt-2 font-mincho text-[26px] font-bold leading-[1.45] tracking-[0.08em] text-white lg:mt-4 lg:text-[40px]">贈り物ナビ</h1>
              <p className="mt-4 hidden text-[15px] leading-[2] text-white/85 lg:block">
                誰に、どんな場面で、いくらくらいで。3つを選ぶと、掲載中の盆栽から贈りやすい3鉢と、のし・届ける時期の目安をまとめて出します。
              </p>
            </div>
          </div>
          {credit && (
            <p className="mt-1.5 px-4 text-right text-[11px] text-ink-muted lg:mx-auto lg:max-w-[1184px]">
              写真：
              {credit.source ? (
                <a href={credit.source} target="_blank" rel="noopener noreferrer" className="underline">{credit.creator || '出典'}</a>
              ) : (
                credit.creator
              )}
              {credit.license && ` / ${credit.license}`}
            </p>
          )}
          <div className="px-4 lg:hidden">
            <p className="mt-3 text-[13px] leading-[1.9] text-ink-soft">
              誰に、どんな場面で、いくらくらいで。3つを選ぶと、掲載中の盆栽から贈りやすい3鉢と、のし・届ける時期の目安をまとめて出します。
            </p>
          </div>
        </header>

        <div className={CONTAINER}>
          {/* 選ぶ（リンクで切り替える。JavaScript がなくても動く） */}
          <nav aria-label="条件を選ぶ" className="mt-6 border-t border-ink lg:mt-12">
            <Choice title="1. 誰に" name="who" options={WHO_OPTIONS} state={state} />
            <Choice title="2. 場面" name="scene" options={SCENE_OPTIONS} state={state} />
            <Choice title="3. 予算" name="budget" options={BUDGET_OPTIONS} state={state} />
          </nav>

          <section id="result" className="scroll-mt-20 pt-10 lg:pt-16" aria-labelledby="okurimono-result">
            <p className="text-[12px] tracking-[0.12em] text-gold-dark">なぜこの3つ</p>
            <h2 id="okurimono-result" className="mt-1.5 font-mincho text-[21px] font-bold leading-snug tracking-[0.05em] text-ink lg:text-[28px]">
              {recipient}、{scene.label}に贈る盆栽<span className="ml-2 text-[15px] font-normal text-ink-soft lg:text-[17px]">{budget.label}</span>
            </h2>
            <p className="mt-2 text-[13px] leading-[1.9] text-ink-soft lg:text-sm">
              予算に収まる盆栽のうち、場面に合う樹種、{state.who === 'self' ? '' : 'ラッピング・のし対応の表記、'}育てやすさ、写真の見やすさをもとに選びました。
            </p>
            <PrDisclosure className="mt-2.5" />

            {top.length > 0 ? (
              <ol className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-3 lg:gap-8">
                {top.map((pick, index) => (
                  <li key={pick.product.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 border-t border-ink pt-4 lg:flex lg:flex-col lg:gap-5 lg:pt-5">
                    <div className="order-2 min-w-0 lg:order-none">
                      <span className="font-mincho text-[30px] font-bold leading-none text-gold-dark lg:text-[36px]" aria-hidden="true">{NUMERALS[index]}</span>
                      <span className="sr-only">{index + 1}つ目</span>
                      <p className="mt-2 text-[13.5px] leading-[1.85] text-ink lg:mt-3 lg:min-h-[5.5em] lg:text-sm">{pick.reason}</p>
                    </div>
                    <div className="order-1 min-w-0 lg:order-none">
                      <CatalogProductCard product={pick.product} priority={index < 2} sizes="(max-width: 1023px) 46vw, 340px" />
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-6 border-y border-line py-8 text-center text-sm text-ink-soft">
                この予算に合う掲載商品が見つかりませんでした。予算を変えてお試しください。
              </p>
            )}
            <p className="mt-6 text-xs leading-relaxed text-ink-muted">
              樹種の向き・育てやすさは一般的な目安で、ラッピング・のしの対応は商品名の表記から判定しています。価格・在庫・のしの種類・お届け日の指定は、各ショップの商品ページでご確認ください。
            </p>
          </section>

          {/* 場面ごとの決まりごと */}
          <section className="mt-12 border border-line bg-white px-5 py-6 lg:mt-20 lg:px-10 lg:py-9" aria-labelledby="okurimono-manners">
            <p className="text-[12px] tracking-[0.12em] text-gold-dark">贈るときの決まりごと</p>
            <h2 id="okurimono-manners" className="mt-1.5 font-mincho text-[19px] font-bold tracking-[0.05em] text-ink lg:text-[24px]">{scene.label}に盆栽を贈るとき</h2>
            {state.who === 'self' && (
              <p className="mt-2 text-[13px] leading-[1.8] text-ink-soft">ご自身用なら、のしや表書きは要りません。贈り物にするときの目安として載せています。</p>
            )}
            <dl className="mt-5 border-t border-line text-[13.5px] leading-[1.85] lg:text-sm">
              <div className="border-b border-line py-4 lg:grid lg:grid-cols-[160px_minmax(0,1fr)] lg:gap-6">
                <dt className="font-mincho font-bold text-ink">のし・表書き</dt>
                <dd className="mt-1 text-ink-soft lg:mt-0">
                  {guide.noshi}
                  {state.who === 'business' && state.scene !== 'promotion' && (
                    <span className="mt-1 block">部署や会社の連名で贈るなら、表書きの下に「〇〇部一同」などと書きます。</span>
                  )}
                </dd>
              </div>
              <div className="border-b border-line py-4 lg:grid lg:grid-cols-[160px_minmax(0,1fr)] lg:gap-6">
                <dt className="font-mincho font-bold text-ink">届ける時期の目安</dt>
                <dd className="mt-1 text-ink-soft lg:mt-0">{guide.timing}</dd>
              </div>
              <div className="border-b border-line py-4 lg:grid lg:grid-cols-[160px_minmax(0,1fr)] lg:gap-6">
                <dt className="font-mincho font-bold text-ink">避けたいこと</dt>
                <dd className="mt-1 lg:mt-0">
                  <ul className="space-y-1.5 text-ink-soft">
                    {guide.avoid.map(item => (
                      <li key={item} className="relative pl-4 before:absolute before:left-0 before:top-[0.85em] before:h-px before:w-2 before:bg-gold-dark">{item}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div className="py-4 lg:grid lg:grid-cols-[160px_minmax(0,1fr)] lg:gap-6">
                <dt className="font-mincho font-bold text-ink">添えるもの</dt>
                <dd className="mt-1 text-ink-soft lg:mt-0">樹の名前と、置き場所・水やりの目安を書いたカード。届いたらすぐ箱から出し、明るい日陰で水を与えてもらうよう一言添えます。</dd>
              </div>
            </dl>

            {(articleCards.length > 0 || selections.length > 0) && (
              <div className="mt-6 lg:mt-8">
                {articleCards.length > 0 && (
                  <>
                    <h3 className="text-[13px] font-bold text-ink">くわしく読む</h3>
                    <div className="mt-3 lg:max-w-[680px]">
                      <ArticleCardGrid items={articleCards} />
                    </div>
                  </>
                )}
                {selections.length > 0 && (
                  <ul className="mt-6 border-t border-line text-sm">
                    {selections.map(selection => (
                      <li key={selection.slug} className="border-b border-line">
                        <Link href={`/selection/${selection.slug}`} className="group flex min-h-12 items-baseline gap-3 py-3.5">
                          <span className="w-[56px] flex-none text-[11px] text-gold-dark">特集</span>
                          <span className="flex-1 font-mincho font-bold leading-[1.6] text-ink group-hover:text-gold-dark">{selection.h1}</span>
                          <span className="text-ink-muted" aria-hidden="true">›</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>

          {/* ほかの候補 */}
          {others.length > 0 && (
            <section className="pt-12 lg:pt-20">
              <SectionTitle
                action={
                  <Link href={catalogLink.href} className="-my-3 inline-flex min-h-11 items-center text-[13px] text-ink lg:my-0 lg:min-h-0">
                    <span className="border-b border-ink pb-0.5">一覧で絞り込む</span>
                  </Link>
                }
              >
                ほかの候補
              </SectionTitle>
              <div className="mt-4 grid grid-cols-2 gap-x-3.5 gap-y-6 md:grid-cols-3 lg:mt-7 lg:grid-cols-4 lg:gap-6">
                {others.map(product => (
                  <CatalogProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}
          {catalogLink.count > 0 && (
            <div className="mt-8 text-center">
              <Link href={catalogLink.href} className="inline-flex min-h-12 items-center bg-sumi px-8 text-sm font-bold text-white hover:bg-sumi-light hover:text-white">
                近い条件の盆栽を一覧で見る（{catalogLink.count.toLocaleString()}件）
              </Link>
              {total > 0 && <p className="mt-2 text-[11.5px] text-ink-muted">予算・贈り物向けの表記などで絞り込んだ一覧が開きます</p>}
            </div>
          )}

          {/* 選択肢にない場面 */}
          <section className="pt-12 lg:pt-20">
            <h2 className="font-mincho text-[19px] font-bold tracking-[0.06em] text-ink lg:text-[22px]">ほかの場面で贈るとき</h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-2 lg:gap-6">
              {OTHER_SCENES.map(item => (
                <Link key={item.href} href={item.href} className="group block border border-line bg-white px-5 py-4 hover:border-ink">
                  <span className="font-mincho text-[16px] font-bold text-ink group-hover:text-gold-dark">{item.label}</span>
                  <span className="mt-1.5 block text-[13px] leading-[1.8] text-ink-soft">{item.text}</span>
                  <span className="mt-2 inline-flex min-h-11 items-center text-[13px] text-ink lg:min-h-0">
                    <span className="border-b border-ink pb-0.5">記事を読む</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* 場面別の記事 */}
          <section className="pt-12 lg:pt-20">
            <h2 className="font-mincho text-[19px] font-bold tracking-[0.06em] text-ink lg:text-[22px]">場面ごとの贈り方を読む</h2>
            <ul className="mt-3 border-t border-line text-sm">
              {allArticles.map(slug => (
                <li key={slug} className="border-b border-line">
                  <Link href={`/guides/${slug}`} className="group flex min-h-12 items-baseline gap-3 py-3.5">
                    <span className="flex-1 font-mincho font-bold leading-[1.6] text-ink group-hover:text-gold-dark">{articleTitle(slug)}</span>
                    <span className="text-ink-muted" aria-hidden="true">›</span>
                  </Link>
                </li>
              ))}
              <li className="border-b border-line">
                <Link href="/shindan" className="group flex min-h-12 items-baseline gap-3 py-3.5">
                  <span className="flex-1 font-mincho font-bold leading-[1.6] text-ink group-hover:text-gold-dark">置き場所や楽しみ方から探すなら かんたん盆栽診断</span>
                  <span className="text-ink-muted" aria-hidden="true">›</span>
                </Link>
              </li>
            </ul>
          </section>
          <RelatedTools hrefs={['/kumiawase', '/hajimete', '/shindan']} />
        </div>
      </div>
    </>
  )
}
