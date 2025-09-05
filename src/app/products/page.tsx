import { Metadata } from 'next'
import { Suspense } from 'react'
import ProductsClient from './ProductsClient'

export const metadata: Metadata = {
  title: '商品カタログ - 盆栽コレクション',
  description: '厳選された盆栽商品を豊富に取り揃えています。カテゴリやタグで簡単に検索・フィルタリングが可能です。',
  keywords: ['盆栽', '商品', 'カタログ', '松', '楓', '梅', '桜', 'ミニ盆栽'],
}

function ProductsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-bonsai-green-600"></div>
          <p className="mt-4 text-gray-600">商品を読み込み中...</p>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsClient />
    </Suspense>
  )
}