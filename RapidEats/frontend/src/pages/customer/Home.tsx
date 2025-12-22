import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { fetchRestaurants } from '../../store/slices/restaurantSlice'
import { Star, Clock, MapPin } from 'lucide-react'

const Home = () => {
  const dispatch = useAppDispatch()
  const { restaurants, loading } = useAppSelector((state) => state.restaurant)

  useEffect(() => {
    dispatch(fetchRestaurants({ featured: true }))
  }, [dispatch])

  const categories = [
    { name: 'Comida Rápida', icon: '🍔' },
    { name: 'Asiática', icon: '🍜' },
    { name: 'Italiana', icon: '🍕' },
    { name: 'Saludable', icon: '🥗' },
    { name: 'Mexicana', icon: '🌮' },
    { name: 'Postres', icon: '🍰' },
  ]

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-r from-black to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fadeIn">
              Tu comida favorita,
              <span className="text-primary-green"> en minutos</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 animate-slideUp">
              Descubre los mejores restaurantes y disfruta de delivery rápido y confiable
            </p>
            <Link
              to="/restaurants"
              className="inline-block bg-primary-green text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-600 transition transform hover:scale-105"
            >
              Explorar Restaurantes
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Categorías</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/restaurants?category=${encodeURIComponent(category.name)}`}
                className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition transform hover:scale-105"
              >
                <div className="text-4xl mb-2">{category.icon}</div>
                <div className="font-semibold text-gray-800">{category.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Restaurantes Destacados</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.slice(0, 6).map((restaurant) => (
                <Link
                  key={restaurant._id}
                  to={`/restaurant/${restaurant.slug}`}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition transform hover:scale-105"
                >
                  <div className="relative h-48">
                    <img
                      src={restaurant.banner || restaurant.logo}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                    {restaurant.isFeatured && (
                      <span className="absolute top-2 right-2 bg-primary-green text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Destacado
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center mb-2">
                      <img
                        src={restaurant.logo}
                        alt={restaurant.name}
                        className="w-12 h-12 rounded-full object-cover mr-3"
                      />
                      <div>
                        <h3 className="font-bold text-lg">{restaurant.name}</h3>
                        <p className="text-sm text-gray-500">{restaurant.category}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {restaurant.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span>{restaurant.rating}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{restaurant.estimatedDeliveryTime}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{restaurant.zone}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
