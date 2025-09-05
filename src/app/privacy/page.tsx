import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プライバシーポリシー | 盆栽カタログ',
  description: '盆栽カタログのプライバシーポリシーです。個人情報の取り扱い、Cookie利用、Amazonアソシエイトプログラムについて説明しています。',
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-primary-800 mb-8">
          プライバシーポリシー
        </h1>
        
        <p className="text-neutral-600 mb-8">
          最終更新日: {new Date().getFullYear()}年{new Date().getMonth() + 1}月{new Date().getDate()}日
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-primary-700 mb-4">
              1. 基本方針
            </h2>
            <p className="text-neutral-700 leading-relaxed">
              盆栽カタログ（以下「当サイト」）は、ユーザーの皆様の個人情報保護を重要な責務と考え、
              個人情報の保護に関する法律、その他の関連法令等を遵守し、
              ユーザーの個人情報を適切に取り扱います。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary-700 mb-4">
              2. 個人情報の収集について
            </h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              当サイトでは、以下の場合に個人情報を収集することがあります：
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li>お問い合わせフォームの送信時</li>
              <li>ニュースレターの購読申し込み時</li>
              <li>アンケートやキャンペーンへの参加時</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mt-4">
              収集する個人情報は、目的を明確にした上で、必要な範囲内で適法かつ公正な手段により収集します。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary-700 mb-4">
              3. 個人情報の利用目的
            </h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              収集した個人情報は、以下の目的で利用いたします：
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li>お問い合わせへの回答・対応</li>
              <li>サービス向上のための統計・分析</li>
              <li>重要なお知らせの送付</li>
              <li>法令に基づく場合</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary-700 mb-4">
              4. Cookieの利用について
            </h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              当サイトでは、ユーザーの利便性向上のためCookieを利用しています：
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li><strong>セッション管理</strong>: ユーザーセッションの維持</li>
              <li><strong>設定保存</strong>: ユーザーの設定・選択の保存</li>
              <li><strong>アクセス解析</strong>: Google Analyticsによるサイト利用状況の分析</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mt-4">
              ユーザーはブラウザの設定でCookieを無効にすることができますが、
              一部機能が制限される場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary-700 mb-4">
              5. Google Analyticsの利用について
            </h2>
            <p className="text-neutral-700 leading-relaxed">
              当サイトでは、サイトの利用状況を把握するためGoogle Analyticsを利用しています。
              Google Analyticsは、Cookieを使用してユーザーの行動に関する情報を収集しますが、
              個人を特定する情報は収集していません。詳細は
              <a href="https://policies.google.com/privacy" className="text-accent-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Googleプライバシーポリシー
              </a>
              をご確認ください。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary-700 mb-4">
              6. Amazonアソシエイト・プログラムについて
            </h2>
            <div className="bg-accent-50 p-6 rounded-lg border border-accent-200">
              <p className="text-neutral-700 leading-relaxed">
                当サイトは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を
                提供することを目的に設定されたアフィリエイトプログラムである、
                <strong>Amazonアソシエイト・プログラム</strong>の参加者です。
              </p>
              <p className="text-neutral-700 leading-relaxed mt-4">
                当サイトがご紹介するAmazon商品へのリンクには、アフィリエイトIDが含まれており、
                商品が購入された場合に当サイトに紹介料が支払われる仕組みになっています。
                ただし、この仕組みによってお客様に追加の費用が発生することはありません。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary-700 mb-4">
              7. 個人情報の第三者への提供
            </h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              当サイトは、以下の場合を除き、個人情報を第三者に提供することはありません：
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li>ユーザーご本人の同意がある場合</li>
              <li>法令に基づく場合</li>
              <li>人の生命、身体又は財産の保護のために必要がある場合</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary-700 mb-4">
              8. 個人情報の安全管理
            </h2>
            <p className="text-neutral-700 leading-relaxed">
              当サイトは、個人情報の漏洩、滅失又は毀損の防止その他の個人情報の安全管理のために
              必要かつ適切な措置を講じます。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary-700 mb-4">
              9. プライバシーポリシーの変更
            </h2>
            <p className="text-neutral-700 leading-relaxed">
              当サイトは、プライバシーポリシーを適宜見直し、改善に努めます。
              変更した場合は、当ページに掲載してお知らせします。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary-700 mb-4">
              10. お問い合わせ
            </h2>
            <p className="text-neutral-700 leading-relaxed">
              プライバシーポリシーに関するご質問やご意見については、
              <a href="/contact" className="text-accent-600 hover:underline">
                お問い合わせページ
              </a>
              からご連絡ください。
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-200">
          <p className="text-sm text-neutral-500">
            このプライバシーポリシーは、当サイトにおける個人情報の取り扱いについて定めたものです。
          </p>
        </div>
      </div>
    </div>
  )
}