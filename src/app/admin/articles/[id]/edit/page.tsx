'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { ArticleEditor } from '@/components/admin/ArticleEditor'
import { ImageUpload } from '@/components/admin/ImageUpload'
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

interface EditArticlePageProps {
  params: {
    id: string
  }
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
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
  const [isLoading, setIsLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [editorMode, setEditorMode] = useState<'wysiwyg' | 'markdown'>('wysiwyg')

  // カテゴリー一覧
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

  // 記事を読み込み
  useEffect(() => {
    const loadArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${params.id}`)
        if (response.ok) {
          const article = await response.json()
          setFormData({
            title: article.title || '',
            slug: article.slug || '',
            excerpt: article.excerpt || '',
            content: article.content || '',
            category: article.category || 'care-bonsai',
            tags: article.tags || [],
            featuredImage: article.featuredImage || '',
            seoTitle: article.seoTitle || '',
            seoDescription: article.seoDescription || '',
          })
        } else {
          throw new Error('記事が見つかりません')
        }
      } catch (error) {
        console.error('記事読み込みエラー:', error)
        alert('記事の読み込みに失敗しました')
        router.push('/admin/articles')
      } finally {
        setIsLoading(false)
      }
    }

    loadArticle()
  }, [params.id, router])

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
      const response = await fetch(`/api/articles/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          updatedAt: new Date().toISOString(),
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">記事を読み込み中...</p>
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-bold text-gray-900">記事編集</h1>
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
            {isSaving ? '保存中...' : '記事を更新'}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
            {/* アイキャッチ画像 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">アイキャッチ画像</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  label="記事のメイン画像"
                  value={formData.featuredImage}
                  onChange={(url) => setFormData(prev => ({ ...prev, featuredImage: url }))}
                  placeholder="記事一覧やSNSシェア時に表示される画像"
                />
              </CardContent>
            </Card>

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
                  <label className="block text-xs text-gray-600 mb-1">SEOタイトル</label>
                  <Input
                    value={formData.seoTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                    placeholder="SEO用のタイトル"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">SEO説明文</label>
                  <textarea
                    value={formData.seoDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                    placeholder="検索結果に表示される説明文"
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