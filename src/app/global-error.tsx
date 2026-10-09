'use client'

// レイアウトごと表示できないときの画面（最後の手段）
export default function GlobalError({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, background: '#f7f4ee', color: '#2b2824', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '64px 16px', textAlign: 'center' }}>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#1a365d' }}>ページを表示できませんでした</p>
          <p style={{ fontSize: 14, lineHeight: 1.8 }}>一時的に読み込みに失敗しました。お手数ですが、もう一度読み込んでください。</p>
          <button type="button" onClick={() => window.location.reload()} style={{ marginTop: 16, background: '#1a365d', color: '#fff', border: 0, borderRadius: 8, padding: '10px 20px', fontWeight: 700 }}>
            もう一度読み込む
          </button>
          {error.digest && <p style={{ marginTop: 24, fontSize: 11, color: '#78716c' }}>エラー番号：{error.digest}</p>}
        </div>
      </body>
    </html>
  )
}
