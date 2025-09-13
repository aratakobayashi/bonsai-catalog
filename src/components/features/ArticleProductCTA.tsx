'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Lightbulb, ArrowRight } from 'lucide-react'

interface ArticleProductCTAProps {
  articleTitle: string
  hasRelatedProducts: boolean
}

export function ArticleProductCTA({ articleTitle, hasRelatedProducts }: ArticleProductCTAProps) {
  if (!hasRelatedProducts) return null

  const getCtaMessage = (title: string) => {
    if (title.includes('初心者')) {
      return {
        headline: '初心者の方におすすめ',
        description: 'この記事で紹介した内容を実際に始めてみませんか？初心者向けの商品をご用意しています。',
        buttonText: '初心者向け商品を見る'
      }
    }
    
    if (title.includes('育て方') || title.includes('栽培')) {
      return {
        headline: '育成に必要な道具',
        description: '記事で学んだ育て方を実践するのに必要な用土、鉢、道具などをチェックしましょう。',
        buttonText: '育成用品を見る'
      }
    }
    
    if (title.includes('ミニ盆栽') || title.includes('豆盆栽')) {
      return {
        headline: 'ミニ盆栽を始めよう',
        description: '手軽に始められるミニ盆栽で、記事で読んだ楽しさを実際に体験してみませんか？',
        buttonText: 'ミニ盆栽を見る'
      }
    }

    return {
      headline: '実践してみませんか？',
      description: 'この記事で紹介した内容に関連する商品をご用意しています。',
      buttonText: '関連商品を見る'
    }
  }

  const { headline, description, buttonText } = getCtaMessage(articleTitle)

  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-green-600" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {headline}
            </h3>
            <p className="text-gray-600 mb-4">
              {description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                asChild
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <a href="#related-products">
                  {buttonText}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </a>
              </Button>
              
              <Button variant="outline" asChild>
                <Link href="/products">
                  すべての商品を見る
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}