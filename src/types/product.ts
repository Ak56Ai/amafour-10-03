export interface Product {
  id: string;
  asin: string;
  name: string;
  slug: string;
  category_id: string;
  brand: string;
  region: string;
  description: string;
  about_item_1: string;
  about_item_2: string;
  about_item_3: string;
  about_item_4: string;
  about_item_5: string;
  expiry_date?: string;
  country_of_origin: string;
  created_at: string;
  category?: Category;
  variants?: ProductVariant[];
  images?: ProductImage[];
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  weight: number;
  weight_unit: string;
  sku: string;
  stock: number;
  created_at: string;
  pricing?: ProductPricing;
}

export interface ProductPricing {
  id: string;
  variant_id: string;
  mrp: number;
  discount_percent: number;
  effective_price: number;
  cost_per_gram: number;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
  };
}