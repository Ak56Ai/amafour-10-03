import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types/product';

export const useProducts = (categorySlug?: string, limit?: number) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [categorySlug, limit]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Add a small delay to ensure environment variables are loaded
      await new Promise(resolve => setTimeout(resolve, 100));

      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          variants:product_variants(
            *,
            pricing:product_pricing(*)
          ),
          images:product_images(*),
          reviews:reviews(rating)
        `)
        .order('created_at', { ascending: false });

      if (categorySlug) {
        query = query.eq('category.slug', categorySlug);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Process products to add calculated fields
      const processedProducts = data?.map((product: any) => ({
        ...product,
        averageRating: product.reviews?.length > 0 
          ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length
          : 0,
        totalReviews: product.reviews?.length || 0,
        // Ensure variants have proper pricing data
        variants: product.variants?.map((variant: any) => ({
          ...variant,
          pricing: variant.pricing?.[0] || variant.pricing || null
        })) || []
      })) || [];

      setProducts(processedProducts);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch: fetchProducts };
};

export const useProduct = (slug: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          variants:product_variants(
            *,
            pricing:product_pricing(*)
          ),
          images:product_images(*),
          reviews:reviews(
            *,
            user:users(first_name, last_name)
          ),
          review_stats:reviews(
            id,
            rating,
            review_likes(id),
            review_comments(id)
          )
        `)
        .eq('slug', slug)
        .single();

      if (error) {
        throw error;
      }

      // Process product to add calculated fields
      const processedProduct = {
        ...data,
        averageRating: data.reviews?.length > 0 
          ? data.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / data.reviews.length
          : 0,
        totalReviews: data.reviews?.length || 0,
        // Ensure variants have proper pricing data
        variants: data.variants?.map((variant: any) => ({
          ...variant,
          pricing: variant.pricing?.[0] || variant.pricing || null
        })) || [],
        reviews: data.reviews?.map((review: any) => ({
          ...review,
          likes_count: review.review_likes?.length || 0,
          comments_count: review.review_comments?.length || 0,
        })) || [],
      };

      setProduct(processedProduct);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  return { product, loading, error, refetch: fetchProduct };
};