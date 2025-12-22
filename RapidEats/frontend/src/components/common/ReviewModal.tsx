import React, { useState } from 'react';
import { X, Upload, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import StarRating from '../common/StarRating';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onSubmit: (reviewData: any) => Promise<void>;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, order, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [foodRating, setFoodRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating) {
      toast.error('Por favor califica tu experiencia');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        restaurantId: order.restaurantId._id || order.restaurantId,
        orderId: order._id,
        rating,
        foodRating,
        deliveryRating,
        comment,
        images,
      });

      toast.success('¡Gracias por tu reseña!');
      onClose();
      
      // Reset form
      setRating(5);
      setFoodRating(5);
      setDeliveryRating(5);
      setComment('');
      setImages([]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al enviar la reseña');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Califica tu pedido</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Pedido #{order.orderNumber}</p>
            <p className="font-semibold">{order.restaurantId?.name || 'Restaurante'}</p>
          </div>

          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calificación general *
            </label>
            <StarRating rating={rating} setRating={setRating} size="lg" />
          </div>

          {/* Food Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calidad de la comida
            </label>
            <StarRating rating={foodRating} setRating={setFoodRating} size="md" />
          </div>

          {/* Delivery Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Servicio de entrega
            </label>
            <StarRating rating={deliveryRating} setRating={setDeliveryRating} size="md" />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuéntanos sobre tu experiencia
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="¿Qué te gustó? ¿Qué podríamos mejorar?"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/1000 caracteres
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !rating}
              className="flex-1 bg-green-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar reseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
