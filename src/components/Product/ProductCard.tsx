import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Product } from '../../types/product';
import { useCart } from '../../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const mainImage = product.images?.[0]?.image_url || 'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=400';
  const mainVariant = product.variants?.[0];
  const pricing = mainVariant?.pricing;
  
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

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!mainVariant || !pricing) return;

    try {
      console.log('ProductCard: Adding to cart with data:', {
        variantId: mainVariant.id,
        asin: product.asin,
        quantity: 1,
        productDetails: {
          price: pricing.effective_price,
          name: product.name,
          image: mainImage,
          weight: mainVariant.weight,
          weightUnit: mainVariant.weight_unit
        }
      });
      
      await addToCart(mainVariant.id, product.asin, 1, {
        price: pricing.effective_price,
        name: product.name,
        image: mainImage,
        weight: mainVariant.weight,
        weightUnit: mainVariant.weight_unit
      });
      
      console.log('ProductCard: Item added to cart successfully');
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error instanceof Error && error.message.includes('sign in')) {
        alert('Please sign in to add items to cart');
      } else {
        alert('Failed to add item to cart. Please try again.');
      }
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 group overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Link to={`/product/${product.slug}`}>
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>
        
        {/* Discount Badge */}
        {pricing && pricing.discount_percent > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
            -{Math.round(pricing.discount_percent)}%
          </div>
        )}

        {/* Wishlist Button */}
        <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100">
          <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
        </button>

        {/* Quick Add to Cart */}
        <button 
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 p-2 bg-orange-500 text-white rounded-full shadow-md hover:bg-orange-600 transition-colors opacity-0 group-hover:opacity-100"
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand & Region */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded">
            {product.brand}
          </span>
          <span className="text-xs text-gray-500">{product.region}</span>
        </div>

        {/* Product Name */}
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-orange-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.averageRating && product.averageRating > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {renderStars(product.averageRating)}
            </div>
            <span className="text-sm text-gray-600">
              ({product.totalReviews})
            </span>
          </div>
        )}

        {/* Variant Info */}
        {mainVariant && (
          <div className="text-sm text-gray-600 mb-3">
            {mainVariant.weight} {mainVariant.weight_unit}
          </div>
        )}

        {/* Pricing */}
        {pricing && (
          <div className="space-y-1">
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
            
            {pricing.cost_per_gram > 0 && (
              <div className="text-xs text-gray-500">
                {formatPrice(pricing.cost_per_gram)}/{mainVariant?.weight_unit === 'ml' ? 'ml' : 'g'}
              </div>
            )}
          </div>
        )}

        {/* Stock Status */}
        {mainVariant && (
          <div className="mt-3">
            {Number(mainVariant.stock) > 0 ? (
              <span className="text-xs text-green-600 font-medium">
                {Number(mainVariant.stock) > 10 ? 'In Stock' : `Only ${mainVariant.stock} left`}
              </span>
            ) : (
              <span className="text-xs text-red-600 font-medium">Out of Stock</span>
            )}
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className={`w-full mt-4 py-2 px-4 rounded-lg font-medium transition-colors ${
            mainVariant && Number(mainVariant.stock) > 0
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!mainVariant || Number(mainVariant.stock) <= 0}
        >
          {mainVariant && Number(mainVariant.stock) > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;