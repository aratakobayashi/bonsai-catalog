'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { ArticleEditor } from '@/components/admin/ArticleEditor'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import Link from 'next/link'

interface ArticleFormData {
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  featuredImage?: string
  seoTitle?: string
  seoDescription?: string
}

export default function NewArticlePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'care-bonsai',
    tags: [],
    featuredImage: '',
    seoTitle: '',
    seoDescription: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [editorMode, setEditorMode] = useState<'wysiwyg' | 'markdown'>('wysiwyg')

  // 一時的にハードコーディング（APIが利用可能になったら切り替え）
  const categories = [
    {
      id: 'care-bonsai',
      name: 'お手入れ・管理',
      slug: 'care-bonsai',
      description: '盆栽の日常管理、水やり、剪定等の育て方ガイド',
      color: 'bg-green-100 text-green-800',
      icon: '🌱'
    },
    {
      id: 'start-guide',
      name: 'はじめての盆栽',
      slug: 'start-guide',
      description: '初心者向けの樹種選びや購入のポイント',
      color: 'bg-blue-100 text-blue-800',
      icon: '🎯'
    },
    {
      id: 'kinds',
      name: '種類別ガイド',
      slug: 'kinds',
      description: '松柏類、雑木類、花もの等の種類別詳細ガイド',
      color: 'bg-emerald-100 text-emerald-800',
      icon: '🌲'
    },
  ]
  
  const commonTags = [
    '初心者', '中級者', '上級者',
    'もみじ', '松', '桜', '竹',
    '春', '夏', '秋', '冬',
    '水やり', '剪定', '植え替え', '肥料',
  ]

  // タイトルからスラッグを自動生成
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // 特殊文字削除
      .replace(/[\s_-]+/g, '-') // スペース・アンダースコアをハイフンに
      .replace(/^-+|-+$/g, '') // 先頭・末尾のハイフン削除
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }))
  }

  const handleTagAdd = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const handleTagRemove = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          publishedAt: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        router.push('/admin/articles')
      } else {
        throw new Error('保存に失敗しました')
      }
    } catch (error) {
      console.error('保存エラー:', error)
      alert('保存に失敗しました。もう一度お試しください。')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Button variant="ghost" asChild className="mr-4">
            <Link href="/admin/articles">
              <ArrowLeft className="h-4 w-4 mr-2" />
              記事一覧に戻る
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">新規記事作成</h1>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'エディタに戻る' : 'プレビュー'}
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!formData.title || !formData.content || isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? '保存中...' : '記事を保存'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* メインエディタエリア */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>記事内容</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* タイトル */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タイトル *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="記事のタイトルを入力してください"
                  className="text-lg font-medium"
                />
              </div>

              {/* スラッグ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL (スラッグ)
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm">/guides/</span>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-slug"
                    className="ml-1"
                  />
                </div>
              </div>

              {/* 記事エディタ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  記事本文 *
                </label>
                <ArticleEditor
                  content={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  showPreview={showPreview}
                  editorMode={editorMode}
                  onEditorModeChange={setEditorMode}
                />
              </div>

              {/* 抜粋 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  記事の抜粋
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="記事の簡単な説明を入力してください"
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* サイドバー設定 */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* カテゴリー選択 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">カテゴリー</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* タグ設定 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">タグ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 選択中のタグ */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary"
                        className="cursor-pointer hover:bg-gray-300"
                        onClick={() => handleTagRemove(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* よく使うタグ */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">よく使うタグ</p>
                  <div className="flex flex-wrap gap-1">
                    {commonTags.filter(tag => !formData.tags.includes(tag)).map((tag) => (
                      <Badge 
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleTagAdd(tag)}
                      >
                        + {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO設定 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">SEO設定</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SEOタイトル
                  </label>
                  <Input
                    value={formData.seoTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                    placeholder={formData.title || 'SEOタイトル'}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メタ説明
                  </label>
                  <textarea
                    value={formData.seoDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                    placeholder={formData.excerpt || 'SEO用の説明文'}
                    rows={3}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}