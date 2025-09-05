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

          {/* カテゴリ */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">人気カテゴリ</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products?category=松類" className="text-sm text-gray-600 hover:text-bonsai-green-600">
                  松類
                </Link>
              </li>
              <li>
                <Link href="/products?category=落葉樹" className="text-sm text-gray-600 hover:text-bonsai-green-600">
                  落葉樹
                </Link>
              </li>
              <li>
                <Link href="/products?category=花木" className="text-sm text-gray-600 hover:text-bonsai-green-600">
                  花木
                </Link>
              </li>
              <li>
                <Link href="/products?category=針葉樹" className="text-sm text-gray-600 hover:text-bonsai-green-600">
                  針葉樹
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 mt-8">
          <p className="text-center text-sm text-gray-600">
            © 2024 盆栽コレクション. All rights reserved. 
            商品の購入はAmazonで行われます。
          </p>
        </div>
      </div>
    </footer>
  )
}

export { Footer }