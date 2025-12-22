import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { fetchRestaurants } from '../../store/slices/restaurantSlice'
import RestaurantCard, { RestaurantCardSkeleton } from '../../components/business/RestaurantCard'
import Button from '../../components/common/Button'
import {
  pageVariants,
  listContainerVariants,
  listItemVariants,
  fadeInUpVariants,
} from '../../utils/animations'

const Home = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { restaurants, loading } = useAppSelector((state) => state.restaurant)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    dispatch(fetchRestaurants({ featured: true }))
  }, [dispatch])

  const categories = [
    { name: 'Pizza', icon: '🍕', slug: 'pizza' },
    { name: 'Hamburguesas', icon: '🍔', slug: 'burgers' },
    { name: 'Sushi', icon: '🍱', slug: 'sushi' },
    { name: 'Asiática', icon: '🍜', slug: 'asian' },
    { name: 'Saludable', icon: '🥗', slug: 'healthy' },
    { name: 'Mexicana', icon: '🌮', slug: 'mexican' },
    { name: 'Italiana', icon: '🍝', slug: 'italian' },
    { name: 'Postres', icon: '🍰', slug: 'desserts' },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <motion.div
      className="min-h-screen bg-white"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="container relative z-10 py-20 md:py-32">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              Comida deliciosa,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--rapid-green)] to-green-400">
                entregada rápido
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Miles de restaurantes, un solo lugar. Ordena ahora y recibe en minutos.
            </p>

            {/* Search Bar */}
            <motion.form
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar restaurantes, platos o categorías..."
                  className="w-full px-6 py-5 pl-14 pr-32 rounded-2xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-[var(--rapid-green)]/30 shadow-2xl"
                />
                <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  Buscar
                </Button>
              </div>
            </motion.form>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/restaurants')}
                className="border-white text-white hover:bg-white hover:text-gray-900"
              >
                Explorar todos los restaurantes
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-12 text-center"
            variants={fadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Explora por categoría
          </motion.h2>

          <motion.div
            className="overflow-x-auto scrollbar-hide -mx-4 px-4"
            variants={listContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="flex gap-4 pb-4 min-w-max md:grid md:grid-cols-4 lg:grid-cols-8 md:min-w-0">
              {categories.map((category, index) => (
                <motion.div
                  key={category.slug}
                  variants={listItemVariants}
                  custom={index}
                >
                  <Link
                    to={`/restaurants?category=${category.slug}`}
                    className="flex flex-col items-center justify-center w-24 h-24 md:w-auto md:h-32 bg-gray-50 rounded-2xl hover:bg-gray-100 hover:shadow-lg transition-all duration-250 hover:-translate-y-1"
                  >
                    <span className="text-4xl mb-2">{category.icon}</span>
                    <span className="text-sm font-semibold text-gray-800 text-center px-2">
                      {category.name}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Restaurants Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <motion.h2
              className="text-3xl md:text-4xl font-bold"
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              Restaurantes destacados
            </motion.h2>
            <Link
              to="/restaurants"
              className="text-[var(--rapid-green)] font-semibold hover:text-[var(--rapid-green-hover)] transition-colors hidden md:block"
            >
              Ver todos →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <RestaurantCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={listContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
            >
              {restaurants.slice(0, 6).map((restaurant, index) => (
                <motion.div key={restaurant._id} variants={listItemVariants} custom={index}>
                  <RestaurantCard restaurant={restaurant} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Mobile View All Button */}
          <div className="text-center mt-8 md:hidden">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/restaurants')}
              fullWidth
            >
              Ver todos los restaurantes
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-16 text-center"
            variants={fadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            ¿Cómo funciona?
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
            variants={listContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                number: '1',
                title: 'Elige tu restaurante',
                description: 'Explora cientos de opciones y encuentra tu comida favorita',
                icon: '🔍',
              },
              {
                number: '2',
                title: 'Realiza tu pedido',
                description: 'Selecciona tus platos y personalízalos a tu gusto',
                icon: '🛒',
              },
              {
                number: '3',
                title: 'Recibe en minutos',
                description: 'Sigue tu pedido en tiempo real y disfruta',
                icon: '🚀',
              },
            ].map((step, index) => (
              <motion.div
                key={step.number}
                className="text-center"
                variants={listItemVariants}
                custom={index}
              >
                <motion.div
                  className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--rapid-green)] text-white text-3xl font-bold mb-6 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {step.icon}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gray-900 text-white text-sm flex items-center justify-center font-bold">
                    {step.number}
                  </div>
                </motion.div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Final Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-[var(--rapid-green)] to-green-500 text-white">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              ¿Listo para ordenar?
            </h2>
            <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-2xl mx-auto">
              Únete a miles de usuarios que ya disfrutan de la mejor comida
            </p>
            <Button
              variant="secondary"
              size="xl"
              onClick={() => navigate('/restaurants')}
            >
              Comenzar ahora
            </Button>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}

export default Home
