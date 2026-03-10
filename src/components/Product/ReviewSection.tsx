import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageCircle, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import ReviewForm from './ReviewForm';

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
  };
  likes_count?: number;
  comments_count?: number;
  user_has_liked?: boolean;
}

interface ReviewSectionProps {
  productId: string;
  reviews: Review[];
  onReviewsUpdate: () => void;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ productId, reviews, onReviewsUpdate }) => {
  const { user } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [reviewComments, setReviewComments] = useState<{ [key: string]: any[] }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});

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

  const handleLikeReview = async (reviewId: string) => {
    if (!user) {
      alert('Please sign in to like reviews');
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!profile) return;

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('review_likes')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', profile.id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('review_likes')
          .delete()
          .eq('id', existingLike.id);
      } else {
        // Like
        await supabase
          .from('review_likes')
          .insert([{
            review_id: reviewId,
            user_id: profile.id
          }]);
      }

      onReviewsUpdate();
    } catch (error) {
      console.error('Error liking review:', error);
    }
  };

  const loadComments = async (reviewId: string) => {
    try {
      const { data } = await supabase
        .from('review_comments')
        .select(`
          *,
          user:users(first_name, last_name)
        `)
        .eq('review_id', reviewId)
        .order('created_at', { ascending: true });

      setReviewComments(prev => ({
        ...prev,
        [reviewId]: data || []
      }));
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleAddComment = async (reviewId: string) => {
    if (!user || !newComment[reviewId]?.trim()) return;

    try {
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!profile) return;

      await supabase
        .from('review_comments')
        .insert([{
          review_id: reviewId,
          user_id: profile.id,
          comment: newComment[reviewId].trim()
        }]);

      setNewComment(prev => ({ ...prev, [reviewId]: '' }));
      loadComments(reviewId);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const toggleComments = (reviewId: string) => {
    if (expandedComments.includes(reviewId)) {
      setExpandedComments(prev => prev.filter(id => id !== reviewId));
    } else {
      setExpandedComments(prev => [...prev, reviewId]);
      if (!reviewComments[reviewId]) {
        loadComments(reviewId);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
        {user && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center">
                  {renderStars(review.rating)}
                </div>
                <span className="font-medium text-gray-900">
                  {review.user?.first_name} {review.user?.last_name}
                </span>
                <span className="text-gray-500 text-sm">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
              <p className="text-gray-700 mb-4">{review.comment}</p>

              {/* Review Actions */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLikeReview(review.id)}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    review.user_has_liked 
                      ? 'text-orange-600' 
                      : 'text-gray-600 hover:text-orange-600'
                  }`}
                >
                  <ThumbsUp className={`h-4 w-4 ${review.user_has_liked ? 'fill-current' : ''}`} />
                  {review.likes_count || 0}
                </button>

                <button
                  onClick={() => toggleComments(review.id)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  {review.comments_count || 0} Comments
                </button>
              </div>

              {/* Comments Section */}
              {expandedComments.includes(review.id) && (
                <div className="mt-4 pl-4 border-l-2 border-gray-200">
                  {reviewComments[review.id]?.map((comment: any) => (
                    <div key={comment.id} className="mb-3 last:mb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">
                          {comment.user?.first_name} {comment.user?.last_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.comment}</p>
                    </div>
                  ))}

                  {/* Add Comment */}
                  {user && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={newComment[review.id] || ''}
                        onChange={(e) => setNewComment(prev => ({
                          ...prev,
                          [review.id]: e.target.value
                        }))}
                        placeholder="Add a comment..."
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(review.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(review.id)}
                        className="px-3 py-2 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 transition-colors"
                      >
                        Post
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No reviews yet. Be the first to review this product!</p>
          {user && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Write the First Review
            </button>
          )}
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm
          productId={productId}
          onClose={() => setShowReviewForm(false)}
          onReviewAdded={onReviewsUpdate}
        />
      )}
    </div>
  );
};

export default ReviewSection;