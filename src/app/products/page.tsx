import { Metadata } from 'next'
import { supabaseServer } from '@/lib/supabase-server'
import ProductsClient from './ProductsClient'
import type { Product } from '@/types'

export const metadata: Metadata = {
  alternates: { canonical: '/products' },
  title: '盆栽の商品カタログ｜樹種・価格・サイズから探す - 盆栽コレクション',
  description: '松柏類・雑木類・花もの・実ものなど、通販で買える盆栽を樹種・価格帯・サイズ・育てやすさから比較できます。初心者向けのミニ盆栽やギフト向けの盆栽も掲載しています。',
  keywords: ['盆栽', '盆栽 通販', 'ミニ盆栽', '盆栽 初心者', '盆栽 ギフト', '松', 'もみじ', '桜'],
}

// 1時間ごとに再生成（ISR）。商品一覧はサーバー側で描画する
export const revalidate = 3600

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabaseServer
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('商品データの取得エラー:', error)
    return []
  }
  return (data as Product[]) || []
}

export default async function ProductsPage() {
  const products = await getProducts()
  return <ProductsClient initialProducts={products} />
}
