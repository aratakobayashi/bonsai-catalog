// アフィリエイト（広告）リンクの共通設定

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
