import { marked } from 'marked'

// シンプルなmarkdown設定
marked.setOptions({
  breaks: true, // 改行をbrタグに変換
  gfm: true, // GitHub Flavored Markdown
})

// Markdownを処理する関数
export function processMarkdown(content: string): string {
  try {
    if (!content || typeof content !== 'string') {
      return ''
    }

    // markedでHTMLに変換
    let html = marked(content) as string

    // 見出しにIDを手動で追加（markedのデフォルトIDと一致するように）
    html = html.replace(/<h([1-6])([^>]*?)>(.*?)<\/h[1-6]>/g, (match, level, attrs, text) => {
      // テキストが文字列であることを確認
      const textStr = typeof text === 'string' ? text : String(text)

      // HTMLタグを除去してIDを生成
      const cleanText = textStr.replace(/<[^>]*>/g, '')
      const id = cleanText
        .toLowerCase()
        .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

      // 既にIDが含まれている場合はそのまま、含まれていない場合は追加
      if (attrs.includes('id=')) {
        return `<h${level}${attrs} class="scroll-mt-24 group relative">${textStr}</h${level}>`
      } else {
        return `<h${level} id="${id}" class="scroll-mt-24 group relative">${textStr}</h${level}>`
      }
    })

    // 段落にクラスを追加
    html = html.replace(/<p>/g, '<p class="mb-4 leading-relaxed text-gray-700">')

    // リストにクラスを追加
    html = html.replace(/<ul>/g, '<ul class="list-disc list-inside space-y-2 mb-4 ml-4">')
    html = html.replace(/<ol>/g, '<ol class="list-decimal list-inside space-y-2 mb-4 ml-4">')
    html = html.replace(/<li>/g, '<li class="leading-relaxed">')

    // リンクにクラスを追加（外部リンクは新しいタブで開く）
    html = html.replace(/<a href="([^"]*)"([^>]*)>/g, (match, href, attrs) => {
      const isExternal = href.startsWith('http') && !href.includes('bonsai-collection.com')
      const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''
      return `<a href="${href}"${attrs}${target} class="text-blue-600 hover:text-blue-800 underline font-medium">`
    })

    // ブロッククォートを WordPress スタイルの情報ボックスに変換
    html = html.replace(/<blockquote>/g, '<div class="bg-gradient-to-r from-green-50 to-emerald-50 border-l-6 border-green-500 rounded-lg p-6 mb-6 shadow-lg"><div class="flex items-start"><div class="flex-shrink-0 mr-4"><div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"><svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div></div><blockquote class="text-gray-800 font-medium leading-relaxed border-0 bg-transparent p-0 m-0">')

    // コードブロックにクラスを追加
    html = html.replace(/<pre><code([^>]*)>/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4"><code$1 class="text-sm">')

    // インラインコードにクラスを追加
    html = html.replace(/<code>/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">')

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

// 目次を生成する関数
export function generateTableOfContents(content: string) {
  if (!content || typeof content !== 'string') {
    return []
  }

  const headings = content.match(/^#{1,3}\s+(.+)$/gm) || []

  return headings.map((heading, index) => {
    const level = (heading.match(/^#{1,3}/)?.[0].length || 1)
    const text = heading.replace(/^#{1,3}\s+/, '').replace(/<[^>]*>/g, '') // HTMLタグを除去

    // IDを生成（markedと同じロジック）
    const id = text
      .toLowerCase()
      .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    return { level, text, id }
  })
}