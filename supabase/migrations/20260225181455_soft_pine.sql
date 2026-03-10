/*
  # Add Sample Products for Testing

  1. New Tables
    - Sample categories for regional foods
    - Sample products with variants and pricing
    - Sample product images
    - Sample reviews for products

  2. Security
    - All tables already have RLS enabled
    - Policies allow public read access for products
*/

-- Insert sample categories
INSERT INTO categories (name, slug) VALUES
('Cold Pressed Oils', 'cold-pressed-oils'),
('Organic Spices', 'organic-spices'),
('Heritage Grains', 'heritage-grains'),
('Wild Honey', 'wild-honey'),
('Traditional Pickles', 'traditional-pickles');

-- Insert sample products
INSERT INTO products (asin, name, slug, category_id, brand, region, description, about_item_1, about_item_2, about_item_3, about_item_4, about_item_5, country_of_origin) VALUES
('B08K1234567', 'Kerala Wood Pressed Coconut Oil', 'kerala-wood-pressed-coconut-oil', (SELECT id FROM categories WHERE slug = 'cold-pressed-oils'), 'RegionalMart', 'Kerala', 'Premium wood pressed coconut oil extracted using traditional methods from fresh coconuts sourced directly from Kerala farms.', 'Made using traditional wood pressing method', 'No heat or chemicals used in extraction', 'Rich in natural antioxidants and vitamins', 'Fresh coconut aroma and taste', 'Suitable for cooking and hair care', 'India'),
('B08K2345678', 'Kashmiri Saffron Premium Grade', 'kashmiri-saffron-premium-grade', (SELECT id FROM categories WHERE slug = 'organic-spices'), 'Kashmir Valley', 'Kashmir', 'Authentic Kashmiri saffron with deep red color and intense aroma. Hand-picked from the saffron fields of Pampore, Kashmir.', 'Grade A+ premium quality saffron', 'Hand-picked from Pampore fields', 'Deep red color with golden tips', 'Intense aroma and flavor', 'Lab tested for purity', 'India'),
('B08K3456789', 'Rajasthani Desert Honey Raw', 'rajasthani-desert-honey-raw', (SELECT id FROM categories WHERE slug = 'wild-honey'), 'Desert Bloom', 'Rajasthan', 'Raw unprocessed honey collected from desert flowers of Rajasthan. Rich in minerals and natural enzymes.', 'Raw and unprocessed honey', 'Collected from desert flowers', 'Rich in natural enzymes', 'No artificial additives', 'Crystallizes naturally', 'India'),
('B08K4567890', 'Himalayan Pink Salt Coarse', 'himalayan-pink-salt-coarse', (SELECT id FROM categories WHERE slug = 'organic-spices'), 'Mountain Pure', 'Himalayas', 'Pure Himalayan pink salt mined from ancient salt deposits. Rich in minerals and perfect for cooking and seasoning.', 'Mined from ancient salt deposits', 'Rich in 84+ trace minerals', 'No artificial processing', 'Beautiful pink color', 'Perfect for cooking and finishing', 'Pakistan'),
('B08K5678901', 'Organic Basmati Rice Aged', 'organic-basmati-rice-aged', (SELECT id FROM categories WHERE slug = 'heritage-grains'), 'Heritage Grains', 'Punjab', 'Premium aged basmati rice with extra long grains and distinctive aroma. Grown using organic farming methods.', 'Extra long grain basmati', 'Aged for 2+ years', 'Organic farming methods', 'Distinctive basmati aroma', 'Fluffy texture when cooked', 'India');

-- Insert product variants
INSERT INTO product_variants (product_id, weight, weight_unit, sku, stock) VALUES
((SELECT id FROM products WHERE asin = 'B08K1234567'), 500, 'ml', 'KWPCO-500ML', 50),
((SELECT id FROM products WHERE asin = 'B08K1234567'), 1000, 'ml', 'KWPCO-1L', 30),
((SELECT id FROM products WHERE asin = 'B08K2345678'), 1, 'g', 'KS-1G', 25),
((SELECT id FROM products WHERE asin = 'B08K2345678'), 2, 'g', 'KS-2G', 15),
((SELECT id FROM products WHERE asin = 'B08K3456789'), 500, 'g', 'RDH-500G', 40),
((SELECT id FROM products WHERE asin = 'B08K3456789'), 1000, 'g', 'RDH-1KG', 20),
((SELECT id FROM products WHERE asin = 'B08K4567890'), 500, 'g', 'HPS-500G', 60),
((SELECT id FROM products WHERE asin = 'B08K4567890'), 1000, 'g', 'HPS-1KG', 35),
((SELECT id FROM products WHERE asin = 'B08K5678901'), 1000, 'g', 'OBR-1KG', 45),
((SELECT id FROM products WHERE asin = 'B08K5678901'), 5000, 'g', 'OBR-5KG', 20);

-- Insert product pricing
INSERT INTO product_pricing (variant_id, mrp, discount_percent, effective_price, cost_per_gram) VALUES
((SELECT id FROM product_variants WHERE sku = 'KWPCO-500ML'), 450, 10, 405, 0.81),
((SELECT id FROM product_variants WHERE sku = 'KWPCO-1L'), 850, 15, 722.50, 0.72),
((SELECT id FROM product_variants WHERE sku = 'KS-1G'), 1200, 5, 1140, 1140),
((SELECT id FROM product_variants WHERE sku = 'KS-2G'), 2200, 8, 2024, 1012),
((SELECT id FROM product_variants WHERE sku = 'RDH-500G'), 650, 12, 572, 1.14),
((SELECT id FROM product_variants WHERE sku = 'RDH-1KG'), 1200, 15, 1020, 1.02),
((SELECT id FROM product_variants WHERE sku = 'HPS-500G'), 280, 0, 280, 0.56),
((SELECT id FROM product_variants WHERE sku = 'HPS-1KG'), 520, 5, 494, 0.49),
((SELECT id FROM product_variants WHERE sku = 'OBR-1KG'), 320, 8, 294.40, 0.29),
((SELECT id FROM product_variants WHERE sku = 'OBR-5KG'), 1450, 12, 1276, 0.26);

-- Insert product images
INSERT INTO product_images (product_id, image_url, display_order) VALUES
((SELECT id FROM products WHERE asin = 'B08K1234567'), 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=800', 1),
((SELECT id FROM products WHERE asin = 'B08K1234567'), 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=800', 2),
((SELECT id FROM products WHERE asin = 'B08K2345678'), 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=800', 1),
((SELECT id FROM products WHERE asin = 'B08K2345678'), 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=800', 2),
((SELECT id FROM products WHERE asin = 'B08K3456789'), 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=800', 1),
((SELECT id FROM products WHERE asin = 'B08K3456789'), 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=800', 2),
((SELECT id FROM products WHERE asin = 'B08K4567890'), 'https://images.pexels.com/photos/1340116/pexels-photo-1340116.jpeg?auto=compress&cs=tinysrgb&w=800', 1),
((SELECT id FROM products WHERE asin = 'B08K4567890'), 'https://images.pexels.com/photos/1340116/pexels-photo-1340116.jpeg?auto=compress&cs=tinysrgb&w=800', 2),
((SELECT id FROM products WHERE asin = 'B08K5678901'), 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=800', 1),
((SELECT id FROM products WHERE asin = 'B08K5678901'), 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=800', 2);

-- Insert sample reviews
INSERT INTO reviews (product_id, user_id, rating, title, comment) VALUES
((SELECT id FROM products WHERE asin = 'B08K1234567'), (SELECT id FROM users LIMIT 1), 5, 'Excellent quality coconut oil', 'This is the best coconut oil I have ever used. The aroma is amazing and it works great for both cooking and hair care.'),
((SELECT id FROM products WHERE asin = 'B08K1234567'), (SELECT id FROM users LIMIT 1), 4, 'Good product', 'Quality is good but packaging could be better. Overall satisfied with the purchase.'),
((SELECT id FROM products WHERE asin = 'B08K2345678'), (SELECT id FROM users LIMIT 1), 5, 'Authentic Kashmiri saffron', 'The color and aroma are perfect. You can tell this is genuine Kashmiri saffron. Worth every penny.'),
((SELECT id FROM products WHERE asin = 'B08K3456789'), (SELECT id FROM users LIMIT 1), 4, 'Pure honey', 'Raw honey with great taste. It crystallized naturally which shows its purity.'),
((SELECT id FROM products WHERE asin = 'B08K4567890'), (SELECT id FROM users LIMIT 1), 5, 'Best pink salt', 'Beautiful color and great taste. Much better than regular table salt.'),
((SELECT id FROM products WHERE asin = 'B08K5678901'), (SELECT id FROM users LIMIT 1), 5, 'Premium basmati rice', 'Long grains, great aroma, and perfect texture. This is restaurant quality rice.');