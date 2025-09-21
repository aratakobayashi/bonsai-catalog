import fetch from 'node-fetch';

async function generateAllGardensImages() {
  try {
    console.log('🚀 全盆栽園の画像を一括生成します...');
    console.log('⏳ この処理は数分かかる場合があります...');

    const response = await fetch('http://localhost:3002/api/update-garden-images', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ 一括画像生成完了！');
      console.log(`📊 処理結果: 成功${result.successCount}件, 失敗${result.errorCount}件`);

      if (result.results) {
        console.log('\n📋 詳細結果:');
        result.results.forEach(r => {
          const status = r.success ? '✅' : '❌';
          console.log(`   ${status} ${r.gardenName}`);
        });
      }
    } else {
      console.log('❌ 一括画像生成失敗:', result.error);
    }

  } catch (error) {
    console.error('❌ エラー:', error.message);
    console.log('💡 開発サーバーが起動していることを確認してください');
    console.log('   npm run dev');
  }
}

generateAllGardensImages();