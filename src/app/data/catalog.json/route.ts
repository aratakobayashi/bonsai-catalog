import { getCatalogProducts } from '@/lib/catalog-data'

// ブラウザで絞り込み・診断・組み合わせなどを計算するための商品データ（ビルド時に1回だけ作る静的なファイル）
export const dynamic = 'force-static'

export async function GET() {
  const products = await getCatalogProducts()
  return new Response(JSON.stringify(products), { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
}
