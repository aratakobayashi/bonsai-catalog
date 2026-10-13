'use client'

import { useState, lazy, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { marked } from 'marked'
import { Button } from '@/components/ui/Button'
import { Code, Eye, FileText } from 'lucide-react'

// WYSIWYGエディタを動的インポート（SSR無効化）
const WysiwygEditor = dynamic(() => import('./WysiwygEditor').then(mod => mod.WysiwygEditor), {
  ssr: false,
  loading: () => (
    <div className="min-h-[400px] border border-gray-300 rounded-lg p-4 bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">エディタを読み込み中...</p>
    </div>
  ),
})

interface ArticleEditorProps {
  content: string
  onChange: (content: string) => void
  showPreview: boolean
  editorMode?: 'wysiwyg' | 'markdown'
  onEditorModeChange?: (mode: 'wysiwyg' | 'markdown') => void
}

export function ArticleEditor({
  content,
  onChange,
  showPreview,
  editorMode = 'wysiwyg',
  onEditorModeChange
}: ArticleEditorProps) {

  // HTMLコンテンツをMarkdownに変換する簡易関数
  const htmlToMarkdown = (html: string): string => {
    // 基本的な変換のみ（完全な変換にはライブラリが必要）
    return html
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<u[^>]*>(.*?)<\/u>/gi, '_$1_')
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
      .replace(/<a\s+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      .replace(/<img\s+src="([^"]*)"[^>]*>/gi, '![]($1)')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
      .replace(/<\/?ul[^>]*>/gi, '')
      .replace(/<\/?ol[^>]*>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<\/?[^>]+>/g, '') // 残りのHTMLタグを削除
      .trim()
  }

  if (showPreview) {
    // プレビューモード
    const htmlContent = editorMode === 'markdown'
      ? marked(content || '# プレビュー\n\n記事内容を入力すると、ここにプレビューが表示されます。')
      : content || '<h1>プレビュー</h1><p>記事内容を入力すると、ここにプレビューが表示されます。</p>'

    return (
      <div className="min-h-[500px] border border-gray-300 rounded-md p-4 bg-white">
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* エディタモード切り替えボタン */}
      {onEditorModeChange && (
        <div className="flex gap-2 pb-2 border-b">
          <Button
            type="button"
            variant={editorMode === 'wysiwyg' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onEditorModeChange('wysiwyg')}
          >
            <FileText className="h-4 w-4 mr-2" />
            ビジュアルエディタ
          </Button>
          <Button
            type="button"
            variant={editorMode === 'markdown' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onEditorModeChange('markdown')}
          >
            <Code className="h-4 w-4 mr-2" />
            Markdownエディタ
          </Button>
        </div>
      )}

      {/* エディター本体 */}
      {editorMode === 'wysiwyg' ? (
        <WysiwygEditor
          content={content}
          onChange={onChange}
          placeholder="記事の内容を入力してください..."
        />
      ) : (
        <div className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="## 見出し

記事の内容をMarkdown形式で入力してください。

### 小見出し

- リスト項目1
- リスト項目2

**太字** や *斜体* も使用できます。

[リンクテキスト](https://example.com)

![画像の説明](画像のURL)"
            className="w-full h-[500px] border border-gray-300 rounded-md px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
            style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
          />

          {/* 簡単なMarkdownヘルプ */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border">
            <strong>Markdown記法:</strong>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <code># 大見出し</code><br/>
                <code>## 中見出し</code><br/>
                <code>### 小見出し</code><br/>
                <code>**太字**</code>
              </div>
              <div>
                <code>- リスト</code><br/>
                <code>[リンク](URL)</code><br/>
                <code>![画像](URL)</code><br/>
                <code>`インラインコード`</code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}