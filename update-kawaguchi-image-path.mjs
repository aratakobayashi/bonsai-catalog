import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ptbowbqrykqwxuzivbdv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek'
);

async function updateKawaguchiImagePath() {
  try {
    console.log('🔄 川口緑化センターの画像パスを静的ファイルに更新...');

    // 記事と同じ方式で静的ファイルパスに更新
    const staticImagePath = '/images/gardens/kawaguchi-ryokuka-center-jurian.svg';

    const { data, error } = await supabase
      .from('gardens')
      .update({ image_url: staticImagePath })
      .eq('id', '3000a4b6-0a10-4896-9ff2-b3a9d09c14db')
      .select('name, image_url');

    if (error) {
      console.error('❌ 更新エラー:', error.message);
      console.log('🔍 これは予想されるRLSエラーです');
      console.log('💡 記事と同じようにこの後の手順で対応します');
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ 更新成功！');
      console.log('   園名:', data[0].name);
      console.log('   新しい画像パス:', data[0].image_url);
    } else {
      console.log('⚠️ 更新対象が見つかりませんでした');
    }

    // 確認
    const { data: checkData } = await supabase
      .from('gardens')
      .select('name, image_url')
      .eq('id', '3000a4b6-0a10-4896-9ff2-b3a9d09c14db')
      .single();

    console.log('\n📋 現在の状態:');
    console.log('   園名:', checkData?.name);
    console.log('   画像URL:', checkData?.image_url);

  } catch (err) {
    console.error('❌ 予期しないエラー:', err);
  }
}

updateKawaguchiImagePath();