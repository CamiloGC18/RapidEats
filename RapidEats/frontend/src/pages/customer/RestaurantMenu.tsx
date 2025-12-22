import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { fetchRestaurantBySlug } from '../../store/slices/restaurantSlice'
import { addToCart } from '../../store/slices/cartSlice'
import { Star, Clock, MapPin, Plus } from 'lucide-react'
import { toast } from 'react-toastify'

const RestaurantMenu = () => {
  const { slug } = useParams<{ slug: string }>()
  const dispatch = useAppDispatch()
  const { currentRestaurant, products, loading } = useAppSelector((state) => state.restaurant)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [selectedToppings, setSelectedToppings] = useState<any[]>([])
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (slug) {
      dispatch(fetchRestaurantBySlug(slug))
    }
  }, [dispatch, slug])

  const groupedProducts = products.reduce((acc: any, product) => {
    if (!acc[product.category]) {
      acc[product.category] = []
    }
    acc[product.category].push(product)
    return acc
  }, {})

  const handleAddToCart = () => {
    if (!selectedProduct || !currentRestaurant) return

    const toppingsCost = selectedToppings.reduce((sum, t) => sum + t.price, 0)
    const subtotal = (selectedProduct.price + toppingsCost) * quantity

    dispatch(
      addToCart({
        restaurantId: currentRestaurant._id,
        restaurantName: currentRestaurant.name,
        product: {
          productId: selectedProduct._id,
          name: selectedProduct.name,
          price: selectedProduct.price,
          quantity,
          toppings: selectedToppings,
          subtotal,
          image: selectedProduct.image,
        },
      })
    )

    toast.success('Producto agregado al carrito')
    setSelectedProduct(null)
    setSelectedToppings([])
    setQuantity(1)
  }

  if (loading || !currentRestaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-green"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="h-64 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${currentRestaurant.banner})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="container mx-auto px-4 h-full flex items-end pb-8 relative z-10">
          <div className="flex items-center text-white">
            <img
              src={currentRestaurant.logo}
              alt={currentRestaurant.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white mr-6"
            />
            <div>
              <h1 className="text-4xl font-bold mb-2">{currentRestaurant.name}</h1>
              <p className="text-lg mb-2">{currentRestaurant.description}</p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span>{currentRestaurant.rating}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{currentRestaurant.estimatedDeliveryTime}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{currentRestaurant.zone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {Object.entries(groupedProducts).map(([category, items]: [string, any]) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((product: any) => (
                <div
                  key={product._id}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary-green font-bold text-lg">
                        ${product.price.toLocaleString()}
                      </span>
                      <button className="bg-primary-green text-white p-2 rounded-lg hover:bg-green-600 transition">
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {selectedProduct.image && (
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-64 object-cover"
              />
            )}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
              <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
              <p className="text-primary-green font-bold text-2xl mb-6">
                ${selectedProduct.price.toLocaleString()}
              </p>

              {selectedProduct.hasToppings && selectedProduct.toppings.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Extras</h3>
                  <div className="space-y-2">
                    {selectedProduct.toppings.map((topping: any, index: number) => (
                      <label
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedToppings.some((t) => t.name === topping.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedToppings([...selectedToppings, topping])
                              } else {
                                setSelectedToppings(
                                  selectedToppings.filter((t) => t.name !== topping.name)
                                )
                              }
                            }}
                            className="mr-3"
                          />
                          <span>{topping.name}</span>
                        </div>
                        <span className="font-semibold">+${topping.price.toLocaleString()}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-6">
                <span className="font-semibold">Cantidad</span>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="bg-gray-200 w-10 h-10 rounded-lg font-bold hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="font-bold text-xl w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="bg-gray-200 w-10 h-10 rounded-lg font-bold hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setSelectedProduct(null)
                    setSelectedToppings([])
                    setQuantity(1)
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary-green text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition"
                >
                  Agregar al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RestaurantMenu
