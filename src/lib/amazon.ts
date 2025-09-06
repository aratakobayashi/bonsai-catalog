/**
 * Amazon Affiliate & Product API utilities
 */

export const AMAZON_ASSOCIATE_ID = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_ID || 'oshikatsucoll-22';

/**
 * Amazon商品URLにアフィリエイトタグを追加
 */
export function generateAffiliateURL(amazonUrl: string): string {
  try {
    const url = new URL(amazonUrl);
    
    // アフィリエイトタグを追加
    url.searchParams.set('tag', AMAZON_ASSOCIATE_ID);
    
    // 追跡用パラメータを追加
    url.searchParams.set('linkCode', 'as2');
    url.searchParams.set('camp', '247');
    url.searchParams.set('creative', '1211');
    
    return url.toString();
  } catch (error) {
    console.error('Invalid Amazon URL:', amazonUrl, error);
    return amazonUrl;
  }
}

/**
 * Amazon商品URLから商品IDを抽出
 */
export function extractAmazonProductId(amazonUrl: string): string | null {
  try {
    const url = new URL(amazonUrl);
    const pathname = url.pathname;
    
    // /dp/ または /gp/product/ パターンをチェック
    const dpMatch = pathname.match(/\/dp\/([A-Z0-9]{10})/);
    const gpMatch = pathname.match(/\/gp\/product\/([A-Z0-9]{10})/);
    
    return dpMatch?.[1] || gpMatch?.[1] || null;
  } catch {
    return null;
  }
}

/**
 * 商品カテゴリーを自動判定
 */
export function categorizeAmazonProduct(title: string, description?: string): string {
  const text = (title + ' ' + (description || '')).toLowerCase();
  
  // 松柏類（しょうはくるい）- 松、真柏、杜松など
  if (text.includes('松') || text.includes('パイン') || text.includes('真柏') || text.includes('杜松') || 
      text.includes('しんぱく') || text.includes('としょう') || text.includes('五葉松') || text.includes('黒松') || 
      text.includes('赤松') || text.includes('蝦夷松')) {
    return '松柏類';
  }
  
  // 雑木類（ぞうきるい）- もみじ、欅、ブナなど
  if (text.includes('もみじ') || text.includes('楓') || text.includes('メープル') || text.includes('欅') || 
      text.includes('けやき') || text.includes('ブナ') || text.includes('ぶな') || text.includes('椎') || 
      text.includes('しい') || text.includes('榎') || text.includes('えのき')) {
    return '雑木類';
  }
  
  // 花もの（はなもの）- 桜、梅、ツツジなど
  if (text.includes('梅') || text.includes('桜') || text.includes('つつじ') || text.includes('椿') || 
      text.includes('さくら') || text.includes('うめ') || text.includes('つばき') || text.includes('藤') || 
      text.includes('ふじ') || text.includes('花') || text.includes('開花')) {
    return '花もの';
  }
  
  // 実もの（みもの）- 柿、南天、ピラカンサなど
  if (text.includes('柿') || text.includes('南天') || text.includes('ピラカンサ') || text.includes('実') || 
      text.includes('かき') || text.includes('なんてん') || text.includes('果実') || text.includes('ベリー') || 
      text.includes('実り') || text.includes('実成り')) {
    return '実もの';
  }
  
  // 草もの（くさもの）- 山野草、苔など
  if (text.includes('苔') || text.includes('こけ') || text.includes('山野草') || text.includes('草') || 
      text.includes('野草') || text.includes('セダム') || text.includes('多肉') || text.includes('観葉')) {
    return '草もの';
  }
  
  // 道具・用品類
  if (text.includes('鉢') || text.includes('ポット') || text.includes('土') || text.includes('肥料') || 
      text.includes('培養土') || text.includes('ハサミ') || text.includes('道具') || text.includes('ツール') || 
      text.includes('ワイヤー')) {
    return '用品・道具';
  }
  
  // デフォルトは松柏類
  return '松柏類';
}

/**
 * タグを自動生成
 */
export function generateProductTags(title: string, description?: string, features?: string[]): string[] {
  const tags: Set<string> = new Set();
  const allText = [title, description, ...(features || [])].join(' ').toLowerCase();
  
  // レベル判定
  if (allText.includes('初心者') || allText.includes('ビギナー') || allText.includes('入門')) {
    tags.add('初心者向け');
  }
  if (allText.includes('上級') || allText.includes('プロ') || allText.includes('専門')) {
    tags.add('上級者向け');
  }
  if (!allText.includes('初心者') && !allText.includes('上級')) {
    tags.add('中級者向け');
  }
  
  // 特徴
  if (allText.includes('花')) tags.add('花');
  if (allText.includes('実') || allText.includes('果実')) tags.add('実');
  if (allText.includes('紅葉') || allText.includes('もみじ')) tags.add('紅葉');
  if (allText.includes('常緑')) tags.add('常緑');
  if (allText.includes('香り') || allText.includes('芳香')) tags.add('香り');
  
  // サイズ
  if (allText.includes('小品') || allText.includes('ミニ') || allText.includes('小さい')) tags.add('小品');
  if (allText.includes('中品')) tags.add('中品');
  if (allText.includes('大品') || allText.includes('大型')) tags.add('大品');
  
  // 季節
  if (allText.includes('春')) tags.add('春');
  if (allText.includes('夏')) tags.add('夏');
  if (allText.includes('秋')) tags.add('秋');
  if (allText.includes('冬')) tags.add('冬');
  if (allText.includes('四季')) tags.add('四季楽しめる');
  
  // 用途
  if (allText.includes('贈り物') || allText.includes('プレゼント') || allText.includes('ギフト')) {
    tags.add('贈答用');
  }
  if (allText.includes('観賞') || allText.includes('鑑賞')) tags.add('観賞用');
  if (allText.includes('学習') || allText.includes('教育') || allText.includes('練習')) tags.add('学習用');
  
  return Array.from(tags);
}

/**
 * サイズカテゴリーを判定
 */
export function determineSizeCategory(title: string, description?: string): 'mini' | 'small' | 'medium' | 'large' | 'unknown' {
  const text = (title + ' ' + (description || '')).toLowerCase();
  
  if (text.includes('ミニ') || text.includes('極小') || text.includes('手のひら')) return 'mini';
  if (text.includes('小品') || text.includes('小さい') || text.includes('卓上')) return 'small';
  if (text.includes('大品') || text.includes('大型') || text.includes('特大')) return 'large';
  if (text.includes('中品') || text.includes('中型')) return 'medium';
  
  // 鉢・道具類はunknownにする
  if (text.includes('鉢') || text.includes('道具') || text.includes('土') || text.includes('肥料')) {
    return 'unknown';
  }
  
  return 'medium'; // デフォルト
}

/**
 * アフィリエイトクリック追跡
 */
export function trackAffiliateClick(productId: string, amazonUrl: string, category?: string) {
  // Google Analytics追跡
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'affiliate_click', {
      custom_parameter_1: productId,
      custom_parameter_2: category || 'unknown',
      custom_parameter_3: AMAZON_ASSOCIATE_ID,
    });
  }
  
  // カスタム追跡（将来の分析用）
  if (typeof window !== 'undefined') {
    console.log('Affiliate Click:', {
      productId,
      amazonUrl,
      category,
      associateId: AMAZON_ASSOCIATE_ID,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * 価格を日本円として正規化
 */
export function normalizePrice(price: string | number): number {
  if (typeof price === 'number') return Math.round(price);
  
  // 文字列から数字を抽出
  const numericPrice = price.replace(/[^\d.]/g, '');
  const parsed = parseFloat(numericPrice);
  
  return isNaN(parsed) ? 0 : Math.round(parsed);
}