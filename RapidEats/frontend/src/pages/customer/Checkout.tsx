import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import { clearCart } from '../../store/slices/cartSlice'
import { createOrder } from '../../store/slices/orderSlice'
import {
  MapPinIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ShoppingBagIcon,
  ClockIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Button, Input, Card } from '../../components/common'
import { CartItem, EmptyState } from '../../components/business'
import { useToast } from '../../components/common/Toast'
import { fadeInUpVariants, slideInFromRight } from '../../utils/animations'

interface CheckoutStep {
  id: number
  title: string
  description: string
  icon: any
}

const steps: CheckoutStep[] = [
  {
    id: 1,
    title: 'Entrega',
    description: 'Dirección y detalles',
    icon: MapPinIcon,
  },
  {
    id: 2,
    title: 'Pago',
    description: 'Método de pago',
    icon: CreditCardIcon,
  },
  {
    id: 3,
    title: 'Confirmar',
    description: 'Revisar pedido',
    icon: CheckCircleIcon,
  },
]

const Checkout = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items: cartItems } = useAppSelector((state) => state.cart)
  const { user } = useAppSelector((state) => state.auth)
  const { toast } = useToast()

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delivery form
  const [deliveryData, setDeliveryData] = useState({
    address: '',
    addressDetails: '',
    phone: '',
    notes: '',
  })

  // Payment form
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card')
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  })

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && currentStep === 1) {
      toast.info('Tu carrito está vacío')
      navigate('/restaurants')
    }
  }, [cartItems, currentStep, navigate, toast])

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast.info('Inicia sesión para continuar')
      navigate('/login')
    }
  }, [user, navigate, toast])

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.subtotal || 0), 0)
  const deliveryFee = subtotal > 0 ? 5000 : 0
  const serviceFee = Math.round(subtotal * 0.1)
  const total = subtotal + deliveryFee + serviceFee

  // Validate step
  const canProceed = () => {
    if (currentStep === 1) {
      return deliveryData.address && deliveryData.phone
    }
    if (currentStep === 2) {
      if (paymentMethod === 'cash') return true
      return (
        cardData.cardNumber &&
        cardData.cardName &&
        cardData.expiryDate &&
        cardData.cvv
      )
    }
    return true
  }

  // Handle next step
  const handleNext = () => {
    if (!canProceed()) {
      toast.warning('Por favor completa todos los campos requeridos')
      return
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!canProceed()) {
      toast.warning('Por favor completa todos los campos requeridos')
      return
    }

    setIsSubmitting(true)

    try {
      // Get restaurant ID from cart items
      const restaurantId = cartItems[0]?.restaurantId

      if (!restaurantId) {
        throw new Error('No se encontró el restaurante')
      }

      const orderData = {
        restaurant: restaurantId,
        items: cartItems.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
          toppings: item.toppings || [],
          price: item.price,
        })),
        deliveryAddress: {
          street: deliveryData.address,
          details: deliveryData.addressDetails,
          coordinates: { lat: 0, lng: 0 }, // TODO: Get from maps API
        },
        phone: deliveryData.phone,
        paymentMethod,
        notes: deliveryData.notes,
        subtotal,
        deliveryFee,
        serviceFee,
        total,
      }

      await dispatch(createOrder(orderData)).unwrap()

      // Clear cart
      dispatch(clearCart())

      toast.success('¡Pedido realizado con éxito!')

      // Redirect to orders
      navigate('/orders')
    } catch (error: any) {
      toast.error(error?.message || 'Error al realizar el pedido')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-container py-12">
        <EmptyState
          variant="cart"
          title="Tu carrito está vacío"
          description="Agrega productos de tus restaurantes favoritos"
          action={{
            label: 'Explorar restaurantes',
            onClick: () => navigate('/restaurants'),
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="px-container">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Volver</span>
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Finalizar Pedido</h1>
          </motion.div>

          {/* Stepper */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 -z-10">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Steps */}
              {steps.map((step) => {
                const isActive = step.id === currentStep
                const isCompleted = step.id < currentStep
                const Icon = step.icon

                return (
                  <div key={step.id} className="flex flex-col items-center relative">
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        backgroundColor: isCompleted || isActive ? '#06C167' : '#E5E7EB',
                      }}
                      className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center ${
                        isCompleted || isActive ? 'text-white' : 'text-gray-400'
                      } ${isActive ? 'ring-4 ring-primary/20' : ''}`}
                    >
                      <Icon className="w-6 h-6 md:w-8 md:h-8" />
                    </motion.div>
                    <div className="absolute top-full mt-3 text-center hidden md:block">
                      <p
                        className={`text-sm font-semibold ${
                          isActive ? 'text-primary' : 'text-gray-600'
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Mobile Step Title */}
            <div className="md:hidden text-center mt-4">
              <p className="text-lg font-semibold text-primary">
                {steps[currentStep - 1].title}
              </p>
              <p className="text-sm text-gray-600">{steps[currentStep - 1].description}</p>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {/* Step 1: Delivery */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-6 md:p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Información de Entrega
                      </h2>

                      <div className="space-y-6">
                        <Input
                          label="Dirección de entrega"
                          placeholder="Ej: Calle 123 #45-67"
                          value={deliveryData.address}
                          onChange={(e) =>
                            setDeliveryData({ ...deliveryData, address: e.target.value })
                          }
                          required
                          leftIcon={<MapPinIcon className="w-5 h-5" />}
                        />

                        <Input
                          label="Detalles adicionales"
                          placeholder="Apartamento, Torre, Piso, etc."
                          value={deliveryData.addressDetails}
                          onChange={(e) =>
                            setDeliveryData({ ...deliveryData, addressDetails: e.target.value })
                          }
                        />

                        <Input
                          label="Teléfono de contacto"
                          type="tel"
                          placeholder="+57 300 123 4567"
                          value={deliveryData.phone}
                          onChange={(e) =>
                            setDeliveryData({ ...deliveryData, phone: e.target.value })
                          }
                          required
                        />

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notas para el restaurante
                          </label>
                          <textarea
                            value={deliveryData.notes}
                            onChange={(e) =>
                              setDeliveryData({ ...deliveryData, notes: e.target.value })
                            }
                            placeholder="Instrucciones especiales, alergias, etc."
                            rows={4}
                            className="input-base w-full resize-none"
                          />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* Step 2: Payment */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-6 md:p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Método de Pago</h2>

                      <div className="space-y-6">
                        {/* Payment Method Selection */}
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => setPaymentMethod('card')}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              paymentMethod === 'card'
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <CreditCardIcon className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                            <p className="text-sm font-semibold">Tarjeta</p>
                          </button>

                          <button
                            onClick={() => setPaymentMethod('cash')}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              paymentMethod === 'cash'
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-2xl mb-2">💵</div>
                            <p className="text-sm font-semibold">Efectivo</p>
                          </button>
                        </div>

                        {/* Card Form */}
                        {paymentMethod === 'card' && (
                          <motion.div
                            variants={fadeInUpVariants}
                            initial="initial"
                            animate="animate"
                            className="space-y-4"
                          >
                            <Input
                              label="Número de tarjeta"
                              placeholder="1234 5678 9012 3456"
                              value={cardData.cardNumber}
                              onChange={(e) =>
                                setCardData({ ...cardData, cardNumber: e.target.value })
                              }
                              required
                              leftIcon={<CreditCardIcon className="w-5 h-5" />}
                            />

                            <Input
                              label="Nombre en la tarjeta"
                              placeholder="NOMBRE APELLIDO"
                              value={cardData.cardName}
                              onChange={(e) =>
                                setCardData({ ...cardData, cardName: e.target.value })
                              }
                              required
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <Input
                                label="Fecha de vencimiento"
                                placeholder="MM/YY"
                                value={cardData.expiryDate}
                                onChange={(e) =>
                                  setCardData({ ...cardData, expiryDate: e.target.value })
                                }
                                required
                              />

                              <Input
                                label="CVV"
                                placeholder="123"
                                type="password"
                                maxLength={4}
                                value={cardData.cvv}
                                onChange={(e) =>
                                  setCardData({ ...cardData, cvv: e.target.value })
                                }
                                required
                              />
                            </div>
                          </motion.div>
                        )}

                        {/* Cash Instructions */}
                        {paymentMethod === 'cash' && (
                          <motion.div
                            variants={fadeInUpVariants}
                            initial="initial"
                            animate="animate"
                            className="p-4 bg-blue-50 border border-blue-200 rounded-xl"
                          >
                            <p className="text-sm text-blue-900">
                              💡 Prepara el monto exacto o dile al repartidor con cuánto vas a
                              pagar. El pago en efectivo se realiza al momento de la entrega.
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* Step 3: Confirm */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-6">
                      {/* Delivery Info */}
                      <Card className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Información de Entrega
                          </h3>
                          <button
                            onClick={() => setCurrentStep(1)}
                            className="text-primary hover:text-primary-dark text-sm font-medium"
                          >
                            Editar
                          </button>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-start gap-2">
                            <MapPinIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {deliveryData.address}
                              </p>
                              {deliveryData.addressDetails && (
                                <p className="text-gray-600">{deliveryData.addressDetails}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">📱</span>
                            <p className="text-gray-900">{deliveryData.phone}</p>
                          </div>
                          {deliveryData.notes && (
                            <div className="flex items-start gap-2">
                              <span className="text-2xl flex-shrink-0">📝</span>
                              <p className="text-gray-600">{deliveryData.notes}</p>
                            </div>
                          )}
                        </div>
                      </Card>

                      {/* Payment Info */}
                      <Card className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Método de Pago</h3>
                          <button
                            onClick={() => setCurrentStep(2)}
                            className="text-primary hover:text-primary-dark text-sm font-medium"
                          >
                            Editar
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          {paymentMethod === 'card' ? (
                            <>
                              <CreditCardIcon className="w-6 h-6 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">Tarjeta de crédito</p>
                                <p className="text-sm text-gray-600">
                                  •••• {cardData.cardNumber.slice(-4)}
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <span className="text-2xl">💵</span>
                              <div>
                                <p className="font-medium text-gray-900">Efectivo</p>
                                <p className="text-sm text-gray-600">Pago contra entrega</p>
                              </div>
                            </>
                          )}
                        </div>
                      </Card>

                      {/* Order Items */}
                      <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Productos ({cartItems.length})
                        </h3>
                        <div className="space-y-4">
                          {cartItems.map((item) => (
                            <CartItem key={`${item.productId}-${Date.now()}`} item={item} />
                          ))}
                        </div>
                      </Card>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <motion.div
                variants={fadeInUpVariants}
                initial="initial"
                animate="animate"
                className="flex gap-4 mt-6"
              >
                {currentStep > 1 && (
                  <Button variant="outline" size="lg" onClick={handlePrevious} className="flex-1">
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>Anterior</span>
                  </Button>
                )}

                {currentStep < 3 ? (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="flex-1"
                  >
                    <span>Continuar</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handlePlaceOrder}
                    loading={isSubmitting}
                    disabled={!canProceed() || isSubmitting}
                    className="flex-1"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Realizar Pedido</span>
                  </Button>
                )}
              </motion.div>
            </div>

            {/* Right Column - Order Summary (Sticky) */}
            <div className="lg:col-span-1">
              <motion.div
                variants={slideInFromRight}
                initial="initial"
                animate="animate"
                className="sticky top-24"
              >
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Resumen del Pedido</h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold text-gray-900">
                        ${subtotal.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Domicilio</span>
                      <span className="font-semibold text-gray-900">
                        ${deliveryFee.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tarifa de servicio</span>
                      <span className="font-semibold text-gray-900">
                        ${serviceFee.toLocaleString()}
                      </span>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-primary">
                          ${total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Estimated Time */}
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                    <ClockIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-900">
                        Tiempo estimado de entrega
                      </p>
                      <p className="text-lg font-bold text-green-700">30-45 min</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
