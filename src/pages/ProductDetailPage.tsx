import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useProduct } from '../hooks/useProducts';
import ProductDetail from '../components/Product/ProductDetail';

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { product, loading, error, refetch } = useProduct(slug || '');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductDetail product={product} onProductUpdate={refetch} />
    </div>
  );
};

export default ProductDetailPage;