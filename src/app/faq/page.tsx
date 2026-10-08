'use client'

import Link from 'next/link'
import {
  generalFAQs,
  purchaseFAQs,
  speciesFAQs,
  type FAQItem
} from '@/lib/faq-data'
import { FAQStructuredData } from '@/components/seo/StructuredData'
import { generateStaticPageBreadcrumbs } from '@/lib/breadcrumb-utils'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { CONTAINER, PageHeading, chipClass } from '@/components/ui/design'
import { useState } from 'react'

// SEO metadata は layout.tsx で設定

// FAQ カテゴリー情報
const categoryInfo = {
  general: { name: '基本的な質問', description: '盆栽全般に関する基本的な質問' },
  care: { name: '育て方・管理', description: '水やり、肥料、剪定など日常管理について' },
  beginner: { name: '初心者向け', description: '盆栽を始める方への基本情報' },
  purchase: { name: '購入・価格', description: '盆栽の購入方法や価格について' },
  species: { name: '樹種別', description: '特定の樹種に関する専門的な質問' },
}

type CategoryKey = keyof typeof categoryInfo

// FAQ アイテム（Q／A のアコーディオン）
function FAQAccordion({ faq, isOpen, onToggle }: {
  faq: FAQItem
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className={`rounded-xl border bg-white ${isOpen ? 'border-navy' : 'border-line'}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-start gap-3 px-4 py-4 text-left lg:px-5"
      >
        <span className="font-mincho text-[15px] font-bold leading-6 text-gold" aria-hidden>Q</span>
        <h3 className={`min-w-0 flex-1 text-[14px] leading-6 text-ink lg:text-[14.5px] ${isOpen ? 'font-bold' : ''}`}>{faq.question}</h3>
        <span className="text-lg leading-6 text-ink-muted" aria-hidden>{isOpen ? '−' : '＋'}</span>
      </button>
      {isOpen && (
        <div className="mx-4 flex gap-3 border-t border-line pb-4 pt-3.5 lg:mx-5">
          <span className="font-mincho text-[15px] font-bold leading-7 text-navy" aria-hidden>A</span>
          <div className="min-w-0 flex-1">
            <p className="whitespace-pre-wrap text-[14px] leading-[1.9] text-ink">{faq.answer}</p>
            {faq.keywords && faq.keywords.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {faq.keywords.map((keyword, index) => (
                  <span key={index} className="rounded bg-[#f1eee8] px-1.5 py-0.5 text-[11px] text-ink-soft">
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  // 全FAQを統合
  const allFAQs = [
    ...generalFAQs,
    ...purchaseFAQs,
    ...Object.values(speciesFAQs).flat()
  ]

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
  const groups = (Object.keys(categoryInfo) as CategoryKey[])
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

      <div className={`${CONTAINER} pb-12`}>
        <div className="mx-auto max-w-[880px]">
          <PageHeading
            title="よくある質問"
            lead={<span className="hidden lg:inline">盆栽に関するよくある質問と回答をまとめました。</span>}
            crumbs={[{ label: 'ホーム', href: '/' }, { label: '育て方', href: '/guides' }, { label: 'よくある質問' }]}
          />

          {/* 検索とカテゴリー */}
          <div className="mt-4 lg:mt-5">
            <input
              type="search"
              placeholder="質問を検索（例：水やり、室内）"
              aria-label="質問を検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 w-full rounded-lg border border-navy/40 bg-white px-4 text-[14px] text-ink placeholder:text-ink-muted outline-none focus:border-navy"
            />
            <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
              <button type="button" onClick={() => setSelectedCategory('all')} className={`shrink-0 ${chipClass(selectedCategory === 'all')}`} aria-pressed={selectedCategory === 'all'}>
                すべて
              </button>
              {(Object.keys(categoryInfo) as CategoryKey[]).map(key => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedCategory(key)}
                  className={`shrink-0 ${chipClass(selectedCategory === key)}`}
                  aria-pressed={selectedCategory === key}
                >
                  {categoryInfo[key].name}
                </button>
              ))}
            </div>
          </div>

          {/* もっとも多い誤解をカテゴリーに関係なく先頭に固定 */}
          <div className="mt-5 rounded-xl bg-navy px-4 py-4 text-white lg:mt-6 lg:px-5">
            <p className="text-[14px] font-bold">このサイトで購入できますか？</p>
            <p className="mt-1 text-[13px] leading-[1.8] text-white/85">
              当サイトでは販売していません。商品ページの「楽天市場で見る」「Amazonで見る」から各ショップで購入できます。注文・配送・返品は購入したショップへお問い合わせください。
            </p>
          </div>

          {/* FAQ カテゴリー別表示 */}
          <div className="mt-8 space-y-8">
            {groups.map(group => (
              <section key={group.key}>
                <div className="flex items-baseline gap-2.5">
                  <h2 className="font-mincho text-lg font-bold text-navy lg:text-xl">{group.info.name}</h2>
                  <p className="hidden text-xs text-ink-soft lg:block">{group.info.description}</p>
                </div>
                <div className="mt-3 space-y-2.5">
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
              <div className="rounded-xl border border-line bg-white px-5 py-10 text-center">
                <p className="font-bold text-ink">該当する質問が見つかりませんでした</p>
                <p className="mt-1 text-sm text-ink-soft">検索条件を変更してお試しください。</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                  }}
                  className="mt-4 inline-flex rounded-lg bg-navy px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-light"
                >
                  すべての質問を表示
                </button>
              </div>
            )}
          </div>

          <p className="mt-6 text-[13px] text-ink-soft">
            解決しない場合は
            <Link href="/contact" className="mx-1 text-navy underline underline-offset-2 hover:text-gold-dark">お問い合わせ</Link>
            からご連絡ください。育て方は
            <Link href="/guides" className="mx-1 text-navy underline underline-offset-2 hover:text-gold-dark">盆栽ガイド</Link>
            でも詳しく解説しています。
          </p>
        </div>
      </div>
    </>
  )
}
