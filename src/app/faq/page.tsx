'use client'

import Link from 'next/link'
import { getAllFAQs, type FAQItem } from '@/lib/faq-data'
import { FAQStructuredData } from '@/components/seo/StructuredData'
import { generateStaticPageBreadcrumbs } from '@/lib/breadcrumb-utils'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { CONTAINER, PageHeading } from '@/components/ui/design'
import { useState } from 'react'

// SEO metadata は layout.tsx で設定

// FAQ カテゴリー情報（質問のあるカテゴリーだけをタブに出す）
const categoryInfo: Record<NonNullable<FAQItem['category']>, { name: string; description: string }> = {
  general: { name: '基本的な質問', description: '盆栽全般に関する基本的な質問' },
  beginner: { name: '初心者向け', description: '盆栽を始める方への基本情報' },
  care: { name: '育て方・管理', description: '水やり、肥料、剪定など日常管理について' },
  seasonal: { name: '季節の管理', description: '春夏秋冬それぞれの管理について' },
  trouble: { name: 'トラブル', description: '枯れ・病気・害虫など困ったときの対処' },
  technique: { name: '技術・テクニック', description: '苔・樹形づくりなど一歩進んだ手入れ' },
  species: { name: '樹種別', description: '特定の樹種に関する専門的な質問' },
  purchase: { name: '購入・価格', description: '盆栽の購入方法や価格、送料について' },
}

type CategoryKey = keyof typeof categoryInfo

const ALL_FAQS = getAllFAQs().map(faq => ({ ...faq, category: faq.category ?? 'general' }))
const CATEGORY_KEYS = (Object.keys(categoryInfo) as CategoryKey[]).filter(key => ALL_FAQS.some(faq => faq.category === key))

// FAQ アイテム（問／答 のアコーディオン。線で区切る）
function FAQAccordion({ faq, isOpen, onToggle }: {
  faq: FAQItem
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex min-h-11 w-full items-baseline gap-3.5 py-4 text-left lg:py-5"
      >
        <span className="font-mincho text-[15px] font-bold text-gold-dark lg:text-[17px]" aria-hidden>問</span>
        <h3 className={`min-w-0 flex-1 text-sm leading-[1.6] text-ink lg:text-[15.5px] ${isOpen ? 'font-bold' : ''}`}>{faq.question}</h3>
        <span className="text-ink-muted" aria-hidden>{isOpen ? '−' : '＋'}</span>
      </button>
      {/* 答えは閉じていてもページ内に置く（構造化データと内容を一致させるため。表示はクラスで切り替え） */}
      <div className={`${isOpen ? 'flex' : 'hidden'} -mt-1 gap-3.5 pb-5 lg:-mt-1.5 lg:pb-6`}>
        <span className="font-mincho text-[15px] font-bold leading-[2] text-ink lg:text-[17px]" aria-hidden>答</span>
        <p className="min-w-0 flex-1 whitespace-pre-wrap text-sm leading-[2] text-ink lg:text-[15px]">{faq.answer}</p>
      </div>
    </div>
  )
}

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const allFAQs = ALL_FAQS

  // フィルタリングされたFAQ
  const filteredFAQs = allFAQs.filter(faq => {
    const matchesSearch = searchTerm === '' ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.keywords?.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // カテゴリーごとにまとめて表示（「すべて」のときは全カテゴリー、それ以外は選んだカテゴリーのみ）
  const groups = CATEGORY_KEYS
    .filter(key => selectedCategory === 'all' || key === selectedCategory)
    .map(key => ({ key, info: categoryInfo[key], faqs: filteredFAQs.filter(faq => faq.category === key) }))
    .filter(group => group.faqs.length > 0)

  // パンくずリスト
  const breadcrumbs = generateStaticPageBreadcrumbs(
    'よくある質問',
    'https://www.bonsai-collection.com/faq'
  )

  // 開閉状態は質問文で管理する（カテゴリーを切り替えても崩れない）
  const toggleItem = (key: string) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(key)) {
      newOpenItems.delete(key)
    } else {
      newOpenItems.add(key)
    }
    setOpenItems(newOpenItems)
  }

  return (
    <>
      <BreadcrumbStructuredData breadcrumbs={breadcrumbs} />
      <FAQStructuredData
        faqs={filteredFAQs.slice(0, 10)}
        baseUrl="https://www.bonsai-collection.com"
      />

      <div className={`${CONTAINER} pb-16 lg:pb-20`}>
        <div className="mx-auto max-w-[664px]">
          <PageHeading
            title="よくある質問"
            crumbs={[{ label: 'ホーム', href: '/' }, { label: '育て方', href: '/guides' }, { label: 'よくある質問' }]}
          />

          {/* 検索 */}
          <input
            type="search"
            placeholder="質問を検索（例：水やり、室内）"
            aria-label="質問を検索"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-4 h-12 w-full appearance-none rounded-none border-0 border-b border-ink bg-transparent px-0 text-sm text-ink placeholder:text-ink-muted outline-none focus:border-gold-dark focus:ring-0 lg:mt-6 lg:text-[14.5px]"
          />

          {/* もっとも多い誤解をカテゴリーに関係なく先頭に固定 */}
          <div className="mt-6 border-b border-line border-t border-t-ink py-5 lg:mt-9">
            <p className="font-mincho text-[15px] font-bold text-ink lg:text-[17px]">このサイトで購入できますか？</p>
            <p className="mt-1.5 text-[13px] leading-[1.9] text-ink-soft lg:text-sm">
              当サイトでは販売していません。「楽天市場で見る」「Amazonで見る」から各ショップで購入できます。注文・配送・返品は購入したショップへお問い合わせください。
            </p>
          </div>

          {/* カテゴリーのタブ */}
          <div className="-mx-4 mt-8 overflow-x-auto px-4 lg:mx-0 lg:mt-10 lg:overflow-visible lg:px-0">
            <div className="flex gap-5 border-b border-line lg:flex-wrap lg:gap-x-7">
              {(['all', ...CATEGORY_KEYS] as ('all' | CategoryKey)[]).map(key => {
                const active = selectedCategory === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedCategory(key)}
                    className={`flex min-h-11 flex-none items-center py-3 font-mincho text-sm font-bold lg:text-[15px] ${active ? 'text-ink shadow-[inset_0_-1.5px_0_#22201c]' : 'text-ink-muted hover:text-ink'}`}
                    aria-pressed={active}
                  >
                    {key === 'all' ? 'すべて' : categoryInfo[key].name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* FAQ カテゴリー別表示 */}
          <div className="mt-2 space-y-10">
            {groups.map(group => (
              <section key={group.key} aria-label={group.info.name}>
                {selectedCategory === 'all' && (
                  <div className="flex items-baseline gap-3 pb-2 pt-6">
                    <h2 className="font-mincho text-[17px] font-bold tracking-[0.04em] text-ink lg:text-lg">{group.info.name}</h2>
                    <p className="hidden text-xs text-ink-muted lg:block">{group.info.description}</p>
                  </div>
                )}
                <div className="border-t border-line">
                  {group.faqs.map(faq => (
                    <FAQAccordion
                      key={faq.question}
                      faq={faq}
                      isOpen={openItems.has(faq.question)}
                      onToggle={() => toggleItem(faq.question)}
                    />
                  ))}
                </div>
              </section>
            ))}

            {groups.length === 0 && (
              <div className="border-b border-line px-5 py-12 text-center">
                <p className="font-mincho font-bold text-ink">該当する質問が見つかりませんでした</p>
                <p className="mt-1 text-sm text-ink-soft">検索条件を変更してお試しください。</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                  }}
                  className="mt-5 inline-flex h-11 items-center bg-sumi px-6 text-sm text-white hover:bg-sumi-light"
                >
                  すべての質問を表示
                </button>
              </div>
            )}
          </div>

          <p className="mt-8 text-[13px] leading-[2] text-ink-soft">
            解決しない場合は
            <Link href="/contact" className="mx-1 border-b border-ink pb-0.5 text-ink hover:text-gold-dark">お問い合わせ</Link>
            からご連絡ください。育て方は
            <Link href="/guides" className="mx-1 border-b border-ink pb-0.5 text-ink hover:text-gold-dark">盆栽ガイド</Link>
            でも詳しく解説しています。
          </p>
        </div>
      </div>
    </>
  )
}
