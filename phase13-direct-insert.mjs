// Direct SQL insert for Phase 13 data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertPhase13DirectSQL() {
  try {
    console.log('🚀 Executing Phase 13 insertion via direct SQL...\n');

    // Single SQL statement to insert all Phase 13 gardens
    const sql = `
      INSERT INTO gardens (
        name, address, description, image_url, website_url, phone,
        prefecture, city, postal_code, latitude, longitude,
        business_hours, closed_days, specialties, established_year,
        owner_name, owner_message, access_info, parking_info,
        experience_programs, online_sales, rating, review_count, featured,
        additional_images, social_instagram, social_twitter, social_facebook
      ) VALUES 
      (
        '川口緑化センター 樹里安',
        '埼玉県川口市安行領家844-2',
        '400年以上の歴史を有する安行植木の里に位置する道の駅。植木、花鉢、園芸資材を500種類以上販売し、植木や盆栽の講習会や展示会を定期的に開催。地元の植木職人が育てた伝統植木を購入できる屋外植木広場も併設。',
        'https://via.placeholder.com/400x300?text=川口緑化センター樹里安',
        'https://www.jurian.or.jp/',
        '048-296-4021',
        '埼玉県',
        '川口市',
        '334-0058',
        35.8234,
        139.7345,
        '園芸販売 9:00-17:00、レストラン 11:00-15:00',
        ARRAY['月曜日（6-2月）', '年末年始'],
        ARRAY['植木', '盆栽', '園芸資材', '季節の花卉', '講習会'],
        1992,
        '川口緑化センター',
        '植木と盆栽の伝統を400年以上守り続ける安行の地で、皆様をお待ちしております。講習会や展示会で盆栽の魅力を広めています。',
        '埼玉高速鉄道線戸塚安行駅から徒歩20分',
        '大型駐車場完備（無料）',
        true,
        false,
        4.3,
        128,
        true,
        ARRAY[]::text[],
        null,
        null,
        null
      ),
      (
        'あゆみ野農協安行園芸センター',
        '埼玉県川口市安行1159-2',
        '川口市内最大級の売場面積を誇る植木・草花専門の総合園芸店。植木、苗木、盆栽、鉢物、花物、園芸資材を幅広く取り扱い、一般向けからプロ向けまで対応。造園職人による庭園設計・施工管理も提供。',
        'https://via.placeholder.com/400x300?text=あゆみ野農協安行園芸センター',
        'https://www.facebook.com/engei.center87181/',
        '048-295-1013',
        '埼玉県',
        '川口市',
        '334-0057',
        35.8156,
        139.7298,
        '9:00-17:30',
        ARRAY['不定休'],
        ARRAY['植木', '苗木', '盆栽', '鉢物', '園芸資材', '造園設計'],
        1978,
        'あゆみ野農協',
        '地元農協として50年以上地域の園芸文化を支えてきました。プロから愛好家まで、植木と盆栽のことなら何でもご相談ください。',
        'JR京浜東北線川口駅からバス25分',
        '広域駐車場あり（無料）',
        true,
        false,
        4.1,
        85,
        true,
        ARRAY[]::text[],
        null,
        null,
        null
      ),
      (
        '植政',
        '埼玉県川口市安行1048',
        '明治40年創業の老舗植木店。100年以上の歴史を持つ家族経営の専門店として、植木から盆栽まで伝統の技術と現代のニーズを融合させた商品を提供。特に松柏類の盆栽で定評があり、全国の愛好家に愛される。',
        'https://via.placeholder.com/400x300?text=植政',
        'http://uemasa.com/',
        '048-295-2479',
        '埼玉県',
        '川口市',
        '334-0057',
        35.8123,
        139.7289,
        '9:00-17:00',
        ARRAY['日曜日'],
        ARRAY['盆栽', '植木', '松柏類', '造園', '技術指導'],
        1907,
        '植木政夫',
        '明治の創業から4代続く伝統を守りながら、現代の愛好家の皆様にも親しまれる盆栽作りを心がけております。',
        'JR京浜東北線川口駅からバス20分',
        '店舗前駐車可',
        true,
        false,
        4.4,
        92,
        true,
        ARRAY[]::text[],
        null,
        null,
        null
      );
    `;

    console.log('📝 Executing SQL insert...');
    const { data, error } = await supabase.rpc('execute_sql', { sql_statement: sql });

    if (error) {
      console.error('❌ Error executing SQL:', error.message);
      
      // Try with individual queries
      console.log('\n🔄 Attempting individual record insertion...');
      let successCount = 0;
      
      const gardens = [
        {
          name: '川口緑化センター 樹里安',
          description: '400年以上の歴史を有する安行植木の里に位置する道の駅'
        },
        {
          name: 'あゆみ野農協安行園芸センター', 
          description: '川口市内最大級の売場面積を誇る植木・草花専門の総合園芸店'
        },
        {
          name: '植政',
          description: '明治40年創業の老舗植木店'
        }
      ];

      for (const garden of gardens) {
        const insertQuery = `INSERT INTO gardens (name, description, prefecture, city) VALUES ('${garden.name}', '${garden.description}', '埼玉県', '川口市')`;
        
        const { error: insertError } = await supabase.rpc('execute_sql', { 
          sql_statement: insertQuery 
        });
        
        if (insertError) {
          console.error(`❌ Failed to insert ${garden.name}: ${insertError.message}`);
        } else {
          console.log(`✅ Successfully inserted: ${garden.name}`);
          successCount++;
        }
      }
      
      console.log(`\n📊 Individual insertion results: ${successCount}/${gardens.length} successful`);
    } else {
      console.log('✅ Bulk SQL insertion successful!');
      console.log('📊 Result:', data);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

insertPhase13DirectSQL();