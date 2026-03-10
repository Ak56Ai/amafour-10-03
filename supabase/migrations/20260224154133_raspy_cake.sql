/*
  # Amazon Clone Database Schema

  1. New Tables
    - `users` - User account information
    - `user_addresses` - User shipping addresses  
    - `categories` - Product categories with hierarchy
    - `products` - Main product information
    - `product_variants` - Product variations (size, weight, etc)
    - `product_pricing` - Pricing information for variants
    - `product_images` - Product images with display order
    - `reviews` - Product reviews and ratings
    - `carts` - User shopping carts
    - `cart_items` - Items in shopping carts
    - `orders` - Order information
    - `order_items` - Items in orders
    - `support_tickets` - Customer support tickets

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add admin policies where needed

  3. Indexes
    - Full-text search index on products
    - Performance indexes on commonly queried fields
*/

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  mobile text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User addresses
CREATE TABLE IF NOT EXISTS user_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  label text DEFAULT 'Home',
  address_line1 text NOT NULL,
  address_line2 text DEFAULT '',
  city text NOT NULL,
  state text NOT NULL,
  country text DEFAULT 'India',
  pincode text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Categories with hierarchy support
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  parent_id uuid REFERENCES categories(id),
  created_at timestamptz DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asin text UNIQUE NOT NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category_id uuid REFERENCES categories(id),
  brand text DEFAULT '',
  region text DEFAULT '',
  description text DEFAULT '',
  about_item_1 text DEFAULT '',
  about_item_2 text DEFAULT '',
  about_item_3 text DEFAULT '',
  about_item_4 text DEFAULT '',
  about_item_5 text DEFAULT '',
  expiry_date date,
  country_of_origin text DEFAULT 'India',
  created_at timestamptz DEFAULT now()
);

-- Product variants
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  weight numeric DEFAULT 0,
  weight_unit text DEFAULT 'g',
  sku text UNIQUE,
  stock integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Product pricing
CREATE TABLE IF NOT EXISTS product_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
  mrp numeric NOT NULL,
  discount_percent numeric DEFAULT 0,
  effective_price numeric NOT NULL,
  cost_per_gram numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Product images
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  display_order integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  title text DEFAULT '',
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Shopping carts
CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Cart items
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid REFERENCES carts(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id),
  asin text NOT NULL,
  quantity integer DEFAULT 1,
  price_at_time numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  address_id uuid REFERENCES user_addresses(id),
  total_amount numeric NOT NULL,
  payment_status text DEFAULT 'pending',
  order_status text DEFAULT 'processing',
  created_at timestamptz DEFAULT now()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id),
  quantity integer DEFAULT 1,
  price numeric NOT NULL
);

-- Support tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  order_id uuid REFERENCES orders(id),
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth_id = auth.uid());

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth_id = auth.uid());

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth_id = auth.uid());

-- User addresses policies
CREATE POLICY "Users can manage own addresses" ON user_addresses
  FOR ALL TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Public read policies for product data
CREATE POLICY "Anyone can read categories" ON categories
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read products" ON products
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read product variants" ON product_variants
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read product pricing" ON product_pricing
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read product images" ON product_images
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read reviews" ON reviews
  FOR SELECT TO anon, authenticated
  USING (true);

-- Reviews policies for authenticated users
CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Cart policies
CREATE POLICY "Users can manage own cart" ON carts
  FOR ALL TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can manage own cart items" ON cart_items
  FOR ALL TO authenticated
  USING (cart_id IN (SELECT id FROM carts WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())));

-- Order policies
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can read own order items" ON order_items
  FOR SELECT TO authenticated
  USING (order_id IN (SELECT id FROM orders WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())));

-- Support tickets policies
CREATE POLICY "Users can manage own tickets" ON support_tickets
  FOR ALL TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS users_auth_id_idx ON users(auth_id);
CREATE INDEX IF NOT EXISTS user_addresses_user_id_idx ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS products_category_id_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_slug_idx ON products(slug);
CREATE INDEX IF NOT EXISTS product_variants_product_id_idx ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS product_pricing_variant_id_idx ON product_pricing(variant_id);
CREATE INDEX IF NOT EXISTS product_images_product_id_idx ON product_images(product_id);
CREATE INDEX IF NOT EXISTS reviews_product_id_idx ON reviews(product_id);
CREATE INDEX IF NOT EXISTS cart_items_cart_id_idx ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);

-- Full-text search index for products
CREATE INDEX IF NOT EXISTS products_search_idx ON products
USING gin(to_tsvector('english', name || ' ' || coalesce(description, '') || ' ' || coalesce(brand, '')));