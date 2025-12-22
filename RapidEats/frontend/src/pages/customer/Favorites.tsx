import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, Clock, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchFavorites, removeFavorite } from '../../store/slices/favoriteSlice';
import { toast } from 'react-toastify';

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { favorites, loading } = useAppSelector((state) => state.favorite);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchFavorites());
    }
  }, [dispatch, user]);

  const handleRemoveFavorite = async (restaurantId: string) => {
    try {
      await dispatch(removeFavorite(restaurantId)).unwrap();
      toast.success('Restaurante eliminado de favoritos');
    } catch (error: any) {
      toast.error(error || 'Error al eliminar favorito');
    }
  };

  const handleRestaurantClick = (slug: string) => {
    navigate(`/restaurant/${slug}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-red-500 fill-red-500" />
        <h1 className="text-3xl font-bold">Mis Favoritos</h1>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            No tienes favoritos aún
          </h2>
          <p className="text-gray-500 mb-6">
            Guarda tus restaurantes favoritos para encontrarlos fácilmente
          </p>
          <button
            onClick={() => navigate('/restaurants')}
            className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600"
          >
            Explorar Restaurantes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <div
              key={favorite._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Restaurant Image */}
              <div
                className="relative h-48 cursor-pointer"
                onClick={() => handleRestaurantClick(favorite.restaurant.slug)}
              >
                <img
                  src={favorite.restaurant.logo || '/restaurant-placeholder.jpg'}
                  alt={favorite.restaurant.name}
                  className="w-full h-full object-cover"
                />
                {!favorite.restaurant.isActive && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Cerrado
                    </span>
                  </div>
                )}
              </div>

              {/* Restaurant Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3
                    className="font-bold text-lg cursor-pointer hover:text-green-600"
                    onClick={() => handleRestaurantClick(favorite.restaurant.slug)}
                  >
                    {favorite.restaurant.name}
                  </h3>
                  <button
                    onClick={() => handleRemoveFavorite(favorite.restaurant._id)}
                    className="text-red-500 hover:text-red-600"
                    title="Eliminar de favoritos"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-3">{favorite.restaurant.category}</p>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{favorite.restaurant.ratings.average.toFixed(1)}</span>
                    <span className="text-gray-400">
                      ({favorite.restaurant.ratings.count})
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{favorite.restaurant.estimatedDeliveryTime}</span>
                  </div>
                </div>

                {favorite.notes && (
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 mb-3">
                    <span className="font-medium">Nota: </span>
                    {favorite.notes}
                  </div>
                )}

                <button
                  onClick={() => handleRestaurantClick(favorite.restaurant.slug)}
                  className="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
                  disabled={!favorite.restaurant.isActive}
                >
                  {favorite.restaurant.isActive ? 'Ver Menú' : 'Cerrado'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
