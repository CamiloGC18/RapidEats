import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { fetchRestaurants } from '../../store/slices/restaurantSlice'
import { Star, Clock, MapPin, Search } from 'lucide-react'

const Restaurants = () => {
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { restaurants, loading } = useAppSelector((state) => state.restaurant)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')

  useEffect(() => {
    const params: any = {}
    if (search) params.search = search
    if (category) params.category = category
    dispatch(fetchRestaurants(params))
  }, [dispatch, search, category])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params: any = {}
    if (search) params.search = search
    if (category) params.category = category
    setSearchParams(params)
  }

  const categories = [
    'Todos',
    'Comida Rápida',
    'Asiática',
    'Italiana',
    'Saludable',
    'Mexicana',
    'Postres',
    'Bebidas',
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Restaurantes</h1>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar restaurantes o platillos..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
              />
            </div>
          </form>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat === 'Todos' ? '' : cat)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  (cat === 'Todos' && !category) || category === cat
                    ? 'bg-primary-green text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No se encontraron restaurantes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
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
    </div>
  )
}

export default Restaurants
