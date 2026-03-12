/*
  # Add Razorpay Payment Tables

  1. New Tables
    - `pending_orders` - Stores orders waiting for payment completion
    - `payment_idempotency` - Prevents duplicate payment processing
    - `processed_webhooks` - Tracks processed Razorpay webhooks
    - `payment_logs` - Audit log for payment events

  2. Updates to orders table
    - Add Razorpay-specific columns
    - Add shipping and payment method columns

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for authenticated users
*/

-- Add missing columns to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'shipping_cost'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_cost numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'shipping_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_method text DEFAULT 'standard';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method text DEFAULT 'cod';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'razorpay_order_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN razorpay_order_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'razorpay_payment_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN razorpay_payment_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'razorpay_signature'
  ) THEN
    ALTER TABLE orders ADD COLUMN razorpay_signature text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'order_reference'
  ) THEN
    ALTER TABLE orders ADD COLUMN order_reference text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'order_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN order_number text;
  END IF;
END $$;

-- Create pending_orders table
CREATE TABLE IF NOT EXISTS pending_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_reference text UNIQUE NOT NULL,
  razorpay_order_id text UNIQUE NOT NULL,
  user_id uuid REFERENCES users(id),
  address_id uuid REFERENCES user_addresses(id),
  cart_items jsonb NOT NULL,
  total_amount numeric NOT NULL,
  shipping_cost numeric DEFAULT 0,
  payment_method text DEFAULT 'razorpay',
  status text DEFAULT 'pending_payment',
  idempotency_key text,
  failure_reason text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pending_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pending orders"
  ON pending_orders FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = pending_orders.user_id));

-- Create payment_idempotency table
CREATE TABLE IF NOT EXISTS payment_idempotency (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key text UNIQUE NOT NULL,
  request_hash text NOT NULL,
  response_data jsonb,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_idempotency ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage idempotency"
  ON payment_idempotency FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create processed_webhooks table
CREATE TABLE IF NOT EXISTS processed_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_payment_id text UNIQUE NOT NULL,
  razorpay_order_id text,
  event_type text NOT NULL,
  processed_at timestamptz DEFAULT now()
);

ALTER TABLE processed_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage webhooks"
  ON processed_webhooks FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create payment_logs table
CREATE TABLE IF NOT EXISTS payment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_payment_id text,
  razorpay_order_id text,
  status text NOT NULL,
  error text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage payment logs"
  ON payment_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add missing columns to cart_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'product_name'
  ) THEN
    ALTER TABLE cart_items ADD COLUMN product_name text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'product_image'
  ) THEN
    ALTER TABLE cart_items ADD COLUMN product_image text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'variant_weight'
  ) THEN
    ALTER TABLE cart_items ADD COLUMN variant_weight numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'variant_weight_unit'
  ) THEN
    ALTER TABLE cart_items ADD COLUMN variant_weight_unit text DEFAULT 'g';
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pending_orders_reference ON pending_orders(order_reference);
CREATE INDEX IF NOT EXISTS idx_pending_orders_razorpay_id ON pending_orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_pending_orders_user_id ON pending_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_idempotency_key ON payment_idempotency(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_processed_webhooks_payment_id ON processed_webhooks(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(order_reference);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);