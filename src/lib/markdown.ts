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

export interface ProcessMarkdownOptions {
  // サイト内リンクの存在確認に使う（省略時は存在確認をしない）
  links?: ArticleLinkContext
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

    // 段落・リスト
    html = html.replace(/<p>/g, '<p class="mb-4">')
    html = html.replace(/<ul>/g, '<ul class="mb-4">')
    html = html.replace(/<ol>/g, '<ol class="mb-4">')

    // リンクと画像の補正（存在しないページ・仮のリンクは外す、Amazon にはアソシエイトタグを付ける、外部リンクは新しいタブ）
    html = rewriteArticleHtml(html, options.links)

    // 表は横スクロールできる枠で囲む。列が多い表には SP で「横にスクロール」の案内を出す
    html = html.replace(/<table>([\s\S]*?)<\/table>/g, (match, inner: string) => {
      const firstRow = inner.match(/<tr>([\s\S]*?)<\/tr>/)
      const columns = firstRow ? (firstRow[1].match(/<t[hd][\s>]/g) || []).length : 0
      const hint = columns >= 4 ? '<p class="table-scroll-hint" aria-hidden="true">表は横にスクロールできます →</p>' : ''
      return `${hint}<div class="table-scroll" tabindex="0" role="region" aria-label="表">${match}</div>`
    })

    // ブロッククォートを WordPress スタイルの情報ボックスに変換
    html = html.replace(/<blockquote>/g, '<div class="bg-gradient-to-r from-green-50 to-emerald-50 border-l-6 border-green-500 rounded-lg p-6 mb-6 shadow-lg"><div class="flex items-start"><div class="flex-shrink-0 mr-4"><div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"><svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div></div><blockquote class="text-gray-800 font-medium leading-relaxed border-0 bg-transparent p-0 m-0">')

    // コードブロック・インラインコードの見た目は editor.css（.article-body pre / code）で付ける

    // ブロッククォートの終了タグも修正
    html = html.replace(/<\/blockquote>/g, '</blockquote></div></div>')

    // WordPress スタイルのハイライトボックスを追加
    // :::info で囲まれたテキストを情報ボックスに変換
    html = html.replace(/:::info([\s\S]*?):::/g, (match, content) => {
      return `<div class="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 md:p-6 mb-6 shadow-lg">
        <div class="flex items-start">
          <div class="flex-shrink-0 mr-3 md:mr-4">
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-blue-900 mb-2">この記事でわかること</h4>
            <div class="text-blue-800">${content.trim()}</div>
          </div>
        </div>
      </div>`
    })

    // :::tips で囲まれたテキストをコツボックスに変換
    html = html.replace(/:::tips([\s\S]*?):::/g, (match, content) => {
      return `<div class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 md:p-6 mb-6 shadow-lg">
        <div class="flex items-start">
          <div class="flex-shrink-0 mr-3 md:mr-4">
            <div class="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-amber-900 mb-2">💡ワンポイントアドバイス</h4>
            <div class="text-amber-800">${content.trim()}</div>
          </div>
        </div>
      </div>`
    })

    // :::warning で囲まれたテキストを警告ボックスに変換
    html = html.replace(/:::warning([\s\S]*?):::/g, (match, content) => {
      return `<div class="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 md:p-6 mb-6 shadow-lg">
        <div class="flex items-start">
          <div class="flex-shrink-0 mr-3 md:mr-4">
            <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-red-900 mb-2">⚠️ 注意点</h4>
            <div class="text-red-800">${content.trim()}</div>
          </div>
        </div>
      </div>`
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
