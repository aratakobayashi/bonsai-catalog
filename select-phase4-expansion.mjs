import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ptbowbqrykqwxuzivbdv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek'
);

async function selectPhase4Expansion() {
  try {
    // 既に対応済みのIDリスト（フェーズ1-3）
    const completedIds = new Set([
      // 初期実装園
      '3000a4b6-0a10-4896-9ff2-b3a9d09c14db', // 川口緑化センター
      '8f99da6b-ee77-4c5f-86a9-92b0f5c7f99d', // 九霞園
      '60842140-ce64-4848-a55c-5457a8703d33', // 藤樹園
      'e695fdf3-4e1c-4b6b-b20b-59e17cba279a', // 清香園
      'eb263d7a-701b-4b4b-9b01-776a8ea2cdf4', // 蔓青園
      '75779219-963c-49eb-942a-c2f6caa3c7a1', // 芙蓉園
      // プレミアム園（第2弾）
      '20702388-f8b8-408e-8d6e-dd158031b048', // 春花園BONSAI美術館
      'a23957ee-4154-4d59-9bb8-f18ee1c8ca26', // 中西珍松園
      'f0f86407-1a4b-4100-987c-2743b441fcee', // 陽春園
      'b5305c48-7ebe-4486-8391-622f282ebfbc', // 京都伝統庭園センター
      '5e7de278-e355-42be-943d-3e877f04bfcf', // 沖縄盆栽園
      '1cdef4ba-d729-47c4-be31-86c879ea0aa2', // 関西盆栽センター
      'f61bc0fe-53e8-4ec3-a3a8-29bfff2c0870', // 京都盆栽会館
      '34ba6634-3e68-4ed6-a766-07ac2d3aba33', // 武蔵野盆栽園
      '5266402a-5bda-4a5b-bfbd-eaf58e8d9f99', // 鎌倉盆栽苑
      'cfd47538-d3b2-4c33-869a-68652c2d0563', // 浅草盆栽工房
      // フェーズ3（地域多様性コレクション）
      '3c4f5845-c6f7-47e7-87d5-d68b5cafc0ae', // まつおえんげい
      'd59a502e-61cb-427e-ac93-bb4da4dfc5f6', // 養庄園
      '253b3027-463f-4bd9-847e-90547715cb9b', // SOLSO FARM
      '9a1819fd-05a1-4d66-9877-bc07607ba19a', // 見元園芸
      '323ae2c8-82a0-480a-a0bf-3eeab52baa3a', // ガーデニングサロン 風の散歩道
      'aec3cb3b-ff22-476a-9728-b52547ab3a98', // 松江盆栽センター
      '40a5e7c5-8cb6-46ef-bd83-cb830d7da0cd', // 盆栽四季の杜
      '929b849b-0b11-45b7-b5d8-9bf09cfd64d0', // 神戸盆栽館
      'b81646b0-261b-4e3b-b6f3-8ebfb2fb0cb9', // さぬき盆栽の郷
      '29a49dbc-e5e1-4201-afe9-0b4a09223095'  // 大和魂盆栽
    ]);

    // 全データを取得してJavaScriptでフィルター
    const { data, error } = await supabase
      .from('gardens')
      .select('id, name, prefecture, specialties, rating, featured, established_year')
      .order('rating', { ascending: false, nullsLast: true });

    if (error) {
      console.error('❌ エラー:', error.message);
      return;
    }

    // 未対応の園をフィルター
    const remainingGardens = data?.filter(garden => !completedIds.has(garden.id)) || [];

    console.log('🚀 フェーズ4拡充計画');
    console.log('===================\n');

    console.log(`📊 現在の対応状況:`);
    console.log(`   ✅ 対応済み: 26園`);
    console.log(`   📋 残り候補: ${remainingGardens.length}園\n`);

    // 地域バランスを考慮した選定
    const selectedGardens = [];
    const selectedRegions = {};

    // 既に選定済みの地域を確認（重複を避けるため）
    const usedRegions = new Set();

    // より広範囲の地域から選定（北海道・東北・中部・中国・四国・九州を重視）
    remainingGardens.forEach(garden => {
      const region = garden.prefecture || '不明';

      if (selectedGardens.length < 15) {
        // 地域の多様性を重視（各地域から1-2園まで）
        const regionCount = selectedRegions[region] || 0;

        if (regionCount < 2) {
          selectedGardens.push(garden);
          selectedRegions[region] = regionCount + 1;
        }
      }
    });

    console.log('🎯 フェーズ4推奨候補（全国拡充・15園）:');
    console.log('=========================================\n');

    selectedGardens.slice(0, 15).forEach((garden, index) => {
      const rating = garden.rating || '未評価';
      const featured = garden.featured ? '⭐注目' : '';
      const established = garden.established_year ? `(${garden.established_year}年創業)` : '';
      const specialties = garden.specialties?.slice(0, 3).join('・') || '';

      console.log(`${index + 1}. ${garden.name} ${featured}`);
      console.log(`   📍 ${garden.prefecture} | ⭐ ${rating} | 🌿 ${specialties} ${established}`);
      console.log(`   ID: ${garden.id}`);
      console.log('');
    });

    // 地域分散状況
    console.log('📍 フェーズ4新規開拓地域:');
    Object.keys(selectedRegions).forEach(region => {
      console.log(`   ${region}: ${selectedRegions[region]}園`);
    });

    console.log('\n🌟 フェーズ4の特徴:');
    console.log('  ✅ 全国展開: 未開拓地域を重点的にカバー');
    console.log('  ✅ 専門多様化: より幅広い専門分野を追加');
    console.log('  ✅ 評価バランス: 高評価園から中堅園まで');
    console.log('  ✅ 歴史の厚み: 老舗から新しい園まで');

    return selectedGardens.slice(0, 15);

  } catch (err) {
    console.error('❌ 予期しないエラー:', err);
  }
}

selectPhase4Expansion();