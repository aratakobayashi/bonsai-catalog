const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAndUpdate() {
  try {
    // 現在の状態を確認
    const { data: current, error: currentError } = await supabase
      .from('gardens')
      .select('id, name, image_url')
      .eq('id', '8f99da6b-ee77-4c5f-86a9-92b0f5c7f99d')
      .single();

    if (currentError) {
      console.error('Current check error:', currentError);
      return;
    }

    console.log('Current state:');
    console.log('Name:', current.name);
    console.log('Image URL:', current.image_url?.substring(0, 100) + '...');
    console.log('URL Length:', current.image_url?.length);

    // SVG画像で更新
    const svgImageUrl = 'data:image/svg+xml;base64,CiAgICA8c3ZnIHdpZHRoPSI1MTIiIGhlaWdodD0iMzg0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogICAgICA8ZGVmcz4KICAgICAgICA8bGluZWFyR3JhZGllbnQgaWQ9InNreUdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjAlIiB5Mj0iMTAwJSI+CiAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojODdDRUVCO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOThGQjk4O3N0b3Atb3BhY2l0eToxIiAvPgogICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJidWlsZGluZ0dyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjAlIiB5Mj0iMTAwJSI+CiAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRDJCNDhDO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOEI0NTEzO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICAgIDwvZGVmcz4KCiAgICAgIDwhLS0g6IOM5pmvIC0tPgogICAgICA8cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjM4NCIgZmlsbD0idXJsKCNza3lHcmFkaWVudCkiLz4KCiAgICAgIDwhLS0g5Zyw6Z2iIC0tPgogICAgICA8cmVjdCB4PSIwIiB5PSIyODAiIHdpZHRoPSI1MTIiIGhlaWdodD0iMTA0IiBmaWxsPSIjOTBFRTkwIi8+CgogICAgICA8IS0tIOW7uueJqSAtLT4KICAgICAgPHJlY3QgeD0iNTAiIHk9IjIwMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjYnVpbGRpbmdHcmFkaWVudCkiLz4KICAgICAgPHBvbHlnb24gcG9pbnRzPSI1MCwyMDAgMTUwLDE1MCAyNTAsMjAwIiBmaWxsPSIjOEI0NTEzIi8+CgogICAgICA8IS0tIOebhuagveOBruacqOOAhSAtLT4KICAgICAgPGNpcmNsZSBjeD0iMzUwIiBjeT0iMjUwIiByPSIzMCIgZmlsbD0iIzIyOEIyMiIvPgogICAgICA8cmVjdCB4PSIzNDUiIHk9IjI1MCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjOEI0NTEzIi8+CgogICAgICA8Y2lyY2xlIGN4PSI0MDAiIGN5PSIyNjAiIHI9IjI1IiBmaWxsPSIjMzJDRDMyIi8+CiAgICAgIDxyZWN0IHg9IjM5NSIgeT0iMjYwIiB3aWR0aD0iMTAiIGhlaWdodD0iMjUiIGZpbGw9IiM4QjQ1MTMiLz4KCiAgICAgIDxjaXJjbGUgY3g9IjQyMCIgY3k9IjI0MCIgcj0iMjAiIGZpbGw9IiMyMjhCMjIiLz4KICAgICAgPHJlY3QgeD0iNDE3IiB5PSIyNDAiIHdpZHRoPSI2IiBoZWlnaHQ9IjIwIiBmaWxsPSIjOEI0NTEzIi8+CgogICAgICA8IS0tIOWwj+mBkyAtLT4KICAgICAgPHBhdGggZD0iTSAwIDMyMCBRIDI1NiAzMDAgNTEyIDMyMCIgc3Ryb2tlPSIjRDJCNDhDIiBzdHJva2Utd2lkdGg9IjIwIiBmaWxsPSJub25lIi8+CgogICAgICA8IS0tIOijhemjvueahOOBquimgee0oCAtLT4KICAgICAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMzIwIiByPSI4IiBmaWxsPSIjQTA1MjJEIi8+CiAgICAgIDxjaXJjbGUgY3g9IjE1MCIgY3k9IjMxMCIgcj0iNiIgZmlsbD0iI0EwNTIyRCIvPgogICAgICA8Y2lyY2xlIGN4PSIyMDAiIGN5PSIzMjUiIHI9IjciIGZpbGw9IiNBMDUyMkQiLz4KCiAgICAgIDwhLS0g44K/44Kk44OI44Or6IOM5pmvIC0tPgogICAgICA8cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIzMDAiIGhlaWdodD0iNDAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC44KSIgcng9IjUiLz4KICAgICAgPHRleHQgeD0iMjAiIHk9IjM1IiBmb250LWZhbWlseT0ic2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMyRjRGNEYiPlRyYWRpdGlvbmFsIEJvbnNhaSBHYXJkZW48L3RleHQ+CiAgICA8L3N2Zz4KICA=';

    const { data: updated, error: updateError } = await supabase
      .from('gardens')
      .update({ image_url: svgImageUrl })
      .eq('id', '8f99da6b-ee77-4c5f-86a9-92b0f5c7f99d')
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return;
    }

    console.log('\nAfter update:');
    console.log('Name:', updated.name);
    console.log('Image URL type:', updated.image_url?.substring(0, 30) + '...');
    console.log('New URL Length:', updated.image_url?.length);
    console.log('Successfully updated!');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkAndUpdate();