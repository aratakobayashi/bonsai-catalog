// Google Search Console verification meta tag component
// 認証後にこのコンポーネントを使用してメタタグを追加

interface GoogleVerificationProps {
  content: string // Google Search Consoleから提供される認証コード
}

export function GoogleVerification({ content }: GoogleVerificationProps) {
  return (
    <meta 
      name="google-site-verification" 
      content={content} 
    />
  )
}

// 使用例:
// layout.tsx の <head> セクションに以下を追加
// <GoogleVerification content="YOUR_VERIFICATION_CODE_HERE" />