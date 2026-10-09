import { Metadata } from 'next'
import { AMAZON_ENABLED } from '@/lib/affiliate'
import Link from 'next/link'
import { CONTAINER, PageHeading } from '@/components/ui/design'

export const metadata: Metadata = {
  alternates: { canonical: '/privacy' },
  title: 'プライバシーポリシー | 盆栽コレクション',
  description: `盆栽コレクションのプライバシーポリシーです。個人情報の取り扱い、Cookie・ブラウザへの保存、Google アナリティクス・Google AdSense、楽天アフィリエイト${AMAZON_ENABLED ? '・Amazonアソシエイト' : ''}について説明しています。`,
}

export default function PrivacyPage() {
  return (
    <div className={`${CONTAINER} pb-12`}>
      <div className="mx-auto max-w-[664px]">
      <PageHeading
        title="プライバシーポリシー"
        lead="最終更新日: 2026年10月9日"
        crumbs={[{ label: 'ホーム', href: '/' }, { label: 'プライバシーポリシー' }]}
      />
      {/* 読みやすい幅で、墨の線の下に本文を置く */}
      <div className="mt-7 border-t border-sumi pt-7 lg:mt-12 lg:pt-10">

        <div className="space-y-9 text-[14px] leading-[1.95] lg:space-y-10 lg:text-[14.5px]">
          <section>
            <h2 className="mb-3 font-mincho text-[17px] font-bold tracking-[0.06em] text-ink lg:text-xl">
              1. 基本方針
            </h2>
            <p className="text-ink">
              盆栽コレクション（以下「当サイト」）は、ユーザーの皆様の個人情報保護を重要な責務と考え、
              個人情報の保護に関する法律、その他の関連法令等を遵守し、
              ユーザーの個人情報を適切に取り扱います。
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mincho text-[17px] font-bold tracking-[0.06em] text-ink lg:text-xl">
              2. 個人情報の収集について
            </h2>
            <p className="text-ink mb-4">
              当サイトでは、以下の場合に個人情報を収集することがあります：
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-ink marker:text-gold-dark">
              <li>お問い合わせ（メールでのご連絡）の際にいただく、お名前・メールアドレス・お問い合わせ内容</li>
            </ul>
            <p className="text-ink mt-4">
              収集する個人情報は、目的を明確にした上で、必要な範囲内で適法かつ公正な手段により収集します。
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mincho text-[17px] font-bold tracking-[0.06em] text-ink lg:text-xl">
              3. 個人情報の利用目的
            </h2>
            <p className="text-ink mb-4">
              収集した個人情報は、以下の目的で利用いたします：
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-ink marker:text-gold-dark">
              <li>お問い合わせへの回答・対応</li>
              <li>サービス向上のための統計・分析</li>
              <li>法令に基づく場合</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-mincho text-[17px] font-bold tracking-[0.06em] text-ink lg:text-xl">
              4. Cookie・ブラウザへの保存について
            </h2>
            <p className="text-ink mb-4">
              当サイトでは、次の目的で Cookie やブラウザの保存領域（localStorage）を利用しています。
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-ink marker:text-gold-dark">
              <li><strong>アクセス解析・広告</strong>：Google アナリティクス、Google AdSense が Cookie を利用します（5・6を参照）</li>
              <li><strong>「気になる」・最近の検索</strong>：「気になる」に追加した商品や最近の検索語は、お使いのブラウザの localStorage にだけ保存されます。当サイトのサーバーには送信されず、ブラウザのデータを消去すると削除されます</li>
            </ul>
            <p className="text-ink mt-4">
              ブラウザの設定で Cookie を無効にすることができますが、一部の機能が使えなくなる場合があります。
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mincho text-[17px] font-bold tracking-[0.06em] text-ink lg:text-xl">
              5. Google アナリティクスの利用について
            </h2>
            <p className="text-ink">
              当サイトでは、サイトの利用状況を把握するため Google アナリティクスを利用しています。
              Google アナリティクスは Cookie を使用して利用状況のデータを収集しますが、このデータに個人を特定する情報は含まれません。
              収集を望まない場合は、ブラウザの設定で Cookie を無効にするか、
              <a href="https://tools.google.com/dlpage/gaoptout?hl=ja" className="border-b border-ink text-ink hover:border-gold-dark hover:text-gold-dark" target="_blank" rel="noopener noreferrer">
                Google アナリティクス オプトアウト アドオン
              </a>
              をご利用ください。詳細は
              <a href="https://policies.google.com/technologies/partner-sites?hl=ja" className="border-b border-ink text-ink hover:border-gold-dark hover:text-gold-dark" target="_blank" rel="noopener noreferrer">
                Google のサービスを使用するサイトやアプリから収集した情報の Google による使用
              </a>
              をご確認ください。
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mincho text-[17px] font-bold tracking-[0.06em] text-ink lg:text-xl">
              6. 広告の配信について（Google AdSense）
            </h2>
            <p className="text-ink">
              当サイトは、第三者配信の広告サービス「Google AdSense」を利用しています。
              Google などの広告配信事業者は、Cookie を使用して、ユーザーが当サイトや他のサイトに過去にアクセスした際の情報に基づいて広告を配信することがあります。
              パーソナライズ広告は
              <a href="https://adssettings.google.com/" className="border-b border-ink text-ink hover:border-gold-dark hover:text-gold-dark" target="_blank" rel="noopener noreferrer">
                Google の広告設定
              </a>
              で無効にできます。
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mincho text-[17px] font-bold tracking-[0.06em] text-ink lg:text-xl">
              7. アフィリエイトプログラムについて
            </h2>
            <div className="border-y border-line py-5">
              {AMAZON_ENABLED ? (
                <>
                  <p className="text-ink">
                    当サイトは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を
                    提供することを目的に設定されたアフィリエイトプログラムである、
                    <strong>Amazonアソシエイト・プログラム</strong>の参加者です。
                  </p>
                  <p className="text-ink mt-4">
                    また、楽天市場の商品へのリンクには、<strong>楽天アフィリエイト</strong>のリンクを含む場合があります。
                  </p>
                </>
              ) : (
                <p className="text-ink">
                  楽天市場の商品へのリンクには、<strong>楽天アフィリエイト</strong>のリンクを含む場合があります。
                </p>
              )}
              <p className="text-ink mt-4">
                商品へのリンクにはアフィリエイト用の情報が含まれており、リンク先で商品が購入された場合に当サイトに紹介料が支払われることがあります。
                {AMAZON_ENABLED ? 'リンク先の Amazon・楽天市場では、各社の規約に基づいて Cookie が利用されます。' : 'リンク先の楽天市場では、楽天グループの規約に基づいて Cookie が利用されます。'}
                この仕組みによって購入者に追加の費用が発生することはありません。
                当サイトでは商品の販売を行っていないため、注文・配送・返品は購入したショップへお問い合わせください。
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-mincho text-[17px] font-bold tracking-[0.06em] text-ink lg:text-xl">
              8. 個人情報の第三者への提供
            </h2>
            <p className="text-ink mb-4">
              当サイトは、以下の場合を除き、個人情報を第三者に提供することはありません：
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-ink marker:text-gold-dark">
              <li>ユーザーご本人の同意がある場合</li>
              <li>法令に基づく場合</li>
              <li>人の生命、身体又は財産の保護のために必要がある場合</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-mincho text-[17px] font-bold tracking-[0.06em] text-ink lg:text-xl">
              9. 個人情報の安全管理
            </h2>
            <p className="text-ink">
              当サイトは、個人情報の漏洩、滅失又は毀損の防止その他の個人情報の安全管理のために
              必要かつ適切な措置を講じます。
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mincho text-[17px] font-bold tracking-[0.06em] text-ink lg:text-xl">
              10. プライバシーポリシーの変更
            </h2>
            <p className="text-ink">
              当サイトは、プライバシーポリシーを適宜見直し、改善に努めます。
              変更した場合は、当ページに掲載してお知らせします。
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mincho text-[17px] font-bold tracking-[0.06em] text-ink lg:text-xl">
              11. お問い合わせ
            </h2>
            <p className="text-ink">
              プライバシーポリシーに関するご質問やご意見については、
              <Link href="/contact" className="border-b border-ink text-ink hover:border-gold-dark hover:text-gold-dark">
                お問い合わせページ
              </Link>
              からご連絡ください。
            </p>
          </section>
        </div>

        <div className="mt-10 border-t border-line pt-6">
          <p className="text-sm text-ink-muted">
            このプライバシーポリシーは、当サイトにおける個人情報の取り扱いについて定めたものです。
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}