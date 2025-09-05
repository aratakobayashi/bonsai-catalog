export type SizeCategory = 'mini' | 'small' | 'medium' | 'large' | 'unknown'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  tags: string[]
  size_category: SizeCategory
  image_url: string
  amazon_url: string
  created_at: string
  updated_at: string
}

export interface Garden {
  id: string
  name: string
  address: string
  description: string
  image_url?: string
  website_url?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface ProductFilters {
  category?: string
  tags?: string[]
  size_category?: SizeCategory
  price_min?: number
  price_max?: number
  search?: string
}