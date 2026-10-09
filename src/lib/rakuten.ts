// 楽天市場 商品検索API（2026年の新仕様: openapi.rakuten.co.jp ＋ accessKey 必須）
// サーバー側でのみ使う（キーをブラウザに渡さないため、クライアントコンポーネントから import しない）。結果は Next.js のデータキャッシュに6時間保存する
import { SITE_URL } from '@/lib/site'

const ITEM_SEARCH_URL = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701'
const CACHE_SECONDS = 6 * 60 * 60

// 楽天市場の「盆栽」ジャンル
export const BONSAI_GENRE_ID = 215202

// 盆栽と関係の薄い商品（造花など）を除く
const DEFAULT_NG_KEYWORD = '造花 フェイク 人工 イミテーション'

export type RakutenSort = 'standard' | '+itemPrice' | '-itemPrice' | '-reviewCount' | '-reviewAverage' | '-updateTimestamp'

export interface RakutenSearchParams {
  keyword?: string
  // 商品を1件指定して取得する（詳細ページの最新価格用）
  itemCode?: string
  // 楽天のジャンルID（盆栽本体に絞るときは BONSAI_GENRE_ID）
  genreId?: number
  ngKeyword?: string
  minPrice?: number
  maxPrice?: number
  sort?: RakutenSort
  page?: number
  hits?: number
  // キャッシュを使わずに取得する（接続確認用）
  fresh?: boolean
}

export interface RakutenItem {
  code: string
  name: string
  price: number
  url: string
  imageUrl: string | null
  shopName: string
  reviewAverage: number
  reviewCount: number
  freeShipping: boolean
  caption: string
  imageUrls: string[]
  affiliateRate: number | null
}

export interface RakutenSearchResult {
  items: RakutenItem[]
  total: number
  error?: string
}

export function isRakutenConfigured(): boolean {
  return Boolean(process.env.RAKUTEN_APP_ID && process.env.RAKUTEN_ACCESS_KEY)
}

// 一覧用に小さいサムネイルを指定する（楽天の画像サーバーの _ex パラメータ）
function thumbnail(url: string | undefined): string | null {
  if (!url) return null
  return url.replace(/\?_ex=\d+x\d+$/, '') + '?_ex=300x300'
}

interface RawItem {
  itemCode: string
  itemName: string
  itemPrice: number
  itemUrl: string
  affiliateUrl?: string
  mediumImageUrls?: string[]
  shopName: string
  reviewAverage?: number
  reviewCount?: number
  postageFlag?: number
  availability?: number
  itemCaption?: string
  affiliateRate?: number
}

class RakutenApiError extends Error {}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// エラーメッセージにキーが混ざらないよう伏せ字にする
function redact(message: string): string {
  let text = message
  for (const secret of [process.env.RAKUTEN_ACCESS_KEY, process.env.RAKUTEN_APP_ID, process.env.RAKUTEN_AFFILIATE_ID]) {
    if (secret) text = text.split(secret).join('***')
  }
  return text.slice(0, 120)
}

// cached：6時間キャッシュ／retry：エラー後のやり直し（1分だけキャッシュ）／fresh：キャッシュを使わない（同期・接続確認の API 専用）
type FetchMode = 'cached' | 'retry' | 'fresh'

async function requestItems(query: string, mode: FetchMode): Promise<RakutenSearchResult> {
  const response = await fetch(`${ITEM_SEARCH_URL}?${query}`, {
    // アプリ登録の「許可されたWebサイト」と一致させる
    headers: { Referer: `${SITE_URL}/`, Origin: SITE_URL },
    ...(mode === 'fresh'
      ? { cache: 'no-store' as const }
      : { next: { revalidate: mode === 'retry' ? 60 : CACHE_SECONDS, tags: ['rakuten'] } }),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || body.errors || body.error) {
    const detail = body?.errors?.errorMessage || body?.error_description || body?.error || ''
    throw new RakutenApiError(redact(`http_${response.status}${detail ? `: ${detail}` : ''}`))
  }

  const items = ((body.Items || []) as RawItem[]).map(item => ({
    code: item.itemCode,
    name: item.itemName,
    price: item.itemPrice,
    url: item.affiliateUrl || item.itemUrl,
    imageUrl: thumbnail(item.mediumImageUrls?.[0]),
    shopName: item.shopName,
    reviewAverage: item.reviewAverage ?? 0,
    reviewCount: item.reviewCount ?? 0,
    freeShipping: item.postageFlag === 0,
    caption: (item.itemCaption || '').slice(0, 2000),
    imageUrls: (item.mediumImageUrls || []).slice(0, 5).map(url => url.replace(/\?_ex=\d+x\d+$/, '') + '?_ex=500x500'),
    affiliateRate: typeof item.affiliateRate === 'number' ? item.affiliateRate : null,
  }))
  return { items, total: body.count ?? items.length }
}

// 通常はキャッシュ（6時間）を使う。エラー応答だった場合や1秒あたりの上限に当たった場合は、
// 少し待って1回だけやり直す。ページの表示中に「キャッシュを使わない取得」をすると、
// 静的に作るページが実行時にエラーになるため、やり直しも短いキャッシュ付きで行う
async function fetchItems(query: string, mode: FetchMode): Promise<RakutenSearchResult> {
  try {
    return await requestItems(query, mode)
  } catch (error) {
    if (mode !== 'cached' || !(error instanceof RakutenApiError)) throw error
    if (error.message.startsWith('http_429')) await sleep(1200)
    return requestItems(`${query}&_retry=1`, 'retry')
  }
}

export async function searchRakutenItems(params: RakutenSearchParams): Promise<RakutenSearchResult> {
  const applicationId = process.env.RAKUTEN_APP_ID
  const accessKey = process.env.RAKUTEN_ACCESS_KEY
  if (!applicationId || !accessKey) {
    return { items: [], total: 0, error: 'not_configured' }
  }

  const query = new URLSearchParams({
    applicationId,
    accessKey,
    format: 'json',
    formatVersion: '2',
    ...(params.itemCode
      ? { itemCode: params.itemCode }
      : { keyword: params.keyword ?? '盆栽', NGKeyword: params.ngKeyword ?? DEFAULT_NG_KEYWORD }),
    hits: String(params.hits ?? 30),
    page: String(params.page ?? 1),
    sort: params.sort ?? 'standard',
    ...(params.itemCode ? {} : { availability: '1' }),
    imageFlag: '1',
  })
  if (process.env.RAKUTEN_AFFILIATE_ID) query.set('affiliateId', process.env.RAKUTEN_AFFILIATE_ID)
  if (params.genreId) query.set('genreId', String(params.genreId))
  if (params.minPrice) query.set('minPrice', String(params.minPrice))
  if (params.maxPrice) query.set('maxPrice', String(params.maxPrice))

  try {
    return await fetchItems(query.toString(), params.fresh ? 'fresh' : 'cached')
  } catch (error) {
    // 想定外の例外のメッセージにはリクエストURL（キーを含む）が入ることがあるため外に出さない
    const code = error instanceof RakutenApiError ? error.message : 'internal_error'
    console.error('楽天API エラー:', error instanceof RakutenApiError ? code : redact(String(error)))
    return { items: [], total: 0, error: code }
  }
}
