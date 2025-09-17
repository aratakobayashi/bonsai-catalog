import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ptbowbqrykqwxuzivbdv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek'
);

// 水やりガイドのアイキャッチ画像を更新
const newFeaturedImageUrl = '/images/guides/watering-guide-featured.jpg';

try {
  // 記事のアイキャッチ画像を更新
  const { data, error } = await supabase
    .from('articles')
    .update({
      featured_image_url: newFeaturedImageUrl,
      featured_image_alt: '盆栽水やりマスターガイド - プロが教える失敗しない水やり術',
      updated_at: new Date().toISOString()
    })
    .eq('slug', 'bonsai-watering-master-guide-2025')
    .select();

  if (error) {
    console.error('❌ エラー:', error);
    process.exit(1);
  }

  console.log('✅ 水やりガイドのアイキャッチ画像を更新しました！');
  console.log('📸 新しい画像: ' + newFeaturedImageUrl);
  console.log('🎨 美しい盆栽と水やりのビジュアル画像に変更');

} catch (err) {
  console.error('❌ 実行エラー:', err);
  process.exit(1);
}