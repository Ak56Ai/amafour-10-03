import React, { useState, useEffect } from 'react';
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Award } from 'lucide-react';
import { Product } from '../../types/product';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import ReviewSection from './ReviewSection';

interface ProductDetailProps {
  product: Product;
  onProductUpdate?: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onProductUpdate }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkWishlistStatus();
    }
  }, [user, product.id]);

  const checkWishlistStatus = async () => {
    if (!user) return;

    try {
      const { data: profiles } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .limit(1);

      const profile = profiles && profiles.length > 0 ? profiles[0] : null;
      if (!profile) return;

      const { data: wishlistItems } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', profile.id)
        .eq('product_id', product.id)
        .limit(1);

      setIsInWishlist(wishlistItems && wishlistItems.length > 0);
    } catch (error) {
      // Not in wishlist or error
      setIsInWishlist(false);
    }
  };

  const pricing = selectedVariant?.pricing;
  const images = product.images || [];

  const formatPrice = (price: number) => {
    if (!price || isNaN(Number(price))) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : i < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const aboutItems = [
    product.about_item_1,
    product.about_item_2,
    product.about_item_3,
    product.about_item_4,
    product.about_item_5,
  ].filter(Boolean);

  const handleAddToCart = async () => {
    if (!selectedVariant || !pricing) return;

    try {
      console.log('ProductDetail: Adding to cart with data:', {
        variantId: selectedVariant.id,
        asin: product.asin,
        quantity: quantity,
        productDetails: {
          price: pricing.effective_price,
          name: product.name,
          image: images[selectedImageIndex]?.image_url || 'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=800',
          weight: selectedVariant.weight,
          weightUnit: selectedVariant.weight_unit
        }
      });
      
      await addToCart(selectedVariant.id, product.asin, quantity, {
        price: pricing.effective_price,
        name: product.name,
        image: images[selectedImageIndex]?.image_url || 'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=800',
        weight: selectedVariant.weight,
        weightUnit: selectedVariant.weight_unit
      });
      
      console.log('ProductDetail: Item added to cart successfully');
      alert('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error instanceof Error && error.message.includes('sign in')) {
        alert('Please sign in to add items to cart');
      } else {
        alert('Failed to add item to cart. Please try again.');
      }
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      alert('Please sign in to add items to wishlist');
      return;
    }

    setWishlistLoading(true);
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!profile) throw new Error('User profile not found');

      if (isInWishlist) {
        // Remove from wishlist
        await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', profile.id)
          .eq('product_id', product.id);
        setIsInWishlist(false);
      } else {
        // Add to wishlist
        await supabase
          .from('wishlist')
          .insert([{
            user_id: profile.id,
            product_id: product.id
          }]);
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      alert('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = product.name;
    const text = `Check out this amazing product: ${product.name}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        alert('Product link copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        alert('Unable to share. Please copy the URL manually.');
      }
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
            <img
              src={images[selectedImageIndex]?.image_url || 'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=800'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index ? 'border-orange-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image.image_url}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Brand & Category */}
          <div className="flex items-center gap-4">
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              {product.brand}
            </span>
            <span className="text-gray-600 text-sm">{product.category?.name}</span>
          </div>

          {/* Product Name */}
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          {/* Rating */}
          {product.averageRating && product.averageRating > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {renderStars(product.averageRating)}
              </div>
              <span className="text-lg font-medium text-gray-900">
                {product.averageRating.toFixed(1)}
              </span>
              <span className="text-gray-600">
                ({product.totalReviews} reviews)
              </span>
            </div>
          )}

          {/* Description */}
          <p className="text-gray-700 text-lg leading-relaxed">{product.description}</p>

          {/* Variant Selection */}
          {product.variants && product.variants.length > 1 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Size</h3>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                      selectedVariant?.id === variant.id
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {variant.weight} {variant.weight_unit}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pricing */}
          {pricing && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(pricing.effective_price)}
                </span>
                {pricing.discount_percent > 0 && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(pricing.mrp)}
                    </span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-semibold">
                      -{Math.round(Number(pricing.discount_percent))}% OFF
                    </span>
                  </>
                )}
              </div>
              {pricing.cost_per_gram > 0 && (
                <p className="text-gray-600">
                  {formatPrice(pricing.cost_per_gram)} per {selectedVariant?.weight_unit === 'ml' ? 'ml' : 'g'}
                </p>
              )}
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-lg font-semibold text-gray-900">Quantity:</label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-100 transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  selectedVariant && Number(selectedVariant.stock) > 0
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!selectedVariant || Number(selectedVariant.stock) === 0}
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </button>
              <button 
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`p-3 border rounded-lg transition-colors ${
                  isInWishlist 
                    ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
              </button>
              <button 
                onClick={handleShare}
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Stock Status */}
          {selectedVariant && (
            <div className="text-sm">
              {Number(selectedVariant.stock) > 0 ? (
                <span className="text-green-600 font-medium">
                  ✓ {Number(selectedVariant.stock) > 10 ? 'In Stock' : `Only ${selectedVariant.stock} left in stock`}
                </span>
              ) : (
                <span className="text-red-600 font-medium">✗ Out of Stock</span>
              )}
            </div>
          )}

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <Truck className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Free Delivery</p>
                <p className="text-sm text-gray-600">On orders above ₹500</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Secure Payment</p>
                <p className="text-sm text-gray-600">100% secure payment</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="h-6 w-6 text-orange-600" />
              <div>
                <p className="font-medium text-gray-900">Easy Returns</p>
                <p className="text-sm text-gray-600">7-day return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Quality Assured</p>
                <p className="text-sm text-gray-600">Premium quality products</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Sections */}
      <div className="mt-16 space-y-12">
        {/* About This Item */}
        {aboutItems.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">About this item</h2>
            <ul className="space-y-3">
              {aboutItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Product Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Brand</h3>
              <p className="text-gray-700">{product.brand}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Region</h3>
              <p className="text-gray-700">{product.region}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Country of Origin</h3>
              <p className="text-gray-700">{product.country_of_origin}</p>
            </div>
            {selectedVariant && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Weight</h3>
                <p className="text-gray-700">{selectedVariant.weight} {selectedVariant.weight_unit}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewSection
          productId={product.id}
          reviews={product.reviews || []}
          onReviewsUpdate={onProductUpdate || (() => {})}
        />
      </div>
    </div>
  );
};

export default ProductDetail;