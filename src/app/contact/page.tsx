'use client'

import { useState } from 'react'
import { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { Mail, MessageCircle, Clock } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // フォーム送信の処理（実際の実装では適切なエンドポイントに送信）
    try {
      // 実際のフォーム送信処理をここに実装
      await new Promise(resolve => setTimeout(resolve, 1000)) // シミュレーション
      setSubmitStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary-800 mb-4">
          お問い合わせ
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          盆栽カタログに関するご質問、ご意見、ご要望などがございましたら、
          お気軽にお問い合わせください。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* お問い合わせフォーム */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-luxury p-8">
            <h2 className="text-2xl font-semibold text-primary-700 mb-6 flex items-center">
              <MessageCircle className="h-6 w-6 mr-3 text-accent-600" />
              お問い合わせフォーム
            </h2>

            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  ✅ お問い合わせありがとうございます。内容を確認次第、返信いたします。
                </p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">
                  ❌ 送信エラーが発生しました。時間をおいて再度お試しください。
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-primary-700 mb-2">
                    お名前 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                    placeholder="山田太郎"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-primary-700 mb-2">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-primary-700 mb-2">
                  件名 <span className="text-red-500">*</span>
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                >
                  <option value="">お問い合わせの種類を選択してください</option>
                  <option value="商品について">商品について</option>
                  <option value="サイトの使い方">サイトの使い方</option>
                  <option value="商品リクエスト">商品リクエスト</option>
                  <option value="技術的な問題">技術的な問題</option>
                  <option value="プライバシーポリシー">プライバシーポリシー</option>
                  <option value="その他">その他</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-primary-700 mb-2">
                  メッセージ <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors resize-vertical"
                  placeholder="お問い合わせ内容を詳しくご記入ください..."
                />
              </div>

              <div className="text-sm text-neutral-600">
                <span className="text-red-500">*</span> は必須項目です
              </div>

              <Button
                type="submit"
                variant="luxury"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? '送信中...' : '送信する'}
              </Button>
            </form>
          </div>
        </div>

        {/* サイドバー情報 */}
        <div className="space-y-8">
          {/* 連絡先情報 */}
          <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary-700 mb-4 flex items-center">
              <Mail className="h-5 w-5 mr-2 text-accent-600" />
              連絡先情報
            </h3>
            <div className="space-y-3 text-sm text-neutral-700">
              <p>
                <strong>運営サイト:</strong><br />
                盆栽カタログ
              </p>
              <p>
                <strong>メール:</strong><br />
                contact@bonsai-catalog.com<br />
                <span className="text-xs text-neutral-500">（準備中）</span>
              </p>
            </div>
          </div>

          {/* 回答時間の目安 */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary-700 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-accent-600" />
              回答時間の目安
            </h3>
            <div className="space-y-3 text-sm text-neutral-700">
              <div>
                <strong className="text-primary-600">一般的なお問い合わせ</strong>
                <p>1-3営業日以内</p>
              </div>
              <div>
                <strong className="text-primary-600">技術的な問題</strong>
                <p>24-48時間以内</p>
              </div>
              <div>
                <strong className="text-primary-600">商品リクエスト</strong>
                <p>1週間以内</p>
              </div>
            </div>
            <p className="text-xs text-neutral-500 mt-4">
              ※土日祝日を除く営業日での対応となります
            </p>
          </div>

          {/* よくある質問 */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary-700 mb-4">
              よくある質問
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium text-primary-600 mb-1">
                  商品の購入はこのサイトからできますか？
                </h4>
                <p className="text-neutral-600">
                  当サイトは商品紹介サイトです。実際の購入はAmazonで行われます。
                </p>
              </div>
              <div>
                <h4 className="font-medium text-primary-600 mb-1">
                  商品リクエストは受け付けていますか？
                </h4>
                <p className="text-neutral-600">
                  はい、お気軽にリクエストしてください。検討して追加いたします。
                </p>
              </div>
              <div>
                <h4 className="font-medium text-primary-600 mb-1">
                  盆栽の育て方について相談できますか？
                </h4>
                <p className="text-neutral-600">
                  基本的なご質問にはお答えできますが、専門的な相談は専門店にご相談ください。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}