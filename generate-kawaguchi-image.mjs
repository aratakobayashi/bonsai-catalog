// Using built-in fetch in Node.js 18+

async function generateKawaguchiImage() {
  try {
    console.log('🎨 川口緑化センター樹里安の画像を生成します...');

    const response = await fetch('http://localhost:3002/api/generate-garden-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gardenName: '川口緑化センター 樹里安',
        prefecture: '埼玉県',
        city: '川口市',
        specialties: ['植木', '盆栽', '園芸資材', '季節の花卉', '講習会']
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ 画像生成成功！');
      console.log('📎 プロンプト:', result.prompt);
      console.log('🖼️ 画像URL:', result.imageUrl.substring(0, 50) + '...');

      // 画像をデータベースに保存
      const updateResponse = await fetch('http://localhost:3002/api/update-garden-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gardenId: '3000a4b6-0a10-4896-9ff2-b3a9d09c14db',
          imageUrl: result.imageUrl
        })
      });

      const updateResult = await updateResponse.json();

      if (updateResult.success) {
        console.log('✅ データベース更新完了！');
        console.log('🎉 川口緑化センターの画像表示準備完了！');
      } else {
        console.log('❌ データベース更新失敗:', updateResult.error);
      }

    } else {
      console.log('❌ 画像生成失敗:', result.error);
    }

  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

generateKawaguchiImage();