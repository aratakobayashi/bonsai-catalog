// 記事本文の表示時の補正（リンク切れ・仮のリンク・アフィリエイトリンク・消えた画像）と、
// 記事の樹種・話題の判定（関連記事・記事下の案内に使う）
import { AFFILIATE_LINK_REL, AMAZON_ENABLED, amazonSearchUrl, isAffiliateUrl, toAmazonAffiliateUrl } from '@/lib/affiliate'
import { isArticleHidden, isArticleListable } from '@/lib/content-policy'

// ---------------------------------------------------------------------------
// 文字列の正規化
// ---------------------------------------------------------------------------

// 比較用（全角半角をそろえ、記号・空白を除く）
export function normalizeForMatch(text: string): string {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^\p{L}\p{N}]/gu, '')
}

// HTML の実体参照を戻す（属性値・見出しの文字列用）
export function decodeEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

const escapeAttr = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

// ---------------------------------------------------------------------------
// 本文先頭の「記事タイトルと同じ見出し」を外す（ページの h1 と重複するため）
// ---------------------------------------------------------------------------

export function stripLeadingTitleHeading(content: string, title: string): string {
  if (!content) return content
  const match = content.match(/^\s*(#{1,2})[ \t]+(.+?)[ \t]*#*[ \t]*(?:\r?\n|$)/)
  if (!match) return content
  const [whole, hashes, text] = match
  const headingText = normalizeForMatch(text.replace(/\{#[^}]*\}/g, '').replace(/\*\*/g, ''))
  const titleText = normalizeForMatch(title)
  // 先頭の大見出し（#）は記事タイトルの言い換えなので外す。## はタイトルと同じときだけ外す
  if (hashes === '#' || headingText === titleText) {
    return content.slice(whole.length).replace(/^\s*(?:-{3,}|\*{3,})\s*\n/, '')
  }
  return content
}

// ---------------------------------------------------------------------------
// リンク・画像の補正
// ---------------------------------------------------------------------------

export interface ArticleLinkContext {
  // 公開中の記事（slug とタイトル）
  articles: { slug: string; title: string }[]
  // 公開中のイベントの slug。取得できなかったときは null（イベントへのリンクはそのまま残す）
  eventSlugs: ReadonlySet<string> | null
}

// 旧サイトの URL で、同じ内容の記事があるもの
const LEGACY_PATHS: Record<string, string> = {
  '/bonsai-watering': '/guides/bonsai-watering-master-guide-2025',
  '/bonsai-fertilizer': '/guides/article-8',
  '/bonsai-beginner-guide': '/guides/article-11',
  '/mini-bonsai-guide': '/guides/article-4',
}

// 旧ブログ（bonsai-guidebook.net）の英字 slug と、同じ内容の記事
const GUIDEBOOK_SLUGS: Record<string, string> = {
  'bonsai-fertilizer': 'article-8',
  'bonsai-hajimekata': 'article-11',
  'bonsai-tools': 'article-9',
  'goyomatsu-guide': 'article-6',
  'goyoumatsu-guide': 'article-6',
  'goyomatsu-bonsai': 'article-6',
  'ume-guide': 'article-13',
  'ume-bonsai': 'article-13',
}

// サイト内で実在するトップレベルのパス
const SITE_SECTIONS = new Set([
  'products', 'selection', 'shindan', 'gardens', 'events', 'guides', 'faq', 'about', 'contact', 'privacy', 'terms', 'favorites',
])

// 表示できなくなった画像（Unsplash 側で削除されたもの）
const DEAD_IMAGE_PATTERNS = [
  'photo-1572831242966-e5d4d9b7de8a',
  'photo-1578663112610-67bb9b528009',
  'photo-1578663177146-8b5f09b73874',
  'photo-1604073519771-5c4b86ba7f62',
  'photo-1609437162301-9a4f85ea4ea9',
  'photo-1416269972824-4927212c965d',
  'photo-1594736797933-d0c71c5e123b',
  'photo-1607454952517-e9bbf5f4adb7',
]

// 中身のない仮のリンク先（ダミー URL）
const PLACEHOLDER_URL_PATTERNS = [
  /^https?:\/\/(?:www\.)?example\.com/i,
  /^https?:\/\/goo\.gl\//i, // 短縮URLサービス終了・仮の地図リンク
  /^https?:\/\/doi\.org\/10\.x+/i,
  /a8mat=X+(?:&|$)/,
  /^https?:\/\/(?:www\.)?bonsai-guidebook\.net\/?$/i,
]

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// リンクを外すと意味がなくなる案内文（リンク先がないときは文言ごと消す）
const LINK_ONLY_TEXT = /^[\s▶►▷👉📖→»>・]*(?:記事を読む|続きを読む|詳しくはこちら|(?:この商品の)?詳細(?:・申込)?はこちら|こちら|詳細を見る)[\s»→>]*$/u

// Amazon へのボタン風の案内文（Amazon の掲載を止めている間は、リンクを外すと意味がなくなるので文言ごと消す）
const AMAZON_BUTTON_TEXT = /^[\s▶►▷👉🛒→»>・]*(?:amazon|アマゾン)(?:で|の|を|は)?(?:見る|詳細を見る|詳しく見る|購入する|購入|買う|チェック(?:する)?|探す|価格を見る|価格をチェック|最新価格を見る|商品ページ(?:を見る)?|はこちら|こちら)?[\s»→>]*$/iu

// Amazon のリンク先（短縮URLを含む）
const AMAZON_LINK_HOST = /(^|\.)(?:amazon\.co\.jp|amazon\.jp|amazon\.com|amzn\.to|amzn\.asia)$/i

// 汎用の文言（商品名ではないので検索キーワードにしない）
const GENERIC_LINK_TEXT = /^(?:amazon|アマゾン|こちら|詳細|詳しく|購入|見る|チェック|リンク)/i

function findArticleByText(text: string, ctx: ArticleLinkContext): string | null {
  const key = normalizeForMatch(text)
  if (key.length < 6) return null
  const hit = ctx.articles.find(article => {
    if (!isArticleListable(article.slug)) return false
    const title = normalizeForMatch(article.title)
    return title.startsWith(key) || key.startsWith(title)
  })
  return hit ? `/guides/${hit.slug}` : null
}

// 旧ブログのリンクを同じ内容の記事に置き換える（見つからなければ null）
function mapGuidebookUrl(url: URL, linkText: string, ctx: ArticleLinkContext): string | null {
  const segments = url.pathname.split('/').filter(Boolean).map(safeDecode)
  const last = segments[segments.length - 1] || ''
  if (GUIDEBOOK_SLUGS[last]) return `/guides/${GUIDEBOOK_SLUGS[last]}`
  if (last && !/^\d+$/.test(last) && last !== '...') {
    const bySegment = findArticleByText(last, ctx)
    if (bySegment) return bySegment
  }
  return findArticleByText(linkText.replace(/^[^\p{L}\p{N}]+/u, ''), ctx)
}

// dropText：リンクを外したうえで、リンク文言も残さない
type LinkDecision = { keep: true; href: string; external: boolean } | { keep: false; dropText?: boolean }

// サイト内リンクの判定（存在しないページなら外し、同じ内容のページがあれば置き換える）
function resolveInternalPath(pathWithQuery: string, ctx: ArticleLinkContext | undefined): string | null {
  const [pathPart, ...rest] = pathWithQuery.split(/(?=[?#])/)
  const suffix = rest.join('')
  const path = safeDecode(pathPart).replace(/\/+$/, '') || '/'
  if (path === '/') return '/' + suffix
  if (LEGACY_PATHS[path]) return LEGACY_PATHS[path]

  const segments = path.split('/').filter(Boolean)
  const section = segments[0]
  if (!SITE_SECTIONS.has(section)) return null

  if (section === 'guides' && segments[1]) {
    const slug = segments[1]
    if (isArticleHidden(slug)) return null
    if (ctx && !ctx.articles.some(article => article.slug === slug)) return null
  }
  if (section === 'events' && segments[1] && ctx?.eventSlugs && !ctx.eventSlugs.has(segments[1])) return null
  if (section === 'products' && segments[1]) {
    // 商品詳細は ID（UUID）、カテゴリは /products/category/<slug>。商品名のままのリンクは存在しない
    if (segments[1] !== 'category' && !UUID_RE.test(segments[1])) return null
  }
  return pathPart + suffix
}

function decideLink(rawHref: string, linkText: string, ctx: ArticleLinkContext | undefined): LinkDecision {
  let href = decodeEntities(rawHref).trim()
  if (!href || href === '#') return { keep: false }
  if (href.startsWith('//')) href = `https:${href}`

  // ページ内リンク（見出しの有無は呼び出し側で確認する）
  if (href.startsWith('#')) return { keep: true, href, external: false }
  // 本文中のメールアドレスは実在を確認できない（当サイトの窓口はお問い合わせフォーム）ため、リンクにしない
  if (/^mailto:/i.test(href)) return { keep: false }
  if (/^tel:/i.test(href)) return { keep: true, href, external: false }

  // 「価格：3,980円」「関連記事リンク」など、URL ではない仮のリンク先
  if (!/^https?:\/\//i.test(href) && !href.startsWith('/')) return { keep: false }
  if (PLACEHOLDER_URL_PATTERNS.some(pattern => pattern.test(href))) return { keep: false }

  // 旧ドメイン・自サイトの絶対URLはサイト内リンクとして扱う
  const ownSite = href.match(/^https?:\/\/(?:www\.)?(?:bonsai-collection\.com|bonsai-catalog\.vercel\.app)(\/[^\s]*)?$/i)
  if (ownSite) href = ownSite[1] || '/'

  if (href.startsWith('/')) {
    const resolved = resolveInternalPath(href, ctx)
    return resolved ? { keep: true, href: resolved, external: false } : { keep: false }
  }

  let url: URL
  try {
    url = new URL(href)
  } catch {
    return { keep: false }
  }

  if (/(^|\.)bonsai-guidebook\.net$/i.test(url.hostname)) {
    const mapped = ctx ? mapGuidebookUrl(url, linkText, ctx) : null
    return mapped ? { keep: true, href: mapped, external: false } : { keep: false }
  }

  // Amazon の掲載を止めている間（src/lib/affiliate.ts の AMAZON_ENABLED）は、Amazon へのリンクを外して文言だけ残す。
  // 「Amazonで見る」などの案内文や、URL そのままの文言は残しても意味がないので消す
  if (!AMAZON_ENABLED && AMAZON_LINK_HOST.test(url.hostname)) {
    return { keep: false, dropText: AMAZON_BUTTON_TEXT.test(linkText) || /^https?:\/\//i.test(linkText) }
  }

  if (/(^|\.)amazon\.co\.jp$/i.test(url.hostname)) {
    const affiliate = toAmazonAffiliateUrl(url.toString())
    if (affiliate) return { keep: true, href: affiliate, external: true }
    // 商品を特定できない Amazon トップへのリンクは、リンク文言（商品名）の検索結果にする
    const keyword = linkText.replace(/[\s　]+/g, ' ').trim()
    if (keyword.length >= 4 && !GENERIC_LINK_TEXT.test(keyword)) {
      return { keep: true, href: amazonSearchUrl(keyword), external: true }
    }
    return { keep: false }
  }

  return { keep: true, href, external: true }
}

// marked が出力した HTML のリンク・画像を補正する
export function rewriteArticleHtml(html: string, ctx?: ArticleLinkContext): string {
  // 表示できない画像は消す（キャプションの空段落も含めて）
  // 画像の URL ではないもの（「CAPTION」などの仮の値）も消す
  let out = html.replace(/<img\s[^>]*src="([^"]*)"[^>]*>/g, (tag, src: string) =>
    DEAD_IMAGE_PATTERNS.some(pattern => src.includes(pattern)) || !/^(?:https?:\/\/|\/)/i.test(src) ? '' : tag
  )

  const headingIds = new Set(Array.from(out.matchAll(/\sid="([^"]+)"/g), m => decodeEntities(m[1])))

  out = out.replace(/<a\s([^>]*)>([\s\S]*?)<\/a>/g, (whole, attrs: string, inner: string) => {
    const hrefMatch = attrs.match(/href="([^"]*)"/)
    if (!hrefMatch) return inner
    const linkText = decodeEntities(inner.replace(/<[^>]*>/g, '')).trim()
    // 仮のリンク先（example.com など）の「Amazonで見る」も、Amazon を止めている間は文言ごと消す
    const unwrap = () => (LINK_ONLY_TEXT.test(linkText) || (!AMAZON_ENABLED && AMAZON_BUTTON_TEXT.test(linkText)) ? '' : inner)
    const decision = decideLink(hrefMatch[1], linkText, ctx)
    if (!decision.keep) return decision.dropText ? '' : unwrap()

    if (decision.href.startsWith('#')) {
      const id = safeDecode(decision.href.slice(1))
      if (!headingIds.has(id)) return unwrap()
    }

    const otherAttrs = attrs
      .replace(/\s*\bhref="[^"]*"/, '')
      .replace(/\s*\b(?:rel|target|class)="[^"]*"/g, '')
      .trim()
    const extra = otherAttrs ? ` ${otherAttrs}` : ''
    if (!decision.external) return `<a href="${escapeAttr(decision.href)}"${extra}>${inner}</a>`
    const rel = isAffiliateUrl(decision.href) ? AFFILIATE_LINK_REL : 'noopener noreferrer'
    return `<a href="${escapeAttr(decision.href)}"${extra} target="_blank" rel="${rel}">${inner}</a>`
  })

  // 画像・案内文を消して空になった強調・段落・リスト項目を除く
  return out
    .replace(/<(strong|em)>\s*<\/\1>/g, '')
    .replace(/<p[^>]*>\s*(?:<br\s*\/?>\s*)*<\/p>/g, '')
    .replace(/<li[^>]*>\s*<\/li>/g, '')
}

// ---------------------------------------------------------------------------
// 記事の樹種・話題（関連記事・記事下の案内）
// ---------------------------------------------------------------------------

// 樹種と、商品一覧のカテゴリ（/products/category/<slug>）の対応。上から順に判定する
const SPECIES_RULES: { category: string; label: string; pattern: RegExp }[] = [
  { category: 'goyomatsu', label: '五葉松', pattern: /五葉松|ごようまつ|ゴヨウマツ/ },
  { category: 'kuromatsu', label: '黒松', pattern: /黒松|クロマツ/ },
  { category: 'akamatsu', label: '赤松', pattern: /赤松|アカマツ/ },
  { category: 'shimpaku', label: '真柏', pattern: /真柏|シンパク|しんぱく|糸魚川/ },
  { category: 'momiji', label: 'もみじ', pattern: /もみじ|モミジ|紅葉|楓|カエデ/ },
  { category: 'sakura', label: '桜', pattern: /桜|サクラ/ },
  { category: 'ume', label: '梅・長寿梅', pattern: /梅/ },
  { category: 'satsuki', label: 'さつき', pattern: /さつき|サツキ|皐月|ツツジ/ },
  { category: 'keyaki', label: '欅（けやき）', pattern: /欅|ケヤキ/ },
  { category: 'sansho', label: '山椒', pattern: /山椒|サンショウ/ },
  { category: 'nanten', label: '南天', pattern: /南天|ナンテン/ },
  { category: 'himeringo', label: '姫りんご', pattern: /姫リンゴ|姫りんご|ヒメリンゴ/ },
  { category: 'olive', label: 'オリーブ', pattern: /オリーブ/ },
  { category: 'gajumaru', label: 'ガジュマル', pattern: /ガジュマル/ },
  { category: 'kokedama', label: '苔玉', pattern: /苔玉/ },
  { category: 'mini', label: 'ミニ盆栽', pattern: /ミニ盆栽|豆盆栽/ },
]

// 話題（同じ話題の記事を関連記事として優先する）
const TOPIC_RULES: { key: string; pattern: RegExp }[] = [
  { key: 'watering', pattern: /水やり|水分/ },
  { key: 'pruning', pattern: /剪定|芽摘み|針金|整枝|樹形/ },
  { key: 'repotting', pattern: /植え替え|根詰まり/ },
  { key: 'fertilizer', pattern: /肥料/ },
  { key: 'soil', pattern: /用土|土づくり|土壌/ },
  { key: 'place', pattern: /置き場所|日当たり|日陰/ },
  { key: 'indoor', pattern: /室内|マンション|オフィス/ },
  { key: 'summer', pattern: /夏/ },
  { key: 'winter', pattern: /冬/ },
  { key: 'trouble', pattern: /枯れ|病気|害虫|虫|黄色|復活/ },
  { key: 'tools', pattern: /道具|はさみ|鋏/ },
  { key: 'gift', pattern: /ギフト|贈|祝い|プレゼント|母の日|父の日|敬老/ },
  { key: 'event', pattern: /展示会|盆栽展|イベント|愛好会|クラブ/ },
  { key: 'beginner', pattern: /初心者|入門|始め方/ },
  { key: 'culture', pattern: /歴史|文化|茶道|海外|国際|英語/ },
]

export function detectArticleSpecies(title: string): { category: string; label: string } | null {
  const rule = SPECIES_RULES.find(r => r.pattern.test(title))
  return rule ? { category: rule.category, label: rule.label } : null
}

export function detectArticleTopics(title: string): string[] {
  return TOPIC_RULES.filter(rule => rule.pattern.test(title)).map(rule => rule.key)
}

interface RelatedCandidate {
  id: string
  slug: string
  title: string
  category: { slug: string }
  tags?: { id: string }[]
  publishedAt: string
}

// 関連記事の並び：同じ樹種 → 同じ話題 → 同じカテゴリ・タグ → 新しい順
export function rankRelatedArticles<T extends RelatedCandidate>(current: RelatedCandidate, candidates: T[], limit: number): T[] {
  const species = detectArticleSpecies(current.title)?.category
  const topics = new Set(detectArticleTopics(current.title))
  const tagIds = new Set((current.tags || []).map(tag => tag.id))

  const scored = candidates
    .filter(candidate => candidate.id !== current.id && isArticleListable(candidate.slug))
    .map(candidate => {
      let score = 0
      if (species && detectArticleSpecies(candidate.title)?.category === species) score += 6
      detectArticleTopics(candidate.title).forEach(topic => {
        if (topics.has(topic)) score += 3
      })
      if (candidate.category.slug === current.category.slug) score += 2
      ;(candidate.tags || []).forEach(tag => {
        if (tagIds.has(tag.id)) score += 1
      })
      return { candidate, score }
    })

  scored.sort((a, b) => b.score - a.score || (b.candidate.publishedAt > a.candidate.publishedAt ? 1 : -1))
  return scored.slice(0, limit).map(item => item.candidate)
}

// 記事下の案内で使う特集ページ（樹種がわかればその樹種向け、なければ話題から選ぶ）
export function fallbackSelectionSlug(title: string): string {
  const topics = detectArticleTopics(title)
  if (topics.includes('gift')) return 'bonsai-gift'
  if (topics.includes('indoor')) return 'indoor-bonsai'
  if (topics.includes('tools') || topics.includes('fertilizer') || topics.includes('soil') || topics.includes('repotting')) return 'starter-tools'
  return 'beginner-mini-bonsai'
}
