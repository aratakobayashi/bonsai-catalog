import { Metadata } from 'next'
import Link from 'next/link'
import { CONTAINER, PageHeading } from '@/components/ui/design'

export const metadata: Metadata = {
  alternates: { canonical: '/terms' },
  title: '利用規約 | 盆栽コレクション',
  description: '盆栽コレクションの利用規約です。サービス利用条件、免責事項、著作権について説明しています。',
}

export default function TermsPage() {
  return (
    <div className={`${CONTAINER} pb-12`}>
      <div className="mx-auto max-w-[664px]">
      <PageHeading
        title="利用規約"
        lead="最終更新日: 2026年10月9日"
        crumbs={[{ label: 'ホーム', href: '/' }, { label: '利用規約' }]}
      />
      {/* 読みやすい幅で、墨の線の下に本文を置く */}
      <div className="mt-7 border-t border-sumi pt-7 lg:mt-12 lg:pt-10">

        <div className="space-y-9 text-[14px] leading-[1.95] lg:space-y-10 lg:text-[14.5px]">
          <section>
            <h2 className="mb-3 font-mincho text-[17px] font-bold tracking-[0.06em] text-ink lg:text-xl">
              第1条（適用）
            </h2>
            <p className="text-ink">
              本利用規約（以下「本規約」）は、盆栽コレクション（以下「当サイト」）が提供するサービス（以下「本サービス」）の
              利用条件を定めるものです。ユーザーの皆様（以下「ユーザー」）には、本規約に従って、
              本サービスをご利用いただきます。
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mincho text-[17px] font-bold tracking-[0.06em] text-ink lg:text-xl">
              第2条（利用登録）
            </h2>
            <ol className="list-decimal pl-6 space-y-2 text-ink marker:text-gold-dark">
              <li>本サービスの利用にあたり、特別な登録は必要ありません。</li>
              <li>お問い合わせやニュースレター購読時に提供された情報は、適切に管理いたします。</li>
              <li>虚偽の情報を提供した場合、サービスの利用をお断りする場合があります。</li>
            </ol>
          </section>

          <section>
            <h2 className="mb-3 font-mincho text-[17px] font-bold tracking-[0.06em] text-ink lg:text-xl">
              第3条（サービス内容）
            </h2>
            <p className="text-ink mb-4">
              当サイトは、以下のサービスを提供します：
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-ink marker:text-gold-dark">
              <li>盆栽関連商品の情報提供・紹介</li>
              <li>盆栽園・販売店の情報提供</li>
              <li>盆栽に関する知識・ノウハウの提供</li>
              <li>通販サイト（楽天市場など）の商品ページへのリンクの提供</li>
              <li>その他、盆栽愛好家向けの情報サービス</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-mincho text-[17px] font-bold tracking-[0.06em] text-ink lg:text-xl">
              第4条（利用料金）
            </h2>
            <p className="text-ink">
              本サービスは無料でご利用いただけます。ただし、本サービスの利用に際してかかる
              通信費等はユーザーの負担となります。
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mincho text-[17px] font-bold tracking-[0.06em] text-ink lg:text-xl">
              第5条（禁止事項）
            </h2>
            <p className="text-ink mb-4">
              ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません：
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-ink marker:text-gold-dark">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>当サイトのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
              <li>当サイトのサービスの運営を妨害するおそれのある行為</li>
              <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
              <li>他のユーザーに成りすます行為</li>
              <li>当サイトが提供するサービスに関し、営利を目的とする行為（承認されたものを除く）</li>
              <li>その他、当サイトが不適切と判断する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-mincho text-[17px] font-bold tracking-[0.06em] text-ink lg:text-xl">
              第6条（本サービスの提供の停止等）
            </h2>
            <ol className="list-decimal pl-6 space-y-2 text-ink marker:text-gold-dark">
              <li>当サイトは、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
                <ul className="list-disc pl-6 mt-2 space-y-1 marker:text-gold-dark">
                  <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                  <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                  <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                  <li>その他、当サイトが本サービスの提供が困難と判断した場合</li>
                </ul>
              </li>
              <li>当サイトは、本サービスの提供の停止または中断により、ユーザーまたは第三者が被ったいかなる不利益または損害についても、一切の責任を負わないものとします。</li>
            </ol>
          </section>

          <section>
            <h2 className="mb-3 font-mincho text-[17px] font-bold tracking-[0.06em] text-ink lg:text-xl">
              第7条（著作権）
            </h2>
            <ol className="list-decimal pl-6 space-y-2 text-ink marker:text-gold-dark">
              <li>当サイトに掲載されているコンテンツ（文章、画像、動画等）の著作権は、当サイトまたは権利者に帰属します。</li>
              <li>ユーザーは、当サイトのコンテンツを、個人的な利用の範囲を超えて複製、転載、配布することはできません。</li>
              <li>商用利用をご希望の場合は、事前にお問い合わせください。</li>
            </ol>
          </section>

          <section>
            <h2 className="mb-3 font-mincho text-[17px] font-bold tracking-[0.06em] text-ink lg:text-xl">
              第8条（免責事項）
            </h2>
            <ol className="list-decimal pl-6 space-y-2 text-ink marker:text-gold-dark">
              <li>当サイトは、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。</li>
              <li>当サイトは、本サービスに起因してユーザーに生じたあらゆる損害について、一切の責任を負いません。</li>
              <li>当サイトで紹介している商品の購入、その他の取引についてのトラブルについて、当サイトは一切の責任を負いません。</li>
              <li>当サイトからリンクされている外部サイトの内容については、当サイトは一切の責任を負いません。</li>
            </ol>
          </section>

          <section>
            <h2 className="mb-3 font-mincho text-[17px] font-bold tracking-[0.06em] text-ink lg:text-xl">
              第9条（サービス内容の変更等）
            </h2>
            <p className="text-ink">
              当サイトは、ユーザーへの事前の告知をもって、本サービスの内容を変更、追加または廃止することがあり、
              ユーザーはこれに同意するものとします。
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mincho text-[17px] font-bold tracking-[0.06em] text-ink lg:text-xl">
              第10条（利用規約の変更）
            </h2>
            <p className="text-ink">
              当サイトは、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
              なお、本規約の変更後、本サービスの利用を継続されたユーザーは、変更後の規約に同意したものとみなします。
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mincho text-[17px] font-bold tracking-[0.06em] text-ink lg:text-xl">
              第11条（個人情報の取扱い）
            </h2>
            <p className="text-ink">
              当サイトは、本サービスの利用によって取得する個人情報については、
              <a href="/privacy" className="border-b border-ink text-ink hover:border-gold-dark hover:text-gold-dark">
                プライバシーポリシー
              </a>
              に従い適切に取り扱うものとします。
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mincho text-[17px] font-bold tracking-[0.06em] text-ink lg:text-xl">
              第12条（準拠法・裁判管轄）
            </h2>
            <ol className="list-decimal pl-6 space-y-2 text-ink marker:text-gold-dark">
              <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
              <li>本サービスに関して紛争が生じた場合には、東京地方裁判所を専属的合意管轄とします。</li>
            </ol>
          </section>

          <section>
            <h2 className="mb-3 font-mincho text-[17px] font-bold tracking-[0.06em] text-ink lg:text-xl">
              第13条（お問い合わせ）
            </h2>
            <p className="text-ink">
              本規約に関するお問い合わせは、
              <Link href="/contact" className="border-b border-ink text-ink hover:border-gold-dark hover:text-gold-dark">
                お問い合わせページ
              </Link>
              からご連絡ください。
            </p>
          </section>
        </div>

        <div className="mt-10 border-t border-line pt-6">
          <p className="text-sm text-ink-muted">
            以上
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}