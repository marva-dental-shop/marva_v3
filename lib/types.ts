export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
};

export type Product = {
  id: string;
  slug: string;
  categoryId: string;
  moyskladProductId?: string;
  name: string;
  price: number;
  oldPrice?: number;
  currency?: string;
  image: string;
  badge?: string;
  shortDescription: string;
  description: string;
  stock: number;
  featured?: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type ReelProductPreview = {
  id: number;
  name: string;
  price: number;
  old_price?: number | null;
  image_url?: string | null;
  images?: string[] | null;
  description?: string | null;
  full_description?: string | null;
  category_id?: number | null;
  stock?: number | null;
  is_featured?: boolean | null;
};

export type Reel = {
  id: number;
  title?: string | null;
  video_url: string;
  product_id?: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at?: string;
  product?: ReelProductPreview | null;
};