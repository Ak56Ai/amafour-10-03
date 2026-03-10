import React, { useState, useEffect } from 'react';
import { Star, ShoppingCart, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '../../lib/supabase';

interface RecommendationItem {
  id: string;
  recommendation_type: string;
  score: number;
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
    reviews: Array<{ rating: number }>;
  };
}

const Recommendations: React.FC = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user?.id)
        .single();

      setUserProfile(profile);

      if (profile) {
        // Get recommendations
        const { data: items, error } = await supabase
          .from('user_recommendations')
          .select(`
            id,
            recommendation_type,
            score,
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
              ),
              reviews:reviews(rating)
            )
          `)
          .eq('user_id', profile.id)
          .order('score', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Error fetching recommendations:', error);
        } else {
          setRecommendations(items || []);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (item: RecommendationItem) => {
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

  const getAverageRating = (reviews: Array<{ rating: number }>) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : i < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRecommendationTypeLabel = (type: string) => {
    switch (type) {
      case 'popular': return 'Popular';
      case 'trending': return 'Trending';
      case 'similar': return 'Similar to your purchases';
      case 'category': return 'From your favorite categories';
      default: return 'Recommended';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Recommended for You</h1>
          <p className="text-gray-600">Products we think you'll love based on your preferences</p>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((item) => {
              const variant = item.product.variants?.[0];
              const pricing = variant?.pricing?.[0];
              const mainImage = item.product.images?.[0]?.image_url || 'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=400';
              const averageRating = getAverageRating(item.product.reviews);

              return (
                <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100 relative">
                    <Link to={`/product/${item.product.slug}`}>
                      <img
                        src={mainImage}
                        alt={item.product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      {Math.round(item.score)}% match
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="mb-2">
                      <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded">
                        {item.product.brand}
                      </span>
                      <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded ml-2">
                        {getRecommendationTypeLabel(item.recommendation_type)}
                      </span>
                    </div>

                    <Link to={`/product/${item.product.slug}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-orange-600 transition-colors">
                        {item.product.name}
                      </h3>
                    </Link>

                    {averageRating > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {renderStars(averageRating)}
                        </div>
                        <span className="text-sm text-gray-600">
                          ({item.product.reviews.length})
                        </span>
                      </div>
                    )}

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
                    <button
                      onClick={() => handleAddToCart(item)}
                      className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
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
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
            <p className="text-gray-600 mb-6">Browse and purchase products to get personalized recommendations</p>
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

export default Recommendations;