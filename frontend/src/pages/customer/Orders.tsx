import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Star, RotateCcw, Eye } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchUserOrders } from '../../store/slices/orderSlice';
import { createReview } from '../../store/slices/reviewSlice';
import { addToCart, clearCart } from '../../store/slices/cartSlice';
import ReviewModal from '../../components/common/ReviewModal';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { orders, loading } = useAppSelector((state) => state.order);
  const { user } = useAppSelector((state) => state.auth);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserOrders({}));
    }
  }, [dispatch, user]);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending_confirmation: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      on_the_way: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      pending_confirmation: 'Pendiente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      on_the_way: 'En camino',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };
    return texts[status] || status;
  };

  const handleReview = (order: any) => {
    setSelectedOrder(order);
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (reviewData: any) => {
    await dispatch(createReview(reviewData)).unwrap();
    dispatch(fetchUserOrders({})); // Refresh orders
  };

  const handleReorder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/orders/${orderId}/reorder`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { restaurant, items, unavailableItems } = response.data.data;

      // Clear current cart
      dispatch(clearCart());

      // Add items to cart
      items.forEach((item: any) => {
        dispatch(addToCart({
          ...item,
          restaurant: restaurant._id,
        }));
      });

      if (unavailableItems.length > 0) {
        toast.warning(response.data.message);
      } else {
        toast.success('Productos agregados al carrito');
      }

      // Navigate to restaurant menu
      navigate(`/restaurant/${restaurant.slug}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al reordenar');
    }
  };

  const canReview = (order: any) => {
    return (order.status === 'delivered' || order.status === 'completed') && !order.review;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Package className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold">Mis Pedidos</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No tienes pedidos aún
            </h2>
            <p className="text-gray-500 mb-6">
              ¿Listo para hacer tu primer pedido?
            </p>
            <button
              onClick={() => navigate('/restaurants')}
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600"
            >
              Explorar Restaurantes
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">
                        Pedido #{order.orderNumber}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      ${order.pricing.total.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Restaurant Info */}
                <div className="mb-4">
                  <p className="font-semibold">{order.restaurantId?.name}</p>
                  <p className="text-sm text-gray-600">
                    {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate(`/orders/${order._id}/tracking`)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Detalles
                  </button>

                  {canReview(order) && (
                    <button
                      onClick={() => handleReview(order)}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                    >
                      <Star className="w-4 h-4" />
                      Calificar
                    </button>
                  )}

                  {order.status === 'delivered' && (
                    <button
                      onClick={() => handleReorder(order._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Volver a Pedir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedOrder && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
};

export default Orders;
