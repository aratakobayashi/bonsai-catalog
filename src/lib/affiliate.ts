// アフィリエイト（広告）リンクの共通設定

// Amazon の掲載スイッチ（2026-10 時点で一時停止中）
// Amazon の商品（2025-09 に手入力した64件）は価格・レビューが更新されておらず、
// URL のアソシエイトタグ（oshikatsucoll-22）も別サイトのものだったため、公開サイトから一時的に外している。
// DB の行は削除していない。再開するときは、タグを当サイト用に差し替え（NEXT_PUBLIC_AMAZON_ASSOCIATE_ID）、
// 商品の価格・レビューを更新したうえで true に戻す。
// 一覧・商品ページ・サイトマップ・記事内リンク・ショップの絞り込み・ページの文言（「楽天市場・Amazon」、
// フッターとプライバシーポリシーの Amazon アソシエイトの表記など）は、すべてこの値で切り替わる。
export const AMAZON_ENABLED = false

// ページの文言で使うショップ名（Amazon を止めている間は楽天市場だけ）
export const SHOP_NAMES = AMAZON_ENABLED ? '楽天市場・Amazon' : '楽天市場'
export const SHOP_NAMES_AND = AMAZON_ENABLED ? '楽天市場とAmazon' : '楽天市場'

// 広告リンクには rel="sponsored" を付ける（Google のリンク属性ガイドライン）
export const AFFILIATE_LINK_REL = 'sponsored noopener noreferrer'

const AFFILIATE_HOST_PATTERN =
  /(^|\.)(amazon\.co\.jp|amzn\.to|amzn\.asia|a8\.net|rakuten\.co\.jp|valuecommerce\.com|moshimo\.com|accesstrade\.net|afi-b\.com)$/i

export function isAffiliateUrl(url: string | null | undefined): boolean {
  if (!url) return false
  try {
    return AFFILIATE_HOST_PATTERN.test(new URL(url).hostname)
  } catch {
    return false
  }
}

// 価格は掲載時点の手入力データのため、参考価格として表示する
export const PRICE_NOTE = '参考価格（掲載時点）。最新の価格・在庫はリンク先でご確認ください。'

// ステマ規制（景品表示法）対応の広告表記
export const PR_DISCLOSURE_TEXT =
  '本ページはプロモーション（広告）を含みます。商品リンクから購入された場合、当サイトに紹介料が支払われることがあります。'

// Amazon アソシエイトのトラッキングID（src/lib/amazon.ts と同じ値）
const AMAZON_ASSOCIATE_TAG = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_ID || 'oshikatsucoll-22'

const AMAZON_HOST_PATTERN = /(^|\.)amazon\.co\.jp$/i

// 記事本文などの Amazon リンクにアソシエイトタグを付ける。
// 既にタグがあるリンク・amzn.to の短縮リンク・Amazon 以外の URL はそのまま返す。
// トップページだけを指すリンク（商品の特定ができないもの）は null を返す（呼び出し側で検索URLに変えるか、リンクを外す）
export function toAmazonAffiliateUrl(url: string): string | null {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return url
  }
  if (!AMAZON_HOST_PATTERN.test(parsed.hostname)) return url
  if (parsed.pathname === '/' || parsed.pathname === '') {
    // 検索URL（/?k=...）以外のトップページは商品を特定できない
    if (!parsed.searchParams.get('k')) return null
  }
  parsed.protocol = 'https:'
  parsed.hostname = 'www.amazon.co.jp'
  if (!parsed.searchParams.get('tag')) parsed.searchParams.set('tag', AMAZON_ASSOCIATE_TAG)
  return parsed.toString()
}

// 商品名で Amazon を検索する URL（アソシエイトタグ付き）
export function amazonSearchUrl(keyword: string): string {
  const params = new URLSearchParams({ k: keyword, tag: AMAZON_ASSOCIATE_TAG })
  return `https://www.amazon.co.jp/s?${params.toString()}`
}

// 公開サイトに出さない商品か（DB の source 列の値で判定。normalizeProduct と同じく楽天以外は Amazon 扱い）
export function isHiddenProductSource(source: unknown): boolean {
  return !AMAZON_ENABLED && source !== 'rakuten'
}
