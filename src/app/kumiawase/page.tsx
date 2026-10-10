import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { getCatalogProducts } from '@/lib/catalog'
import type { CatalogProduct } from '@/lib/catalog-model'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { ProductThumb } from '@/components/catalog/ProductThumb'
import { PotPreview } from '@/components/kumiawase/PotPreview'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { CONTAINER, PageHeading, Placeholder } from '@/components/ui/design'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { SITE_URL } from '@/lib/site'
import {
  COLOR_OPTIONS,
  FINISH_OPTIONS,
  SHAPE_OPTIONS,
  SIZE_OPTIONS,
  TREE_OPTIONS,
  availableOptions,
  findKumi,
  kumiHref,
  optionCounts,
  parseKumi,
  toggleFinish,
  treeChoices,
  type KumiState,
  type Step,
} from '@/lib/kumiawase'

export const metadata: Metadata = {
  title: '組み合わせで選ぶ自分だけの一鉢｜樹・大きさ・鉢・仕上げから盆栽を探す - 盆栽コレクション',
  description:
    'もみじ・五葉松・桜・苔玉などの樹、大きさ、鉢の色と形、苔付き・石付き・受け皿付きなどの仕上げを順に選ぶと、植え付け済みで届く楽天市場の盆栽から組み合わせに合うものを探せます。届いたらそのまま飾れ、植え付けの手間はかかりません。',
  alternates: { canonical: '/kumiawase' },
}

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>
}

const STEPS: { step: Step; label: string }[] = [
  { step: 1, label: '樹' },
  { step: 2, label: '大きさ' },
  { step: 3, label: '鉢' },
  { step: 4, label: '仕上げ' },
  { step: 'result', label: '結果' },
]

// 選択肢のボタン（リンクで切り替える。JavaScript がなくても動く）
function OptionLink({ href, active, disabled, children, note }: { href: string; active: boolean; disabled?: boolean; children: ReactNode; note?: ReactNode }) {
  const base = 'flex min-h-[52px] flex-col justify-center border px-3.5 py-2 text-left'
  if (disabled && !active) {
    return (
      <span className={`${base} border-dashed border-line bg-paper text-ink-muted`} aria-disabled="true">
        <span className="text-[14px] leading-snug">{children}</span>
        {note && <span className="text-[11px] leading-snug">{note}</span>}
      </span>
    )
  }
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? 'true' : undefined}
      className={`${base} ${active ? 'border-ink bg-ink text-white hover:text-white' : 'border-line bg-white text-ink hover:border-ink'}`}
    >
      <span className="text-[14px] font-bold leading-snug">{children}</span>
      {note && <span className={`text-[11px] leading-snug ${active ? 'text-white/80' : 'text-ink-muted'}`}>{note}</span>}
    </Link>
  )
}

function StepTitle({ no, title, lead }: { no: number; title: string; lead: string }) {
  return (
    <div>
      <p className="text-[12px] tracking-[0.12em] text-gold-dark">STEP {no}</p>
      <h2 className="mt-1 font-mincho text-[21px] font-bold leading-snug tracking-[0.05em] text-ink lg:text-[26px]">{title}</h2>
      <p className="mt-2 text-[13.5px] leading-[1.8] text-ink-soft">{lead}</p>
    </div>
  )
}

function NextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} scroll={false} className="inline-flex min-h-[48px] items-center justify-center bg-ink px-6 text-[14px] font-bold text-white hover:bg-sumi-light hover:text-white">
      {children}
    </Link>
  )
}

function BackLink({ href }: { href: string }) {
  return (
    <Link href={href} scroll={false} className="inline-flex min-h-[48px] items-center px-2 text-[13px] text-ink-soft underline underline-offset-4 hover:text-gold-dark">
      ひとつ前に戻る
    </Link>
  )
}

export default async function KumiawasePage({ searchParams }: PageProps) {
  const state = parseKumi(searchParams)
  const products = await getCatalogProducts().catch(() => [] as CatalogProduct[])
  const trees = treeChoices(products)
  const available = availableOptions(products)
  const counts = optionCounts(state, products)
  const result = findKumi(state, products)
  const tree = TREE_OPTIONS.find(t => t.key === state.tree) ?? null
  const size = SIZE_OPTIONS.find(o => o.value === state.size)
  const color = COLOR_OPTIONS.find(o => o.value === state.color)
  const shape = SHAPE_OPTIONS.find(o => o.value === state.shape)
  const finishes = FINISH_OPTIONS.filter(o => state.finishes.includes(o.value))
  const go = (patch: Partial<KumiState>) => kumiHref(state, patch)

  const summaryRows: { step: Step; label: string; value: string | null }[] = [
    { step: 1, label: '樹', value: tree?.label ?? null },
    { step: 2, label: '大きさ', value: size?.label ?? (state.step !== 1 && state.step !== 2 ? 'こだわらない' : null) },
    {
      step: 3,
      label: '鉢',
      value: color || shape ? [color && `${color.label}`, shape?.label].filter(Boolean).join('・') : state.step === 4 || state.step === 'result' ? 'こだわらない' : null,
    },
    { step: 4, label: '仕上げ', value: finishes.length ? finishes.map(f => f.label).join('・') : state.step === 'result' ? 'こだわらない' : null },
  ]

  return (
    <>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: '組み合わせで選ぶ', url: `${SITE_URL}/kumiawase`, position: 2 },
        ]}
      />
      <div className={`${CONTAINER} pb-14 lg:pb-20`}>
        <PageHeading
          title="組み合わせで選ぶ、自分だけの一鉢"
          lead="樹・大きさ・鉢の雰囲気・仕上げを順に選ぶと、その組み合わせに近い盆栽を探します。どれも鉢に植わった状態で届く商品なので、植え付けの手間はかかりません。"
          crumbs={[{ label: 'ホーム', href: '/' }, { label: '組み合わせで選ぶ' }]}
        />
        <PrDisclosure className="mt-4" compact />

        {/* 手順 */}
        <nav id="steps" aria-label="選ぶ手順" className="mt-6 scroll-mt-20 border-y border-line lg:mt-10">
          <ol className="grid grid-cols-5">
            {STEPS.map((s, i) => {
              const current = state.step === s.step
              const reachable = s.step === 1 || Boolean(state.tree)
              const inner = (
                <>
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold ${current ? 'bg-ink text-white' : 'border border-line bg-white text-ink-soft'}`}>
                    {s.step === 'result' ? '✓' : i + 1}
                  </span>
                  <span className={`text-[12px] lg:text-[13px] ${current ? 'font-bold text-ink' : 'text-ink-soft'}`}>{s.label}</span>
                </>
              )
              return (
                <li key={String(s.step)} className="min-w-0">
                  {reachable && !current ? (
                    <Link href={go({ step: s.step })} scroll={false} className="flex min-h-[60px] flex-col items-center justify-center gap-1 hover:bg-paper-deep">
                      {inner}
                    </Link>
                  ) : (
                    <span aria-current={current ? 'step' : undefined} className={`flex min-h-[60px] flex-col items-center justify-center gap-1 ${current ? 'border-b-2 border-ink' : 'opacity-60'}`}>
                      {inner}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
          {/* あなたの一鉢（スマホでは手順の上、PCでは右に固定） */}
          <aside className="lg:order-2">
            <div className="border border-line bg-white p-4 lg:sticky lg:top-24 lg:p-5">
              <p className="font-mincho text-[17px] font-bold tracking-[0.06em] text-ink">あなたの一鉢</p>
              <div className="mt-3 grid grid-cols-[96px_minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,1fr)]">
                <div className="bg-paper-deep">
                  <PotPreview state={state} className="h-auto w-full" />
                </div>
                <dl className="text-[13px] leading-[1.7]">
                  {summaryRows.map(row => (
                    <div key={row.label} className="flex items-baseline gap-2 border-b border-line py-1.5 last:border-b-0">
                      <dt className="w-12 shrink-0 text-ink-muted">{row.label}</dt>
                      <dd className="min-w-0 flex-1 text-ink">{row.value ?? <span className="text-ink-muted">まだ選んでいません</span>}</dd>
                      {row.value && (state.tree || row.step === 1) && state.step !== row.step && (
                        <Link href={go({ step: row.step })} scroll={false} className="shrink-0 px-1 py-2 text-[12px] text-gold-dark underline underline-offset-2">
                          変える
                        </Link>
                      )}
                    </div>
                  ))}
                </dl>
              </div>
              <p className="mt-2 text-[11px] text-ink-muted">絵は組み合わせの目安です。届く商品の姿とは異なります。</p>
              {tree && state.step !== 'result' && (
                <div className="mt-4 border-t border-line pt-4">
                  <p className="text-[13px] text-ink">
                    {result.exactCount > 0 ? (
                      <>今の組み合わせに合う商品 <span className="font-bold">{result.exactCount}件</span></>
                    ) : (
                      <>ぴったり合う商品はまだありません。条件をゆるめて近いものを出します</>
                    )}
                  </p>
                  <Link href={go({ step: 'result' })} scroll={false} className="mt-3 flex min-h-[48px] items-center justify-center border border-ink px-4 text-[14px] font-bold text-ink hover:bg-ink hover:text-white">
                    この組み合わせで探す
                  </Link>
                </div>
              )}
            </div>
          </aside>

          <div className="min-w-0 lg:order-1">
            {state.step === 1 && (
              <section>
                <StepTitle no={1} title="樹を選ぶ" lead="育てたい樹を1つ選んでください。写真は、その樹の掲載商品の一例です。" />
                {trees.length === 0 ? (
                  <p className="mt-6 text-[13.5px] text-ink-muted">商品を読み込めませんでした。時間をおいてもう一度お試しください。</p>
                ) : (
                  <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                    {trees.map(({ option, count, sample }) => {
                      const active = state.tree === option.key
                      return (
                        <li key={option.key} className="min-w-0">
                          <Link
                            href={kumiHref(state, { tree: option.key, step: 2 })}
                            scroll={false}
                            aria-current={active ? 'true' : undefined}
                            className={`flex h-full flex-col border bg-white text-ink hover:border-ink hover:text-ink ${active ? 'border-ink outline outline-1 outline-ink' : 'border-line'}`}
                          >
                            <div className="relative aspect-square overflow-hidden bg-paper-deep">
                              {sample ? (
                                <ProductThumb src={sample.imageUrl} alt="" sizes="(max-width: 639px) 46vw, 200px" size={240} />
                              ) : (
                                <Placeholder className="absolute inset-0" />
                              )}
                            </div>
                            <div className="flex flex-1 flex-col gap-0.5 px-3 py-2.5">
                              <span className="font-mincho text-[15px] font-bold leading-snug">{option.label}</span>
                              <span className="text-[11.5px] leading-snug text-ink-muted">{option.note}</span>
                              <span className="mt-auto pt-1 text-[11.5px] text-ink-soft">{count}件</span>
                            </div>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>
            )}

            {state.step === 2 && tree && (
              <section>
                <StepTitle no={2} title="大きさを選ぶ" lead="置きたい場所に合わせて選んでください。大きさは販売店の表記と樹高から判定しています。" />
                <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-2.5 sm:grid-cols-3">
                  {SIZE_OPTIONS.map(o => (
                    <OptionLink key={o.value} href={go({ size: o.value, step: 3 })} active={state.size === o.value} disabled={counts.size[o.value] === 0} note={`${o.note}・${counts.size[o.value]}件`}>
                      {o.label}
                    </OptionLink>
                  ))}
                </div>
                <div className="mt-3">
                  <OptionLink href={go({ size: null, step: 3 })} active={false} note="大きさを問わずに探す">こだわらない</OptionLink>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <BackLink href={go({ step: 1 })} />
                </div>
              </section>
            )}

            {state.step === 3 && tree && (
              <section>
                <StepTitle no={3} title="鉢の雰囲気を選ぶ" lead="鉢の色と形を選んでください。商品名に書かれた焼き物名・色・形の言葉から判定しています。" />
                {counts.selectable > 0 && (
                  <p className="mt-3 border-l-2 border-gold pl-3 text-[12.5px] leading-[1.8] text-ink-soft">
                    {tree.label}には、注文のときに鉢を選べる商品が{counts.selectable}件あります。結果では「鉢が選べる」と表示します。
                  </p>
                )}
                <fieldset className="mt-6 min-w-0">
                  <legend className="text-[13px] font-bold text-ink">色</legend>
                  <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {available.colors.map(o => (
                      <OptionLink
                        key={o.value}
                        href={go({ color: state.color === o.value ? null : o.value })}
                        active={state.color === o.value}
                        disabled={counts.color[o.value] === 0 && counts.selectable === 0}
                        note={`${o.note}・${counts.color[o.value]}件`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="inline-block h-4 w-4 shrink-0 rounded-full border border-line" style={{ background: o.swatch }} aria-hidden="true" />
                          {o.label}
                        </span>
                      </OptionLink>
                    ))}
                    <OptionLink href={go({ color: null })} active={!state.color} note="色を問わない">こだわらない</OptionLink>
                  </div>
                </fieldset>
                <fieldset className="mt-6 min-w-0">
                  <legend className="text-[13px] font-bold text-ink">形</legend>
                  <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {available.shapes.map(o => (
                      <OptionLink
                        key={o.value}
                        href={go({ shape: state.shape === o.value ? null : o.value })}
                        active={state.shape === o.value}
                        disabled={counts.shape[o.value] === 0 && counts.selectable === 0}
                        note={`${o.note}・${counts.shape[o.value]}件`}
                      >
                        {o.label}
                      </OptionLink>
                    ))}
                    <OptionLink href={go({ shape: null })} active={!state.shape} note="形を問わない">こだわらない</OptionLink>
                  </div>
                </fieldset>
                <p className="mt-4 text-[11.5px] leading-[1.8] text-ink-muted">鉢の色や形が商品名に書かれていない商品も多いため、件数は少なめに出ます。合う商品が少ないときは、条件をゆるめて近いものを出します。</p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <NextLink href={go({ step: 4 })}>次へ（仕上げを選ぶ）</NextLink>
                  <BackLink href={go({ step: 2 })} />
                </div>
              </section>
            )}

            {state.step === 4 && tree && (
              <section>
                <StepTitle no={4} title="仕上げを選ぶ" lead="ほしいものをいくつでも選べます。もう一度押すと外れます。" />
                <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {available.finishes.map(o => {
                    const active = state.finishes.includes(o.value)
                    return (
                      <OptionLink key={o.value} href={go({ finishes: toggleFinish(state, o.value) })} active={active} disabled={counts.finish[o.value] === 0} note={`${o.note}・${counts.finish[o.value]}件`}>
                        <span className="flex items-center gap-2">
                          <span className={`inline-flex h-4 w-4 shrink-0 items-center justify-center border text-[10px] ${active ? 'border-white' : 'border-ink-muted'}`} aria-hidden="true">{active ? '✓' : ''}</span>
                          {o.label}
                        </span>
                      </OptionLink>
                    )
                  })}
                </div>
                {tree.kokedama && <p className="mt-3 text-[12px] text-ink-muted">苔玉は苔で包まれているため、すべて「苔付き」に含めています。</p>}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <NextLink href={go({ step: 'result' })}>この組み合わせで探す</NextLink>
                  <BackLink href={go({ step: 3 })} />
                </div>
              </section>
            )}

            {state.step === 'result' && tree && (
              <section>
                <p className="text-[12px] tracking-[0.12em] text-gold-dark">RESULT</p>
                <h2 className="mt-1 font-mincho text-[21px] font-bold leading-snug tracking-[0.05em] text-ink lg:text-[26px]">あなたの一鉢に近い{tree.label}</h2>
                {result.relaxed.length > 0 ? (
                  <p className="mt-3 border-l-2 border-gold pl-3 text-[13px] leading-[1.8] text-ink-soft">
                    すべての条件に合う商品が少ないため、「{result.relaxed.join('」「')}」の条件をゆるめて探しました。多くの条件に合う商品から順に並べています。
                  </p>
                ) : (
                  <p className="mt-3 text-[13px] leading-[1.8] text-ink-soft">
                    {result.matches.length > 0 ? '選んだ条件に合う商品です。写真のきれいな商品から順に並べています。' : ''}
                  </p>
                )}
                {result.matches.length === 0 ? (
                  <p className="mt-6 text-[13.5px] text-ink-muted">掲載中の商品が見つかりませんでした。樹を変えてお試しください。</p>
                ) : (
                  <ul className="mt-6 grid grid-cols-2 gap-x-3.5 gap-y-7 sm:grid-cols-3 lg:gap-x-6">
                    {result.matches.map((m, i) => (
                      <li key={m.product.id} className="min-w-0">
                        <CatalogProductCard product={m.product} priority={i < 2} sizes="(max-width: 639px) 46vw, 260px" />
                        {(m.matched.length > 0 || m.traits.selectable) && (
                          <ul className="mt-2 flex flex-wrap gap-1" aria-label="合っている条件">
                            {m.matched.map(label => (
                              <li key={label} className="bg-paper-deep px-1.5 py-0.5 text-[11px] text-ink-soft">{label}</li>
                            ))}
                            {m.traits.selectable && <li className="border border-gold-dark px-1.5 py-0.5 text-[11px] text-gold-dark">鉢が選べる</li>}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-6 text-[11.5px] leading-[1.8] text-ink-muted">
                  鉢の色・形・仕上げは商品名の表記から判定しています。鉢を選べる商品は、選べる鉢の種類を販売ページでご確認ください。
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <NextLink href={go({ step: 4 })}>条件を変える</NextLink>
                  <Link href="/kumiawase#steps" scroll={false} className="inline-flex min-h-[48px] items-center px-2 text-[13px] text-ink-soft underline underline-offset-4 hover:text-gold-dark">
                    はじめから選び直す
                  </Link>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
