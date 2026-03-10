import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '../../lib/supabase';

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    images: Array<{ image_url: string }>;
    variants: Array<{
      id: string;
      weight: number;
      weight_unit: string;
      stock: number;
      pricing: Array<{
        effective_price: number;
        mrp: number;
        discount_percent: number;
      }>;
    }>;
  };
  created_at: string;
}

const Wishlist: React.FC = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user?.id)
        .single();

      setUserProfile(profile);

      if (profile) {
        // Get wishlist items
        const { data: items, error } = await supabase
          .from('wishlist')
          .select(`
            id,
            created_at,
            product:products(
              id,
              name,
              slug,
              brand,
              images:product_images(image_url),
              variants:product_variants(
                id,
                weight,
                weight_unit,
                stock,
                pricing:product_pricing(
                  effective_price,
                  mrp,
                  discount_percent
                )
              )
            )
          `)
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching wishlist:', error);
        } else {
          setWishlistItems(items || []);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Error removing from wishlist:', error);
        return;
      }

      fetchWishlist();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    const variant = item.product.variants?.[0];
    const pricing = variant?.pricing?.[0];
    
    if (!variant || !pricing) return;

    try {
      await addToCart(variant.id, item.product.id, 1, {
        price: pricing.effective_price,
        name: item.product.name,
        image: item.product.images?.[0]?.image_url || '',
        weight: variant.weight,
        weightUnit: variant.weight_unit
      });
      
      alert('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist</h1>
          <p className="text-gray-600">{wishlistItems.length} items in your wishlist</p>
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => {
              const variant = item.product.variants?.[0];
              const pricing = variant?.pricing?.[0];
              const mainImage = item.product.images?.[0]?.image_url || 'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=400';

              return (
                <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100 relative">
                    <img
                      src={mainImage}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="mb-2">
                      <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded">
                        {item.product.brand}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {item.product.name}
                    </h3>

                    {variant && (
                      <p className="text-sm text-gray-600 mb-3">
                        {variant.weight} {variant.weight_unit}
                      </p>
                    )}

                    {pricing && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(pricing.effective_price)}
                          </span>
                          {pricing.discount_percent > 0 && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(pricing.mrp)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                          variant && Number(variant.stock) > 0
                            ? 'bg-orange-500 hover:bg-orange-600 text-white'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={!variant || Number(variant.stock) <= 0}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {variant && Number(variant.stock) > 0 ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">Save items you love to your wishlist</p>
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Start Shopping
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;