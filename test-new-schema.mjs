// Test new schema and data access
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptbowbqrykqwxuzivbdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Ym93YnFyeWtxd3h1eml2YmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQxMDMsImV4cCI6MjA3MjYzMDEwM30.vBU1isCrm5dirAqHMQxJY209B13gnyKx4TCFFX_xxek';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSchema() {
  console.log('🧪 Testing new database schema...\n');

  // Test 1: Check complete table structure
  console.log('📊 Test 1: Complete table structure');
  const { data: allData, error: allError } = await supabase
    .from('gardens')
    .select('*')
    .limit(1);

  if (allError) {
    console.error('❌ Error fetching all data:', allError.message);
  } else if (allData && allData.length > 0) {
    const garden = allData[0];
    console.log(`✅ Total fields available: ${Object.keys(garden).length}`);
    console.log('📋 New fields status:');
    
    const newFields = [
      'prefecture', 'city', 'specialties', 'rating', 'owner_name', 
      'business_hours', 'experience_programs', 'online_sales'
    ];
    
    newFields.forEach(field => {
      const value = garden[field];
      const status = value !== null && value !== undefined ? '✅' : '❌';
      console.log(`   ${status} ${field}: ${JSON.stringify(value)}`);
    });
  }

  // Test 2: Try to insert new garden with extended data
  console.log('\n🌿 Test 2: Insert new garden with extended data');
  const newGarden = {
    name: '松風盆栽園（テスト）',
    address: '京都府京都市右京区嵐山天龍寺造路町20-1',
    description: '嵐山の美しい自然に囲まれた伝統的な盆栽園',
    prefecture: '京都府',
    city: '京都市',
    postal_code: '616-8385',
    latitude: 35.0116,
    longitude: 135.6761,
    specialties: ['松柏類', '花もの', '山野草'],
    established_year: 1923,
    owner_name: '松本 和夫',
    rating: 4.8,
    review_count: 89,
    featured: true,
    business_hours: '8:00-18:00',
    experience_programs: true,
    online_sales: false
  };

  const { data: insertData, error: insertError } = await supabase
    .from('gardens')
    .insert([newGarden])
    .select();

  if (insertError) {
    console.error('❌ Insert failed:', insertError.message);
    console.log('   This might be due to RLS policies');
  } else {
    console.log('✅ New garden inserted successfully!');
    if (insertData && insertData.length > 0) {
      const inserted = insertData[0];
      console.log(`   Name: ${inserted.name}`);
      console.log(`   Prefecture: ${inserted.prefecture}`);
      console.log(`   Specialties: ${JSON.stringify(inserted.specialties)}`);
      console.log(`   Rating: ${inserted.rating}⭐`);
    }
  }

  // Test 3: Test computed view if available
  console.log('\n🔍 Test 3: Testing computed view');
  const { data: viewData, error: viewError } = await supabase
    .from('gardens_with_computed')
    .select('name, display_rating, garden_age')
    .limit(1);

  if (viewError) {
    console.error('❌ View access failed:', viewError.message);
  } else {
    console.log('✅ Computed view accessible!');
    if (viewData && viewData.length > 0) {
      console.log(`   Sample: ${viewData[0].name} - ${viewData[0].display_rating}⭐`);
    }
  }
}

testSchema();