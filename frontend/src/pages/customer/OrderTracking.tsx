import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { fetchOrderById } from '../../store/slices/orderSlice'
import {
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  CheckCircleIcon,
  TruckIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import { Card, Badge, Button, Skeleton } from '../../components/common'
import { OrderCard } from '../../components/business'
import { useToast } from '../../components/common/Toast'
import { fadeInUpVariants, listContainerVariants, listItemVariants } from '../../utils/animations'

interface OrderStatus {
  id: string
  label: string
  description: string
  icon: any
  time?: string
}

const orderStatusSteps: OrderStatus[] = [
  {
    id: 'pending',
    label: 'Pedido Confirmado',
    description: 'El restaurante recibió tu pedido',
    icon: ShoppingBagIcon,
  },
  {
    id: 'preparing',
    label: 'Preparando',
    description: 'El restaurante está preparando tu pedido',
    icon: ClockIcon,
  },
  {
    id: 'ready',
    label: 'Listo para entregar',
    description: 'Tu pedido está listo',
    icon: CheckCircleIcon,
  },
  {
    id: 'on-delivery',
    label: 'En camino',
    description: 'El repartidor va hacia ti',
    icon: TruckIcon,
  },
  {
    id: 'delivered',
    label: 'Entregado',
    description: '¡Disfruta tu pedido!',
    icon: CheckCircleSolidIcon,
  },
]

const OrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { currentOrder, loading } = useAppSelector((state) => state.order)
  const { toast } = useToast()

  const [currentStatusIndex, setCurrentStatusIndex] = useState(0)

  // Fetch order data
  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId))
    }
  }, [orderId, dispatch])

  // Update status index based on order status
  useEffect(() => {
    if (currentOrder) {
      const statusMap: { [key: string]: number } = {
        pending: 0,
        confirmed: 0,
        preparing: 1,
        ready: 2,
        'on-delivery': 3,
        delivered: 4,
        cancelled: -1,
      }
      setCurrentStatusIndex(statusMap[currentOrder.status] || 0)
    }
  }, [currentOrder])

  // Handle contact driver
  const handleContactDriver = () => {
    if (currentOrder?.driver?.phone) {
      window.location.href = `tel:${currentOrder.driver.phone}`
    } else {
      toast.info('Información del repartidor no disponible aún')
    }
  }

  // Handle reorder
  const handleReorder = () => {
    // TODO: Implement reorder functionality
    toast.info('Función de reordenar próximamente')
  }

  // Loading state
  if (loading || !currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="px-container">
          <div className="max-w-5xl mx-auto space-y-6">
            <Skeleton variant="rectangle" className="w-full h-64 rounded-2xl" />
            <Skeleton variant="rectangle" className="w-full h-96 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'warning',
      confirmed: 'info',
      preparing: 'info',
      ready: 'success',
      'on-delivery': 'primary',
      delivered: 'success',
      cancelled: 'danger',
    }
    return colors[status] || 'default'
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      ready: 'Listo',
      'on-delivery': 'En camino',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    }
    return labels[status] || status
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="px-container">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate('/orders')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Volver a mis pedidos</span>
            </button>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Pedido #{currentOrder._id.slice(-8)}
                </h1>
                <p className="text-gray-600 mt-1">
                  Realizado el {new Date(currentOrder.createdAt).toLocaleDateString('es-ES')} a
                  las {new Date(currentOrder.createdAt).toLocaleTimeString('es-ES')}
                </p>
              </div>
              <Badge variant="solid" color={getStatusColor(currentOrder.status) as any}>
                {getStatusLabel(currentOrder.status)}
              </Badge>
            </div>
          </motion.div>

          {/* Status Timeline */}
          {currentOrder.status !== 'cancelled' && (
            <motion.div
              variants={fadeInUpVariants}
              initial="initial"
              animate="animate"
              className="card p-6 md:p-8 mb-8"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-8">Estado de tu pedido</h2>

              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200">
                  <motion.div
                    className="w-full bg-primary"
                    initial={{ height: '0%' }}
                    animate={{
                      height: `${(currentStatusIndex / (orderStatusSteps.length - 1)) * 100}%`,
                    }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </div>

                {/* Steps */}
                <div className="space-y-8">
                  {orderStatusSteps.map((step, index) => {
                    const isActive = index === currentStatusIndex
                    const isCompleted = index < currentStatusIndex
                    const Icon = step.icon

                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative flex items-start gap-4"
                      >
                        {/* Icon */}
                        <motion.div
                          initial={false}
                          animate={{
                            scale: isActive ? 1.1 : 1,
                            backgroundColor: isCompleted || isActive ? '#06C167' : '#E5E7EB',
                          }}
                          className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isCompleted || isActive ? 'text-white' : 'text-gray-400'
                          } ${isActive ? 'ring-4 ring-primary/20' : ''}`}
                        >
                          <Icon className="w-6 h-6" />
                        </motion.div>

                        {/* Content */}
                        <div className="flex-1 pt-2">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p
                                className={`font-semibold text-base ${
                                  isActive ? 'text-primary' : 'text-gray-900'
                                }`}
                              >
                                {step.label}
                              </p>
                              <p className="text-sm text-gray-600 mt-0.5">{step.description}</p>
                            </div>
                            {step.time && (
                              <p className="text-xs text-gray-500 font-medium">{step.time}</p>
                            )}
                          </div>

                          {/* Active step additional info */}
                          {isActive && currentOrder.status === 'on-delivery' && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl"
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                                    {currentOrder.driver?.name?.charAt(0) || 'D'}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">
                                      {currentOrder.driver?.name || 'Repartidor'}
                                    </p>
                                    <p className="text-sm text-gray-600">En camino</p>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleContactDriver}
                                >
                                  <PhoneIcon className="w-4 h-4" />
                                  <span>Llamar</span>
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Estimated Time */}
              {currentOrder.status !== 'delivered' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 flex items-center gap-3 p-4 bg-green-50 rounded-xl"
                >
                  <ClockIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-900">
                      Tiempo estimado de llegada
                    </p>
                    <p className="text-xl font-bold text-green-700">
                      {currentOrder.estimatedDeliveryTime || '30-45 min'}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Map Placeholder */}
          {currentOrder.status === 'on-delivery' && (
            <motion.div
              variants={fadeInUpVariants}
              initial="initial"
              animate="animate"
              className="card p-0 mb-8 overflow-hidden"
            >
              <div className="relative h-64 md:h-80 bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">Mapa en tiempo real</p>
                  <p className="text-sm text-gray-500">Próximamente integración con mapas</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Order Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <motion.div variants={fadeInUpVariants} initial="initial" animate="animate">
                <OrderCard
                  order={{
                    id: currentOrder._id,
                    orderNumber: `#${currentOrder._id.slice(-8)}`,
                    restaurant: {
                      name: currentOrder.restaurant?.name || 'Restaurante',
                      logo: currentOrder.restaurant?.logo || '',
                    },
                    items: currentOrder.items.map((item: any) => ({
                      name: item.product?.name || 'Producto',
                      quantity: item.quantity,
                      price: item.price,
                      toppings: item.toppings || [],
                    })),
                    status: currentOrder.status,
                    total: currentOrder.total,
                    createdAt: currentOrder.createdAt,
                  }}
                  onReorder={handleReorder}
                  onReview={() => navigate(`/review/${currentOrder._id}`)}
                />
              </motion.div>

              {/* Cancelled Message */}
              {currentOrder.status === 'cancelled' && (
                <motion.div
                  variants={fadeInUpVariants}
                  initial="initial"
                  animate="animate"
                  className="card p-6 bg-red-50 border border-red-200"
                >
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Pedido cancelado</h3>
                  <p className="text-red-700">
                    Este pedido fue cancelado. Si tienes preguntas, contacta al soporte.
                  </p>
                  {currentOrder.cancelReason && (
                    <p className="text-sm text-red-600 mt-2">
                      Razón: {currentOrder.cancelReason}
                    </p>
                  )}
                </motion.div>
              )}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Delivery Address */}
              <motion.div
                variants={fadeInUpVariants}
                initial="initial"
                animate="animate"
                className="card p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dirección de entrega</h3>
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-900 font-medium">
                      {currentOrder.deliveryAddress?.street || 'No especificada'}
                    </p>
                    {currentOrder.deliveryAddress?.details && (
                      <p className="text-sm text-gray-600 mt-1">
                        {currentOrder.deliveryAddress.details}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                variants={fadeInUpVariants}
                initial="initial"
                animate="animate"
                className="card p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contacto</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="w-5 h-5 text-gray-400" />
                    <p className="text-gray-900">{currentOrder.phone || 'No especificado'}</p>
                  </div>
                </div>
              </motion.div>

              {/* Payment Summary */}
              <motion.div
                variants={fadeInUpVariants}
                initial="initial"
                animate="animate"
                className="card p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de pago</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      ${(currentOrder as any).subtotal?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Domicilio</span>
                    <span className="font-semibold text-gray-900">
                      ${(currentOrder as any).deliveryFee?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tarifa de servicio</span>
                    <span className="font-semibold text-gray-900">
                      ${(currentOrder as any).serviceFee?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-bold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-primary">
                        ${(currentOrder as any).total?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Review CTA */}
              {currentOrder.status === 'delivered' && !(currentOrder as any).review && (
                <motion.div
                  variants={fadeInUpVariants}
                  initial="initial"
                  animate="animate"
                  className="card p-6 bg-primary/5 border border-primary/20"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <StarIcon className="w-6 h-6 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        ¿Cómo estuvo tu pedido?
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Comparte tu experiencia y ayuda a otros usuarios
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => navigate(`/review/${currentOrder._id}`)}
                  >
                    Escribir reseña
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderTracking
