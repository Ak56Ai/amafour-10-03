import React, { useState, useEffect } from 'react';
import { Clock, Eye, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '../../lib/supabase';

interface BrowsingHistoryItem {
  id: string;
  viewed_at: string;
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
}

const BrowsingHistory: React.FC = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [historyItems, setHistoryItems] = useState<BrowsingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchBrowsingHistory();
    }
  }, [user]);

  const fetchBrowsingHistory = async () => {
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user?.id)
        .single();

      setUserProfile(profile);

      if (profile) {
        // Get browsing history
        const { data: items, error } = await supabase
          .from('user_browsing_history')
          .select(`
            id,
            viewed_at,
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
          .order('viewed_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching browsing history:', error);
        } else {
          setHistoryItems(items || []);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (item: BrowsingHistoryItem) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading browsing history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Browsing History</h1>
          <p className="text-gray-600">Products you've recently viewed</p>
        </div>

        {/* History Items */}
        {historyItems.length > 0 ? (
          <div className="space-y-4">
            {historyItems.map((item) => {
              const variant = item.product.variants?.[0];
              const pricing = variant?.pricing?.[0];
              const mainImage = item.product.images?.[0]?.image_url || 'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=200';

              return (
                <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-4">
                    {/* Product Image */}
                    <Link to={`/product/${item.product.slug}`} className="flex-shrink-0">
                      <img
                        src={mainImage}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="mb-1">
                            <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded">
                              {item.product.brand}
                            </span>
                          </div>
                          <Link 
                            to={`/product/${item.product.slug}`}
                            className="font-semibold text-gray-900 hover:text-orange-600 transition-colors"
                          >
                            {item.product.name}
                          </Link>
                          {variant && (
                            <p className="text-sm text-gray-600 mt-1">
                              {variant.weight} {variant.weight_unit}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>Viewed {formatDate(item.viewed_at)}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          {pricing && (
                            <div className="mb-3">
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

                          <div className="flex gap-2">
                            <Link
                              to={`/product/${item.product.slug}`}
                              className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Link>
                            <button
                              onClick={() => handleAddToCart(item)}
                              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No browsing history</h3>
            <p className="text-gray-600 mb-6">Start browsing products to see your history here</p>
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

export default BrowsingHistory;