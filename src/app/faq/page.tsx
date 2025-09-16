'use client'

import Head from 'next/head'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  generalFAQs,
  purchaseFAQs,
  speciesFAQs,
  getFAQsByCategory,
  searchFAQs,
  type FAQItem
} from '@/lib/faq-data'
import { FAQStructuredData, WebSiteStructuredData } from '@/components/seo/StructuredData'
import { generateStaticPageBreadcrumbs } from '@/lib/breadcrumb-utils'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { Search, HelpCircle, BookOpen, ShoppingCart, Leaf, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

// SEO metadata は layout.tsx または page.tsx で設定

// FAQ カテゴリー情報
const categoryInfo = {
  general: {
    name: '基本的な質問',
    icon: <HelpCircle className="h-5 w-5" />,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    description: '盆栽全般に関する基本的な質問'
  },
  care: {
    name: '育て方・管理',
    icon: <Leaf className="h-5 w-5" />,
    color: 'bg-green-50 text-green-700 border-green-200',
    description: '水やり、肥料、剪定など日常管理について'
  },
  beginner: {
    name: '初心者向け',
    icon: <BookOpen className="h-5 w-5" />,
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    description: '盆栽を始める方への基本情報'
  },
  purchase: {
    name: '購入・価格',
    icon: <ShoppingCart className="h-5 w-5" />,
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    description: '盆栽の購入方法や価格について'
  },
  species: {
    name: '樹種別',
    icon: <Leaf className="h-5 w-5" />,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: '特定の樹種に関する専門的な質問'
  }
}

// FAQ アイテム コンポーネント
function FAQAccordion({ faq, isOpen, onToggle }: {
  faq: FAQItem
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
      >
        <h3 className="font-medium text-gray-900 pr-4">{faq.question}</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
          {faq.keywords && faq.keywords.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {faq.keywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
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

  // パンくずリスト
  const breadcrumbs = generateStaticPageBreadcrumbs(
    'よくある質問',
    'https://www.bonsai-collection.com/faq'
  )

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems)
    const itemKey = `${selectedCategory}-${index}`
    if (newOpenItems.has(itemKey)) {
      newOpenItems.delete(itemKey)
    } else {
      newOpenItems.add(itemKey)
    }
    setOpenItems(newOpenItems)
  }

  return (
    <>
      <Head>
        <title>よくある質問 - 盆栽コレクション</title>
        <meta name="description" content="盆栽に関するよくある質問と回答をまとめました。初心者の方から上級者まで、盆栽の育て方、選び方、購入方法など幅広い質問にお答えします。" />
        <meta name="keywords" content="盆栽,FAQ,よくある質問,育て方,初心者,購入方法,管理,手入れ" />
        <meta property="og:title" content="よくある質問 - 盆栽コレクション" />
        <meta property="og:description" content="盆栽に関するよくある質問と回答をまとめました。初心者から上級者まで役立つ情報満載。" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.bonsai-collection.com/faq" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="よくある質問 - 盆栽コレクション" />
        <meta name="twitter:description" content="盆栽に関するよくある質問と回答をまとめました。" />
        <link rel="canonical" href="https://www.bonsai-collection.com/faq" />
      </Head>
      <BreadcrumbStructuredData breadcrumbs={breadcrumbs} />
      <FAQStructuredData
        faqs={filteredFAQs.slice(0, 10)}
        baseUrl="https://www.bonsai-collection.com"
      />
      <WebSiteStructuredData baseUrl="https://www.bonsai-collection.com" />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          {/* ヘッダー */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
              よくある質問
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              盆栽に関するよくある質問と回答をまとめました。<br />
              初心者の方から上級者まで、お役に立つ情報をご覧いただけます。
            </p>
          </div>

          {/* 検索とフィルター */}
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="p-6">
              <div className="space-y-4">
                {/* 検索バー */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="質問を検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* カテゴリーフィルター */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === 'all' ? 'primary' : 'outline'}
                    onClick={() => setSelectedCategory('all')}
                    className="text-sm"
                  >
                    すべて
                  </Button>
                  {Object.entries(categoryInfo).map(([key, info]) => (
                    <Button
                      key={key}
                      variant={selectedCategory === key ? 'primary' : 'outline'}
                      onClick={() => setSelectedCategory(key)}
                      className="text-sm flex items-center gap-2"
                    >
                      {info.icon}
                      {info.name}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* FAQ カテゴリー別表示 */}
          <div className="max-w-4xl mx-auto space-y-8">
            {selectedCategory === 'all' ? (
              // 全カテゴリー表示
              Object.entries(categoryInfo).map(([categoryKey, categoryData]) => {
                const categoryFAQs = allFAQs.filter(faq => faq.category === categoryKey)
                if (categoryFAQs.length === 0) return null

                return (
                  <div key={categoryKey}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`p-2 rounded-lg ${categoryData.color}`}>
                        {categoryData.icon}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{categoryData.name}</h2>
                        <p className="text-gray-600">{categoryData.description}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {categoryFAQs.map((faq, index) => (
                        <FAQAccordion
                          key={`${categoryKey}-${index}`}
                          faq={faq}
                          isOpen={openItems.has(`${categoryKey}-${index}`)}
                          onToggle={() => toggleItem(index)}
                        />
                      ))}
                    </div>
                  </div>
                )
              })
            ) : (
              // 選択されたカテゴリーのみ表示
              <div>
                {selectedCategory !== 'all' && categoryInfo[selectedCategory as keyof typeof categoryInfo] && (
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-lg ${categoryInfo[selectedCategory as keyof typeof categoryInfo].color}`}>
                      {categoryInfo[selectedCategory as keyof typeof categoryInfo].icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {categoryInfo[selectedCategory as keyof typeof categoryInfo].name}
                      </h2>
                      <p className="text-gray-600">
                        {categoryInfo[selectedCategory as keyof typeof categoryInfo].description}
                      </p>
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  {filteredFAQs.map((faq, index) => (
                    <FAQAccordion
                      key={`${selectedCategory}-${index}`}
                      faq={faq}
                      isOpen={openItems.has(`${selectedCategory}-${index}`)}
                      onToggle={() => toggleItem(index)}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredFAQs.length === 0 && (
              <div className="text-center py-12">
                <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  該当する質問が見つかりませんでした
                </h3>
                <p className="text-gray-600 mb-6">
                  検索条件を変更してお試しください。
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                  }}
                >
                  すべての質問を表示
                </Button>
              </div>
            )}
          </div>

          {/* お問い合わせCTA */}
          <div className="max-w-4xl mx-auto mt-12">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  お探しの質問が見つかりませんでしたか？
                </h3>
                <p className="text-gray-600 mb-6">
                  その他のご質問やお困りのことがございましたら、お気軽にお問い合わせください。
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild>
                    <Link href="/contact">
                      お問い合わせ
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/guides">
                      盆栽ガイドを見る
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}