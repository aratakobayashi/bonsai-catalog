import { marked } from 'marked'
import { SITE_URL } from '@/lib/site'
import { decodeEntities, rewriteArticleHtml, type ArticleLinkContext } from '@/lib/article-content'

// シンプルなmarkdown設定
marked.setOptions({
  breaks: true, // 改行をbrタグに変換
  gfm: true, // GitHub Flavored Markdown
})

// 見出しの ID（本文中の「#見出し」へのリンクと一致させるため、記号を除いた見出しの文字列を使う）
function headingIdFrom(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const TABLE_SEPARATOR_RE = /^\s*\|?\s*:?-{2,}:?\s*(?:\|\s*:?-{2,}:?\s*)+\|?\s*$/m

// コードブロック（```）で囲まれた表を、表として表示できるように囲みを外す
function unfenceTables(content: string): string {
  return content.replace(/^```[ \t]*(\w*)[ \t]*\r?\n([\s\S]*?)\r?\n```[ \t]*$/gm, (block, lang: string, body: string) => {
    if (lang && !/^(?:markdown|md|table|text)$/i.test(lang)) return block
    const lines = body.split(/\r?\n/).filter(line => line.trim())
    const pipeLines = lines.filter(line => line.includes('|')).length
    if (!TABLE_SEPARATOR_RE.test(body) || pipeLines < 3 || pipeLines < lines.length * 0.8) return block
    return `\n${body.trim()}\n`
  })
}

// **太字** を <strong> にする。
// 日本語では「**“おしゃれ”**として」のように記号と文字が隣り合うと Markdown の規則では太字にならないため、先に変換しておく
function convertBold(content: string): string {
  const parts = content.split(/(^```[\s\S]*?^```[ \t]*$)/m)
  return parts
    .map((part, i) => {
      if (i % 2 === 1) return part // コードブロックはそのまま
      return part
        .split(/(`[^`\n]*`)/)
        .map((piece, j) => (j % 2 === 1 ? piece : piece.replace(/\*\*(?![\s*])([^\n]*?[^\s*\\])[ \u3000]*\*\*/g, '<strong>$1</strong>')))
        .join('')
    })
    .join('')
}

// 囲みの種類（ラベルの文言 → クラス）
const CALLOUT_KINDS: Record<string, string> = {
  ポイント: 'point',
  注意: 'caution',
  季節の目安: 'season',
}

function calloutHtml(kind: string, label: string, body: string): string {
  return `<div class="callout callout-${kind}"><p class="callout-label">${label}</p>${body}</div>`
}

export interface ProcessMarkdownOptions {
  // サイト内リンクの存在確認に使う（省略時は存在確認をしない）
  links?: ArticleLinkContext
  // 段落に記事へのリンクが1本だけあるとき、画像つきのカードにするための記事の情報（なければ普通のリンクのまま）
  articleCard?: (slug: string) => { title: string; image?: string } | null
}

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string)
const SITE_PREFIX = SITE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const LONE_ARTICLE_LINK = new RegExp(`<p>\\s*<a href="(?:${SITE_PREFIX})?/guides/([a-z0-9-]+)"[^>]*>(?:(?!<\\/a>|<\\/p>)[\\s\\S])*<\\/a>\\s*<\\/p>`, 'g')

// 「あわせて読みたい」カード（本文の流れの中で、ほかの記事へ案内する）
function articleCardHtml(slug: string, title: string, image?: string): string {
  const img = image
    ? `<span class="article-card-image"><img src="${escapeHtml(image)}" alt="" loading="lazy" decoding="async" width="1200" height="630"></span>`
    : ''
  return `<a class="article-card${image ? '' : ' article-card-text'}" href="/guides/${slug}"><span class="article-card-body"><span class="article-card-label">あわせて読みたい</span><span class="article-card-title">${escapeHtml(title)}</span><span class="article-card-more">記事を読む ›</span></span>${img}</a>`
}

// Markdownを処理する関数
export function processMarkdown(content: string, options: ProcessMarkdownOptions = {}): string {
  try {
    if (!content || typeof content !== 'string') {
      return ''
    }

    // 旧ドメイン・www なしの内部リンクを正規ドメインに統一
    const normalized = convertBold(unfenceTables(content)).replace(
      /https?:\/\/(?:bonsai-catalog\.vercel\.app|bonsai-collection\.com)(?=[/"')\s]|$)/g,
      SITE_URL
    )

    // markedでHTMLに変換
    let html = marked(normalized) as string

    // ページの見出し（h1）は記事タイトルだけにするため、本文中の h1 は h2 として表示する
    html = html.replace(/<h1(\s|>)/g, '<h2$1').replace(/<\/h1>/g, '</h2>')

    // 見出しに ID を付ける（「見出し {#id}」の指定があればその ID を使う。同じ ID は連番にする）
    const usedIds = new Map<string, number>()
    html = html.replace(/<h([1-6])([^>]*?)>(.*?)<\/h[1-6]>/g, (match, level, attrs, text) => {
      let textStr = typeof text === 'string' ? text : String(text)
      let id = ''
      const custom = textStr.match(/\s*\{#([^}\s]+)\}\s*$/)
      if (custom) {
        textStr = textStr.slice(0, custom.index).trim()
        id = decodeEntities(custom[1])
      } else {
        const existing = String(attrs).match(/id="([^"]*)"/)
        id = existing ? existing[1] : headingIdFrom(decodeEntities(textStr.replace(/<[^>]*>/g, '')))
      }
      if (!id) id = 'section'
      const count = usedIds.get(id) || 0
      usedIds.set(id, count + 1)
      if (count > 0) id = `${id}-${count + 1}`
      return `<h${level} id="${id.replace(/"/g, '')}" class="scroll-mt-24">${textStr}</h${level}>`
    })

    // リンクと画像の補正（存在しないページ・仮のリンクは外す、Amazon にはアソシエイトタグを付ける（掲載を止めている間はリンクを外す）、外部リンクは新しいタブ）
    html = rewriteArticleHtml(html, options.links)

    // 記事へのリンクだけの段落は、画像つきのカードにする
    if (options.articleCard) {
      html = html.replace(LONE_ARTICLE_LINK, (match, slug: string) => {
        const card = options.articleCard?.(slug)
        return card ? articleCardHtml(slug, card.title, card.image) : match
      })
    }

    // 本文中の画像は遅延読み込み
    html = html.replace(/<img\s(?![^>]*\bloading=)/g, '<img loading="lazy" decoding="async" ')

    // 表は横スクロールできる枠で囲む。列が多い表には SP で「横にスクロール」の案内を出す
    html = html.replace(/<table>([\s\S]*?)<\/table>/g, (match, inner: string) => {
      const firstRow = inner.match(/<tr>([\s\S]*?)<\/tr>/)
      const columns = firstRow ? (firstRow[1].match(/<t[hd][\s>]/g) || []).length : 0
      const hint = columns >= 4 ? '<p class="table-scroll-hint" aria-hidden="true">表は横にスクロールできます →</p>' : ''
      return `${hint}<div class="table-scroll" tabindex="0" role="region" aria-label="表">${match}</div>`
    })

    // 囲み：「> **ポイント** …」「> **注意** …」「> **季節の目安** …」はラベル付きの囲み、それ以外の引用は無地の囲み
    html = html.replace(/<blockquote>([\s\S]*?)<\/blockquote>/g, (match, inner: string) => {
      const labeled = inner.match(/^\s*<p>\s*<strong>\s*([^<]{1,12}?)\s*<\/strong>[\s:：]*(?:<br\s*\/?>\s*)?/)
      const label = labeled ? labeled[1].replace(/[:：]$/, '') : ''
      const kind = CALLOUT_KINDS[label]
      if (!kind) return `<div class="callout">${inner.trim()}</div>`
      const rest = inner.slice(labeled![0].length).replace(/^\s*<\/p>/, '')
      const body = rest.trim().startsWith('<') && !/^<(?:strong|em|a|code|br)/.test(rest.trim()) ? rest.trim() : `<p>${rest.trim()}`
      return calloutHtml(kind, label, body.replace(/<p>\s*<\/p>/g, ''))
    })

    // :::info / :::tips / :::warning で囲んだ部分（旧記事の書式）も同じ囲みにする
    html = html.replace(/(?:<p>\s*)?:::(info|tips|warning)(?:\s*<br\s*\/?>)?([\s\S]*?)(?:<br\s*\/?>\s*)?:::(?:\s*<\/p>)?/g, (match, type: string, inner: string) => {
      const [kind, label] = type === 'warning' ? ['caution', '注意'] : type === 'tips' ? ['point', 'ポイント'] : ['note', '']
      let body = inner.trim().replace(/^<\/p>\s*/, '').replace(/\s*<p>$/, '')
      if (!/^<(?:p|ul|ol|div|table)[\s>]/.test(body)) body = `<p>${body}`
      if (!/<\/(?:p|ul|ol|div|table)>$/.test(body)) body = `${body}</p>`
      return label ? calloutHtml(kind, label, body) : `<div class="callout">${body}</div>`
    })

    return html
  } catch (error) {
    console.error('Markdown processing error:', error)
    // フォールバック: 基本的なHTMLとして返す
    return content
      .split('\n')
      .map(line => {
        if (line.startsWith('# ')) {
          const text = line.substring(2)
          const id = text.toLowerCase().replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s-]/g, '').replace(/\s+/g, '-')
          return `<h1 id="${id}" class="text-3xl font-bold mb-4">${text}</h1>`
        } else if (line.startsWith('## ')) {
          const text = line.substring(3)
          const id = text.toLowerCase().replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s-]/g, '').replace(/\s+/g, '-')
          return `<h2 id="${id}" class="text-2xl font-bold mb-3">${text}</h2>`
        } else if (line.startsWith('### ')) {
          const text = line.substring(4)
          const id = text.toLowerCase().replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s-]/g, '').replace(/\s+/g, '-')
          return `<h3 id="${id}" class="text-xl font-bold mb-2">${text}</h3>`
        } else if (line.startsWith('- ')) {
          return `<li class="ml-4">${line.substring(2)}</li>`
        } else if (line.trim()) {
          return `<p class="mb-4">${line}</p>`
        }
        return ''
      })
      .join('')
  }
}

export interface TocItem {
  level: number
  text: string
  id: string
}

// 表示用 HTML（processMarkdown の結果）から目次を作る。ID は本文の見出しと必ず一致する
export function extractTableOfContents(html: string): TocItem[] {
  if (!html) return []
  return Array.from(html.matchAll(/<h([1-3]) id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g), m => ({
    level: Number(m[1]),
    id: m[2],
    text: decodeEntities(m[3].replace(/<[^>]*>/g, '')).trim(),
  })).filter(item => item.text)
}

// 目次を生成する関数（Markdown から）
export function generateTableOfContents(content: string, options: ProcessMarkdownOptions = {}): TocItem[] {
  if (!content || typeof content !== 'string') return []
  return extractTableOfContents(processMarkdown(content, options))
}
