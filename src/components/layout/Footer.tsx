import Link from 'next/link'

const Footer = () => {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* サイト情報 */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-6 w-6 rounded-full bg-bonsai-green-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">盆</span>
              </div>
              <span className="font-bold text-bonsai-green-800">
                盆栽コレクション
              </span>
            </div>
            <p className="text-sm text-gray-600">
              美しい盆栽をお探しの方のための商品カタログサイトです。
              初心者から上級者まで、あなたにぴったりの盆栽を見つけてください。
            </p>
          </div>

          {/* リンク */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">サイトマップ</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-600 hover:text-bonsai-green-600">
                  ホーム
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-sm text-gray-600 hover:text-bonsai-green-600">
                  商品一覧
                </Link>
              </li>
              <li>
                <Link href="/gardens" className="text-sm text-gray-600 hover:text-bonsai-green-600">
                  盆栽園紹介
                </Link>
              </li>
            </ul>
          </div>

          {/* 法的情報・サポート */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">サポート・法的情報</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-bonsai-green-600">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-bonsai-green-600">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-bonsai-green-600">
                  利用規約
                </Link>
              </li>
              <li>
                <a href="https://affiliate.amazon.co.jp" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-bonsai-green-600">
                  Amazonアソシエイト
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 mt-8">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              © 2024 盆栽カタログ. All rights reserved. 
              商品の購入はAmazonで行われます。
            </p>
            <p className="text-xs text-gray-500">
              当サイトはAmazon.co.jpアソシエイトプログラムに参加しています。
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { Footer }