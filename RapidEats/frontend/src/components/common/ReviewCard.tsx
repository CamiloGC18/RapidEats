import React, { useState } from 'react';
import { ThumbsUp, MessageCircle } from 'lucide-react';
import StarRating from './StarRating';

interface ReviewCardProps {
  review: any;
  onHelpful?: (reviewId: string) => void;
  currentUserId?: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onHelpful, currentUserId }) => {
  const [showResponse, setShowResponse] = useState(false);
  const isHelpful = review.helpful?.includes(currentUserId);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="border-b border-gray-200 py-6 last:border-0">
      {/* User Info */}
      <div className="flex items-start gap-4">
        <img
          src={review.user?.picture || '/default-avatar.png'}
          alt={review.user?.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold">{review.user?.name}</h4>
            {review.isVerifiedPurchase && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                ✓ Compra verificada
              </span>
            )}
          </div>

          {/* Ratings */}
          <div className="flex items-center gap-4 mb-2">
            <StarRating rating={review.rating} readonly size="sm" />
            <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
          </div>

          {/* Detailed Ratings */}
          {(review.foodRating || review.deliveryRating) && (
            <div className="flex gap-6 mb-3 text-sm">
              {review.foodRating && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Comida:</span>
                  <StarRating rating={review.foodRating} readonly size="sm" />
                </div>
              )}
              {review.deliveryRating && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Entrega:</span>
                  <StarRating rating={review.deliveryRating} readonly size="sm" />
                </div>
              )}
            </div>
          )}

          {/* Comment */}
          {review.comment && (
            <p className="text-gray-700 mb-3">{review.comment}</p>
          )}

          {/* Images */}
          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mb-3">
              {review.images.map((image: string, index: number) => (
                <img
                  key={index}
                  src={image}
                  alt={`Review ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => onHelpful?.(review._id)}
              className={`flex items-center gap-1 ${
                isHelpful ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${isHelpful ? 'fill-current' : ''}`} />
              <span>Útil ({review.helpfulCount || 0})</span>
            </button>

            {review.response && (
              <button
                onClick={() => setShowResponse(!showResponse)}
                className="flex items-center gap-1 text-gray-600 hover:text-green-600"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Ver respuesta</span>
              </button>
            )}
          </div>

          {/* Restaurant Response */}
          {review.response && showResponse && (
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-sm">Respuesta del restaurante</span>
                <span className="text-xs text-gray-500">
                  {formatDate(review.response.date)}
                </span>
              </div>
              <p className="text-sm text-gray-700">{review.response.text}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
