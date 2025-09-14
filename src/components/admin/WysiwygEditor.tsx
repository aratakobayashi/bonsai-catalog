'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Heading3,
  Link2,
  Image as ImageIcon,
  Undo,
  Redo,
  Code
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCallback, useEffect, useState } from 'react'

interface WysiwygEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function WysiwygEditor({ content, onChange, placeholder = '記事の内容を入力してください...' }: WysiwygEditorProps) {
  const [mounted, setMounted] = useState(false)

  // クライアントサイドでのみ実行
  useEffect(() => {
    setMounted(true)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4]
        }
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg'
        }
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] px-4 py-3'
      }
    },
    immediatelyRender: false // これが重要：SSRを完全に無効化
  })

  const setLink = useCallback(() => {
    if (!editor) return

    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL:', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    if (!editor) return

    const url = window.prompt('画像のURL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  // SSR中は何も表示しない
  if (!mounted) {
    return (
      <div className="min-h-[400px] border border-gray-300 rounded-lg p-4 bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">エディタを準備中...</p>
      </div>
    )
  }

  if (!editor) {
    return (
      <div className="min-h-[400px] border border-gray-300 rounded-lg p-4 bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">エディタを初期化中...</p>
      </div>
    )
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* ツールバー */}
      <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap gap-1">
        <div className="flex gap-1 pr-2 border-r border-gray-300">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="元に戻す"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="やり直し"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-1 pr-2 border-r border-gray-300">
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 2 }) ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="見出し2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 3 }) ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="見出し3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-1 pr-2 border-r border-gray-300">
          <Button
            type="button"
            variant={editor.isActive('bold') ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="太字"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('italic') ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="斜体"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('underline') ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="下線"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('code') ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="インラインコード"
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-1 pr-2 border-r border-gray-300">
          <Button
            type="button"
            variant={editor.isActive('bulletList') ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="箇条書き"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('orderedList') ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="番号付きリスト"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('blockquote') ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="引用"
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-1">
          <Button
            type="button"
            variant={editor.isActive('link') ? 'primary' : 'ghost'}
            size="sm"
            onClick={setLink}
            title="リンク"
          >
            <Link2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addImage}
            title="画像を挿入"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* エディタ本体 */}
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}