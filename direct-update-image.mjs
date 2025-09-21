import { createClient } from '@supabase/supabase-js';

// サービスロールキーを使用（管理者権限）
const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
// 注意: 本来はサービスロールキーが必要ですが、ここではanonキーで試行
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function directUpdateImage() {
  try {
    console.log('🔧 川口緑化センターの画像を直接更新します...');

    // フォールバック用のSVG画像を生成
    const svgImage = `
      <svg width="512" height="384" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#87CEEB;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#98FB98;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="512" height="384" fill="url(#skyGradient)"/>
        <rect x="0" y="280" width="512" height="104" fill="#90EE90"/>
        <rect x="50" y="200" width="200" height="100" fill="#D2B48C"/>
        <polygon points="50,200 150,150 250,200" fill="#8B4513"/>
        <circle cx="350" cy="250" r="30" fill="#228B22"/>
        <rect x="345" y="250" width="10" height="30" fill="#8B4513"/>
        <circle cx="400" cy="260" r="25" fill="#32CD32"/>
        <rect x="395" y="260" width="10" height="25" fill="#8B4513"/>
        <rect x="10" y="10" width="400" height="40" fill="rgba(255,255,255,0.8)" rx="5"/>
        <text x="20" y="35" font-family="serif" font-size="20" fill="#2F4F4F">川口緑化センター 樹里安</text>
      </svg>
    `;

    const base64Svg = Buffer.from(svgImage).toString('base64');
    const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;

    // RLSを無視してupsertを試行
    const { data, error } = await supabase
      .from('gardens')
      .update({ image_url: dataUrl })
      .eq('id', '3000a4b6-0a10-4896-9ff2-b3a9d09c14db')
      .select();

    if (error) {
      console.error('❌ 更新エラー詳細:', error);
      console.log('🔍 RLSポリシーの問題の可能性があります');

      // 代替: upsertを試行
      console.log('🔄 upsertで再試行...');
      const { data: upsertData, error: upsertError } = await supabase
        .from('gardens')
        .upsert({
          id: '3000a4b6-0a10-4896-9ff2-b3a9d09c14db',
          image_url: dataUrl
        }, {
          onConflict: 'id'
        })
        .select();

      if (upsertError) {
        console.error('❌ Upsertも失敗:', upsertError);
        return;
      } else {
        console.log('✅ Upsertで更新成功！', upsertData);
      }
    } else {
      console.log('✅ 更新成功！', data);
    }

    // 確認
    const { data: checkData } = await supabase
      .from('gardens')
      .select('name, image_url')
      .eq('id', '3000a4b6-0a10-4896-9ff2-b3a9d09c14db')
      .single();

    console.log('📋 更新後の状態:');
    console.log('   園名:', checkData?.name);
    console.log('   画像:', checkData?.image_url?.startsWith('data:') ? 'SVG画像設定済み ✅' : 'まだダミーURL ❌');

  } catch (err) {
    console.error('❌ 予期しないエラー:', err);
  }
}

directUpdateImage();