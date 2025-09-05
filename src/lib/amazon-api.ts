/**
 * Amazon Product Advertising API integration
 */

import {
  categorizeAmazonProduct,
  generateProductTags,
  determineSizeCategory,
  normalizePrice,
  generateAffiliateURL
} from './amazon';
import type { Product } from '@/types';

// API設定
const AWS_ACCESS_KEY_ID = process.env.AMAZON_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AMAZON_SECRET_ACCESS_KEY;
const PARTNER_TAG = process.env.AMAZON_PARTNER_TAG || 'oshikatsucoll-22';
const MARKETPLACE = 'www.amazon.co.jp';

/**
 * Amazon商品検索用のクエリ定数
 */
export const BONSAI_SEARCH_KEYWORDS = [
  // 盆栽樹木
  '盆栽 松',
  '盆栽 もみじ',
  '盆栽 梅',
  '盆栽 桜',
  '盆栽 つつじ',
  '盆栽 真柏',
  '盆栽 けやき',
  '盆栽 椿',
  
  // 盆栽用品
  '盆栽鉢',
  '盆栽 道具',
  '盆栽 ハサミ',
  '盆栽 用土',
  '盆栽 肥料',
  '盆栽 ワイヤー',
  
  // 特定商品
  '信楽焼 盆栽鉢',
  '赤玉土',
  '桐生砂',
  '盆栽 剪定ハサミ'
] as const;

/**
 * Amazon API未設定時のモックデータ
 */
export const MOCK_AMAZON_PRODUCTS = [
  {
    ASIN: 'B08KGF5XX1',
    title: '黒松 盆栽 樹齢約10年',
    description: '初心者にも育てやすい黒松の盆栽。小品サイズで室内でも楽しめます。',
    price: 8800,
    images: {
      primary: { large: { url: 'https://images.unsplash.com/photo-1516253593875-bd7f052ab1b5?w=400' } }
    },
    detailPageURL: 'https://www.amazon.co.jp/dp/B08KGF5XX1',
    features: ['樹齢約10年', '小品盆栽', '初心者向け', '育成ガイド付き']
  },
  {
    ASIN: 'B09XYZ1234',
    title: '信楽焼 盆栽鉢 楕円形 5号',
    description: '伝統的な信楽焼の盆栽鉢。中品盆栽に最適なサイズです。',
    price: 4500,
    images: {
      primary: { large: { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400' } }
    },
    detailPageURL: 'https://www.amazon.co.jp/dp/B09XYZ1234',
    features: ['信楽焼', '5号サイズ', '楕円形', '排水穴付き']
  },
  {
    ASIN: 'B07ABC5678',
    title: 'もみじ盆栽セット（鉢・土・肥料付き）',
    description: '春の新緑から秋の紅葉まで四季を楽しめるもみじ盆栽の初心者セット。',
    price: 6800,
    images: {
      primary: { large: { url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400' } }
    },
    detailPageURL: 'https://www.amazon.co.jp/dp/B07ABC5678',
    features: ['初心者セット', '鉢・土・肥料付き', '四季楽しめる', '育成説明書付き']
  },
  {
    ASIN: 'B06DEF9101',
    title: '盆栽剪定ハサミ ステンレス製 専用ケース付き',
    description: '切れ味抜群のステンレス製剪定ハサミ。細かい作業に最適です。',
    price: 3200,
    images: {
      primary: { large: { url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' } }
    },
    detailPageURL: 'https://www.amazon.co.jp/dp/B06DEF9101',
    features: ['ステンレス製', '専用ケース付き', '切れ味抜群', 'メンテナンス用品付き']
  }
];

/**
 * Amazon APIクライアント（将来実装用）
 */
class AmazonApiClient {
  private accessKeyId: string;
  private secretAccessKey: string;
  private partnerTag: string;
  
  constructor(accessKeyId: string, secretAccessKey: string, partnerTag: string) {
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.partnerTag = partnerTag;
  }
  
  /**
   * 商品検索（実装予定）
   */
  async searchProducts(keywords: string, maxResults: number = 10) {
    // TODO: 実際のAmazon Product Advertising API実装
    throw new Error('Amazon API not implemented yet. Use mock data instead.');
  }
  
  /**
   * 商品詳細取得（実装予定）
   */
  async getProductDetails(asin: string) {
    // TODO: 実際のAPI実装
    throw new Error('Amazon API not implemented yet. Use mock data instead.');
  }
}

/**
 * Amazon商品データを我々のProduct形式に変換
 */
export function convertAmazonProductToProduct(amazonProduct: any): Omit<Product, 'id' | 'created_at' | 'updated_at'> {
  const title = amazonProduct.title || amazonProduct.ItemInfo?.Title?.DisplayValue || '';
  const description = amazonProduct.description || 
    amazonProduct.features?.join(' ') || 
    amazonProduct.ItemInfo?.Features?.DisplayValues?.join(' ') || 
    title;
  
  const priceAmount = amazonProduct.price || 
    amazonProduct.Offers?.Listings?.[0]?.Price?.Amount || 
    amazonProduct.ItemInfo?.Price?.Amount || 
    0;
  
  const imageUrl = amazonProduct.images?.primary?.large?.url || 
    amazonProduct.Images?.Primary?.Large?.URL || 
    'https://images.unsplash.com/photo-1516253593875-bd7f052ab1b5?w=400';
  
  const detailPageURL = amazonProduct.detailPageURL || 
    amazonProduct.DetailPageURL || 
    `https://www.amazon.co.jp/dp/${amazonProduct.ASIN}`;

  return {
    name: title,
    description: description,
    price: normalizePrice(priceAmount),
    category: categorizeAmazonProduct(title, description),
    tags: generateProductTags(title, description, amazonProduct.features),
    size_category: determineSizeCategory(title, description),
    image_url: imageUrl,
    amazon_url: generateAffiliateURL(detailPageURL)
  };
}

/**
 * モックデータから商品を取得（API実装までの代替）
 */
export async function getMockAmazonProducts(): Promise<Omit<Product, 'id' | 'created_at' | 'updated_at'>[]> {
  console.log('🧪 モックAmazon商品データを使用中...');
  
  // 実際のAPI呼び出しをシミュレート
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return MOCK_AMAZON_PRODUCTS.map(convertAmazonProductToProduct);
}

/**
 * Amazon商品を検索（現在はモックデータ）
 */
export async function searchAmazonProducts(keywords: string[]): Promise<Omit<Product, 'id' | 'created_at' | 'updated_at'>[]> {
  // API認証情報が設定されている場合は実際のAPIを使用（将来実装）
  if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && AWS_ACCESS_KEY_ID !== 'your_access_key_here') {
    try {
      // const client = new AmazonApiClient(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, PARTNER_TAG);
      // return await client.searchProducts(keywords.join(' '));
      console.log('🔧 Amazon API実装予定。現在はモックデータを使用。');
    } catch (error) {
      console.error('Amazon API error, falling back to mock data:', error);
    }
  }
  
  // モックデータを返す
  return getMockAmazonProducts();
}

/**
 * 商品データの品質チェック
 */
export function validateProductData(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): boolean {
  return !!(
    product.name && 
    product.description && 
    product.price > 0 && 
    product.category && 
    product.amazon_url
  );
}

/**
 * データベースに商品を一括追加するための準備
 */
export async function prepareProductsForDatabase(limit: number = 20): Promise<Omit<Product, 'id' | 'created_at' | 'updated_at'>[]> {
  console.log('🔍 Amazon商品データを取得・変換中...');
  
  const products = await searchAmazonProducts(BONSAI_SEARCH_KEYWORDS);
  
  // データ品質チェック
  const validProducts = products.filter(validateProductData);
  
  console.log(`✅ ${validProducts.length}/${products.length} 件の有効な商品データを取得`);
  
  // 指定された数に制限
  return validProducts.slice(0, limit);
}