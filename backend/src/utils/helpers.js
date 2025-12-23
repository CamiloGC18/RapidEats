const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `RE-${timestamp}${random}`;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
};

const calculateDiscount = (coupon, subtotal) => {
  if (!coupon) return 0;

  switch (coupon.type) {
    case 'percentage':
      return Math.floor((subtotal * coupon.value) / 100);
    case 'fixed_amount':
      return coupon.value;
    case 'free_product':
      return 0;
    case '2x1':
      return 0;
    default:
      return 0;
  }
};

const getStatusName = (status) => {
  const statusNames = {
    pending_confirmation: 'Pendiente de confirmación',
    confirmed: 'Confirmado',
    preparing: 'En preparación',
    on_the_way: 'En camino',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };
  return statusNames[status] || status;
};

module.exports = {
  generateOrderNumber,
  formatCurrency,
  calculateDiscount,
  getStatusName,
};
