import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { fetchRestaurantBySlug } from '../../store/slices/restaurantSlice'
import { addToCart } from '../../store/slices/cartSlice'
import { addFavorite, removeFavorite, checkFavorite } from '../../store/slices/favoriteSlice'
import { fetchRestaurantReviews, markReviewHelpful } from '../../store/slices/reviewSlice'
import {
  StarIcon,
  ClockIcon,
  MapPinIcon,
  HeartIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { Skeleton } from '../../components/common'
import { MenuItemCard, SearchBar, CategoryFilter, EmptyState } from '../../components/business'
import ReviewCard from '../../components/common/ReviewCard'
import StarRating from '../../components/common/StarRating'
import { useToast } from '../../components/common/Toast'
import { fadeInUpVariants, listContainerVariants } from '../../utils/animations'

const RestaurantMenu = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { currentRestaurant, products, loading } = useAppSelector((state) => state.restaurant)
  const { reviews, stats } = useAppSelector((state) => state.review)
  const { user } = useAppSelector((state) => state.auth)
  const { items: cartItems } = useAppSelector((state) => state.cart)
  const { toast } = useToast()

  const [isFavorite, setIsFavorite] = useState(false)
  const [showReviews, setShowReviews] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isHeaderSticky, setIsHeaderSticky] = useState(false)

  const headerRef = useRef<HTMLDivElement>(null)
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Fetch restaurant data
  useEffect(() => {
    if (slug) {
      dispatch(fetchRestaurantBySlug(slug))
    }
  }, [dispatch, slug])

  // Check if restaurant is favorite
  useEffect(() => {
    if (currentRestaurant && user) {
      dispatch(checkFavorite(currentRestaurant._id)).then((result: any) => {
        if (result.payload) {
          setIsFavorite(result.payload.isFavorite)
        }
      })
    }
  }, [currentRestaurant, user, dispatch])

  // Fetch reviews when showing
  useEffect(() => {
    if (currentRestaurant && showReviews) {
      dispatch(fetchRestaurantReviews({ restaurantId: currentRestaurant._id, page: 1, limit: 10 }))
    }
  }, [currentRestaurant, showReviews, dispatch])

  // Set initial active category
  useEffect(() => {
    if (products.length > 0 && !activeCategory) {
      const categories = getCategories()
      if (categories.length > 0) {
        setActiveCategory(categories[0].name)
      }
    }
  }, [products, activeCategory])

  // Scroll spy for categories
  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return

      const headerBottom = headerRef.current.getBoundingClientRect().bottom
      setIsHeaderSticky(headerBottom <= 0)

      // Update active category based on scroll position
      const categories = getCategories()
      for (const category of categories) {
        const element = categoryRefs.current[category.name]
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveCategory(category.name)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [products])

  // Toggle favorite
  const handleToggleFavorite = async () => {
    if (!user) {
      toast.info('Inicia sesión para agregar favoritos')
      return
    }

    if (!currentRestaurant) return

    try {
      if (isFavorite) {
        await dispatch(removeFavorite(currentRestaurant._id)).unwrap()
        toast.success('Eliminado de favoritos')
        setIsFavorite(false)
      } else {
        await dispatch(addFavorite({ restaurantId: currentRestaurant._id })).unwrap()
        toast.success('Agregado a favoritos')
        setIsFavorite(true)
      }
    } catch (error: any) {
      toast.error(error || 'Error al actualizar favoritos')
    }
  }

  // Mark review as helpful
  const handleMarkHelpful = (reviewId: string) => {
    if (!user) {
      toast.info('Inicia sesión para calificar reseñas')
      return
    }
    dispatch(markReviewHelpful(reviewId))
  }

  // Get categories with product count
  const getCategories = () => {
    const categoryMap = products.reduce((acc: any, product) => {
      if (!acc[product.category]) {
        acc[product.category] = 0
      }
      acc[product.category]++
      return acc
    }, {})

    return Object.entries(categoryMap).map(([name, count]) => ({ name, count }))
  }

  // Group products by category
  const groupedProducts = products.reduce((acc: any, product) => {
    if (!acc[product.category]) {
      acc[product.category] = []
    }
    acc[product.category].push(product)
    return acc
  }, {})

  // Filter products by search query
  const getFilteredProducts = () => {
    if (!searchQuery.trim()) return groupedProducts

    const filtered: any = {}
    Object.entries(groupedProducts).forEach(([category, items]: [string, any]) => {
      const matchingItems = items.filter((product: any) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      if (matchingItems.length > 0) {
        filtered[category] = matchingItems
      }
    })
    return filtered
  }

  // Scroll to category
  const scrollToCategory = (categoryName: string) => {
    const element = categoryRefs.current[categoryName]
    if (element) {
      const offset = 180 // Header + category filter height
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' })
      setActiveCategory(categoryName)
    }
  }

  // Handle add to cart from modal
  const handleAddToCart = (product: any, quantity: number, options: any[]) => {
    if (!currentRestaurant) return

    const toppingsCost = options.reduce((sum, t) => sum + t.price, 0)
    const subtotal = (product.price + toppingsCost) * quantity

    dispatch(
      addToCart({
        restaurantId: currentRestaurant._id,
        restaurantName: currentRestaurant.name,
        product: {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity,
          toppings: options,
          subtotal,
          image: product.image,
        },
      })
    )

    toast.success('Producto agregado al carrito')
  }

  // Calculate cart totals
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.subtotal || 0), 0)
  const cartItemsCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)

  // Loading state
  if (loading || !currentRestaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="relative h-80">
          <Skeleton variant="rectangle" className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-container pb-8">
            <div className="flex items-end justify-between max-w-7xl mx-auto">
              <div className="flex items-end gap-6">
                <Skeleton variant="circle" className="w-28 h-28" />
                <div className="space-y-3 mb-2">
                  <Skeleton variant="text" className="w-64 h-8" />
                  <Skeleton variant="text" className="w-96 h-5" />
                  <Skeleton variant="text" className="w-80 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="px-container py-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6 space-y-4">
                <Skeleton variant="rectangle" className="w-full h-48" />
                <Skeleton variant="text" className="w-3/4 h-6" />
                <Skeleton variant="text" className="w-full h-4" />
                <Skeleton variant="text" className="w-1/2 h-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const filteredProducts = getFilteredProducts()
  const hasResults = Object.keys(filteredProducts).length > 0
  const categories = getCategories()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header with Restaurant Info */}
      <div ref={headerRef} className="relative h-80">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${currentRestaurant.banner})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Content */}
        <div className="relative h-full px-container">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            {/* Back Button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate(-1)}
              className="mt-6 flex items-center gap-2 text-white/90 hover:text-white transition-colors w-fit"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Atrás</span>
            </motion.button>

            {/* Restaurant Info */}
            <div className="flex-1 flex items-end pb-8">
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between w-full gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-end gap-6"
                >
                  {/* Logo */}
                  <div className="relative">
                    <img
                      src={currentRestaurant.logo}
                      alt={currentRestaurant.name}
                      className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-4 border-white shadow-xl"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                      {currentRestaurant.name}
                    </h1>
                    <p className="text-white/90 text-base md:text-lg mb-3 max-w-2xl">
                      {currentRestaurant.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
                      {/* Rating */}
                      <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold">{currentRestaurant.rating}</span>
                      </div>

                      {/* Delivery Time */}
                      <div className="flex items-center gap-1.5">
                        <ClockIcon className="w-4 h-4" />
                        <span>{currentRestaurant.estimatedDeliveryTime}</span>
                      </div>

                      {/* Zone */}
                      <div className="flex items-center gap-1.5">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{currentRestaurant.zone}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Favorite Button */}
                {user && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    onClick={handleToggleFavorite}
                    className="glass-effect p-4 rounded-2xl hover:bg-white/20 transition-all duration-200"
                    title={isFavorite ? 'Eliminar de favoritos' : 'Agregar a favoritos'}
                  >
                    {isFavorite ? (
                      <HeartSolidIcon className="w-6 h-6 text-red-500" />
                    ) : (
                      <HeartIcon className="w-6 h-6 text-white" />
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Search & Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isHeaderSticky ? 'bg-white shadow-md' : 'bg-white'
        }`}
      >
        <div className="px-container py-4">
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Search Bar */}
            <div className="max-w-2xl">
              <SearchBar
                placeholder="Buscar productos..."
                onSearch={(query) => setSearchQuery(query)}
              />
            </div>

            {/* Category Filter */}
            {categories.length > 1 && (
              <CategoryFilter
                categories={categories.map((cat, idx) => ({ id: idx.toString(), name: cat.name, count: cat.count as number }))}
                activeCategory={activeCategory}
                onCategoryChange={scrollToCategory}
              />
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="px-container py-8">
        <div className="max-w-7xl mx-auto">
          {/* Reviews Section */}
          {stats && stats.count > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Reseñas</h2>
                <button
                  onClick={() => setShowReviews(!showReviews)}
                  className="text-primary font-medium hover:text-primary-dark transition-colors"
                >
                  {showReviews ? 'Ocultar' : `Ver todas (${stats.count})`}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                {/* Rating Summary */}
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl font-bold text-gray-900">
                      {stats.average.toFixed(1)}
                    </div>
                    <div>
                      <StarRating rating={stats.average} readonly size="md" />
                      <p className="text-sm text-gray-600 mt-1">
                        {stats.count} {stats.count === 1 ? 'reseña' : 'reseñas'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = stats.distribution[rating] || 0
                    const percentage = stats.count > 0 ? (count / stats.count) * 100 : 0
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-3">{rating}</span>
                        <StarIcon className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.6, delay: rating * 0.1 }}
                            className="h-full bg-yellow-400 rounded-full"
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Reviews List */}
              <AnimatePresence>
                {showReviews && reviews.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t pt-6 space-y-4"
                  >
                    {reviews.map((review) => (
                      <ReviewCard
                        key={review._id}
                        review={review}
                        onHelpful={handleMarkHelpful}
                        currentUserId={user?.id || ''}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Products Section */}
          {hasResults ? (
            <motion.div variants={listContainerVariants} initial="initial" animate="animate">
              {Object.entries(filteredProducts).map(([category, items]: [string, any]) => (
                <div
                  key={category}
                  ref={(el) => (categoryRefs.current[category] = el)}
                  className="mb-12 last:mb-0"
                >
                  <motion.h2
                    variants={fadeInUpVariants}
                    className="text-2xl font-bold text-gray-900 mb-6"
                  >
                    {category}
                  </motion.h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((product: any) => (
                      <MenuItemCard
                        key={product._id}
                        item={{
                          _id: product._id,
                          name: product.name,
                          description: product.description,
                          price: product.price,
                          image: product.image,
                          category: product.category,
                          isAvailable: product.isAvailable,
                          options: product.hasToppings
                            ? product.toppings.map((t: any) => ({
                                id: t.name,
                                name: t.name,
                                price: t.price,
                              }))
                            : [],
                        }}
                        onAddToCart={(_item: any, selectedOptions: any, quantity?: number) => {
                          handleAddToCart(
                            product,
                            quantity || 1,
                            selectedOptions || []
                          )
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <EmptyState
              variant="search"
              title="No se encontraron productos"
              description={`No hay productos que coincidan con "${searchQuery}"`}
              action={{
                label: "Limpiar búsqueda",
                onClick: () => setSearchQuery('')
              }}
            />
          )}
        </div>
      </div>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cartItemsCount > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            onClick={() => navigate('/checkout')}
            className="fixed bottom-6 right-6 z-50 bg-primary text-white px-6 py-4 rounded-2xl shadow-2xl hover:bg-primary-dark transition-all duration-200 flex items-center gap-3 group"
          >
            <div className="relative">
              <ShoppingBagIcon className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-white text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemsCount}
              </span>
            </div>
            <div className="text-left">
              <div className="text-sm font-medium opacity-90">Ver carrito</div>
              <div className="text-lg font-bold">${cartTotal.toLocaleString()}</div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RestaurantMenu
