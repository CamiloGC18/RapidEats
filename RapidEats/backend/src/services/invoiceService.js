const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { uploadImage } = require('../config/cloudinary');
const { logHelper } = require('../config/logger');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

/**
 * Servicio para generación de facturas en PDF
 */

/**
 * Generar factura en PDF para una orden
 * @param {String} orderId - ID de la orden
 * @returns {Promise<Buffer>} - Buffer del PDF
 */
const generateInvoicePDF = async (orderId) => {
  try {
    // Obtener datos de la orden
    const order = await Order.findById(orderId)
      .populate('restaurantId', 'name logo address phone email')
      .populate('customerId', 'name email phone')
      .lean();

    if (!order) {
      throw new Error('Order not found');
    }

    // Crear documento PDF
    const doc = new PDFDocument({ 
      size: 'A4',
      margin: 50,
      info: {
        Title: `Factura RapidEats - ${order.orderNumber}`,
        Author: 'RapidEats',
        Subject: `Factura de orden #${order.orderNumber}`
      }
    });

    // Buffer para almacenar el PDF
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));

    // ===== HEADER =====
    // Logo RapidEats
    doc.fontSize(24)
       .fillColor('#06C167')
       .text('RapidEats', 50, 50, { bold: true });

    doc.fontSize(10)
       .fillColor('#6B7280')
       .text('Plataforma Premium de Delivery', 50, 80);

    // Información de la empresa
    doc.fontSize(9)
       .text('NIT: 900.XXX.XXX-X', 50, 100)
       .text('contact@rapideats.com', 50, 113)
       .text('www.rapideats.com', 50, 126);

    // FACTURA info (derecha)
    doc.fontSize(20)
       .fillColor('#111827')
       .text('FACTURA', 400, 50, { align: 'right' });

    doc.fontSize(10)
       .fillColor('#6B7280')
       .text(`No. ${order.orderNumber}`, 400, 80, { align: 'right' })
       .text(`Fecha: ${new Date(order.createdAt).toLocaleDateString('es-CO')}`, 400, 95, { align: 'right' })
       .text(`Estado: ${translateStatus(order.status)}`, 400, 110, { align: 'right' });

    // ===== LÍNEA DIVISORIA =====
    doc.moveTo(50, 150)
       .lineTo(545, 150)
       .strokeColor('#E5E7EB')
       .stroke();

    // ===== INFORMACIÓN DEL CLIENTE =====
    doc.fontSize(12)
       .fillColor('#111827')
       .text('Cliente:', 50, 170, { bold: true });

    doc.fontSize(10)
       .fillColor('#374151')
       .text(order.customer.name, 50, 190)
       .text(order.customer.email || order.customerId?.email, 50, 205)
       .text(order.customer.phone, 50, 220)
       .text(`${order.customer.address}, ${order.customer.zone}`, 50, 235, { width: 200 });

    // ===== INFORMACIÓN DEL RESTAURANTE =====
    doc.fontSize(12)
       .fillColor('#111827')
       .text('Restaurante:', 300, 170, { bold: true });

    doc.fontSize(10)
       .fillColor('#374151')
       .text(order.restaurantId?.name || 'N/A', 300, 190)
       .text(order.restaurantId?.phone || '', 300, 205)
       .text(order.restaurantId?.email || '', 300, 220)
       .text(order.restaurantId?.address || '', 300, 235, { width: 200 });

    // ===== LÍNEA DIVISORIA =====
    doc.moveTo(50, 275)
       .lineTo(545, 275)
       .strokeColor('#E5E7EB')
       .stroke();

    // ===== TABLA DE ITEMS =====
    let yPosition = 295;

    // Header de la tabla
    doc.fontSize(11)
       .fillColor('#111827')
       .text('Item', 50, yPosition, { bold: true })
       .text('Cantidad', 300, yPosition, { bold: true, align: 'center', width: 80 })
       .text('Precio Unit.', 380, yPosition, { bold: true, align: 'right', width: 80 })
       .text('Subtotal', 465, yPosition, { bold: true, align: 'right', width: 80 });

    yPosition += 20;

    // Línea debajo del header
    doc.moveTo(50, yPosition)
       .lineTo(545, yPosition)
       .strokeColor('#E5E7EB')
       .stroke();

    yPosition += 15;

    // Items
    doc.fontSize(10).fillColor('#374151');
    
    order.items.forEach(item => {
      // Verificar si necesitamos nueva página
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }

      doc.text(item.name, 50, yPosition, { width: 240 });
      doc.text(item.quantity.toString(), 300, yPosition, { align: 'center', width: 80 });
      doc.text(`$${formatCurrency(item.price)}`, 380, yPosition, { align: 'right', width: 80 });
      doc.text(`$${formatCurrency(item.subtotal)}`, 465, yPosition, { align: 'right', width: 80 });

      yPosition += 20;

      // Toppings si existen
      if (item.toppings && item.toppings.length > 0) {
        doc.fontSize(9).fillColor('#6B7280');
        item.toppings.forEach(topping => {
          doc.text(`  + ${topping.name} (+$${formatCurrency(topping.price)})`, 50, yPosition, { width: 240 });
          yPosition += 15;
        });
        doc.fontSize(10).fillColor('#374151');
      }
    });

    // Notas especiales si existen
    if (order.customer.notes) {
      yPosition += 10;
      doc.fontSize(9)
         .fillColor('#6B7280')
         .text(`Notas: ${order.customer.notes}`, 50, yPosition, { width: 495, italic: true });
      yPosition += 20;
    }

    // ===== TOTALES =====
    yPosition += 20;
    
    // Línea divisoria antes de totales
    doc.moveTo(300, yPosition)
       .lineTo(545, yPosition)
       .strokeColor('#E5E7EB')
       .stroke();

    yPosition += 15;

    doc.fontSize(10).fillColor('#374151');

    // Subtotal
    doc.text('Subtotal:', 380, yPosition, { align: 'right', width: 80 });
    doc.text(`$${formatCurrency(order.pricing.subtotal)}`, 465, yPosition, { align: 'right', width: 80 });
    yPosition += 20;

    // Costo de envío
    doc.text('Envío:', 380, yPosition, { align: 'right', width: 80 });
    doc.text(`$${formatCurrency(order.pricing.deliveryCost)}`, 465, yPosition, { align: 'right', width: 80 });
    yPosition += 20;

    // Descuento si existe
    if (order.pricing.discount > 0) {
      doc.fillColor('#10B981');
      doc.text('Descuento:', 380, yPosition, { align: 'right', width: 80 });
      doc.text(`-$${formatCurrency(order.pricing.discount)}`, 465, yPosition, { align: 'right', width: 80 });
      yPosition += 20;
      doc.fillColor('#374151');
    }

    // Cupón si existe
    if (order.coupon && order.coupon.code) {
      doc.fontSize(9).fillColor('#6B7280');
      doc.text(`Cupón: ${order.coupon.code}`, 300, yPosition, { width: 180 });
      yPosition += 15;
      doc.fontSize(10).fillColor('#374151');
    }

    yPosition += 5;

    // Línea divisoria antes del total
    doc.moveTo(300, yPosition)
       .lineTo(545, yPosition)
       .strokeColor('#111827')
       .lineWidth(2)
       .stroke();

    yPosition += 15;

    // Total
    doc.fontSize(14)
       .fillColor('#111827')
       .text('TOTAL:', 380, yPosition, { align: 'right', width: 80, bold: true });
    doc.text(`$${formatCurrency(order.pricing.total)}`, 465, yPosition, { align: 'right', width: 80, bold: true });

    yPosition += 40;

    // ===== MÉTODO DE PAGO =====
    doc.fontSize(10)
       .fillColor('#6B7280')
       .text(`Método de pago: ${order.paymentMethod}`, 50, yPosition);

    yPosition += 30;

    // ===== CÓDIGO QR =====
    // Generar QR code con link a tracking de orden
    const qrCodeDataUrl = await QRCode.toDataURL(
      `${process.env.FRONTEND_URL}/order/${order._id}`,
      { width: 150, margin: 1 }
    );
    
    // Convertir data URL a buffer
    const qrBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
    
    doc.image(qrBuffer, 50, yPosition, { width: 100 });
    
    doc.fontSize(9)
       .fillColor('#6B7280')
       .text('Escanea para rastrear tu orden', 160, yPosition + 45, { width: 150 });

    // ===== FOOTER =====
    const footerY = 750;
    
    doc.fontSize(8)
       .fillColor('#9CA3AF')
       .text('Gracias por tu compra con RapidEats', 50, footerY, { align: 'center', width: 495 })
       .text('Esta es una factura electrónica válida', 50, footerY + 15, { align: 'center', width: 495 })
       .text(`Generada el ${new Date().toLocaleString('es-CO')}`, 50, footerY + 30, { align: 'center', width: 495 });

    // Finalizar documento
    doc.end();

    // Esperar a que termine de generar
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        logHelper.info('Invoice PDF generated', { 
          orderId, 
          orderNumber: order.orderNumber,
          size: pdfBuffer.length 
        });
        resolve(pdfBuffer);
      });
      
      doc.on('error', reject);
    });

  } catch (error) {
    logHelper.error('Failed to generate invoice PDF', error, { orderId });
    throw error;
  }
};

/**
 * Generar y subir factura a Cloudinary
 * @param {String} orderId - ID de la orden
 * @returns {Promise<Object>} - {url, publicId}
 */
const generateAndUploadInvoice = async (orderId) => {
  try {
    // Generar PDF
    const pdfBuffer = await generateInvoicePDF(orderId);

    // Subir a Cloudinary
    const result = await uploadImage(pdfBuffer, 'rapideats/invoices');

    // Guardar URL en la orden
    await Order.findByIdAndUpdate(orderId, {
      $set: {
        'invoice.url': result.secureUrl,
        'invoice.publicId': result.publicId,
        'invoice.generatedAt': new Date()
      }
    });

    logHelper.info('Invoice uploaded to Cloudinary', {
      orderId,
      url: result.secureUrl
    });

    return {
      url: result.secureUrl,
      publicId: result.publicId
    };
  } catch (error) {
    logHelper.error('Failed to generate and upload invoice', error, { orderId });
    throw error;
  }
};

/**
 * Traducir estado de orden al español
 */
const translateStatus = (status) => {
  const translations = {
    'pending_confirmation': 'Pendiente de confirmación',
    'confirmed': 'Confirmado',
    'preparing': 'En preparación',
    'on_the_way': 'En camino',
    'delivered': 'Entregado',
    'cancelled': 'Cancelado'
  };
  return translations[status] || status;
};

/**
 * Formatear moneda
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Generar recibo simplificado (para repartidores)
 * @param {String} orderId - ID de la orden
 * @returns {Promise<Buffer>} - Buffer del PDF
 */
const generateReceiptPDF = async (orderId) => {
  try {
    const order = await Order.findById(orderId)
      .populate('restaurantId', 'name')
      .lean();

    if (!order) {
      throw new Error('Order not found');
    }

    const doc = new PDFDocument({ 
      size: [227, 842], // 80mm thermal printer width
      margin: 10
    });

    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));

    // Receipt content
    doc.fontSize(16)
       .text('RapidEats', { align: 'center' });

    doc.fontSize(10)
       .text(`Orden #${order.orderNumber}`, { align: 'center' })
       .moveDown();

    doc.fontSize(8)
       .text(`Fecha: ${new Date(order.createdAt).toLocaleString('es-CO')}`)
       .text(`Restaurant: ${order.restaurantId?.name}`)
       .text(`Cliente: ${order.customer.name}`)
       .text(`Dirección: ${order.customer.address}`)
       .text(`Teléfono: ${order.customer.phone}`)
       .moveDown();

    // Items
    doc.fontSize(9).text('ITEMS:', { underline: true });
    order.items.forEach(item => {
      doc.fontSize(8)
         .text(`${item.quantity}x ${item.name} - $${formatCurrency(item.subtotal)}`);
    });

    doc.moveDown();

    // Total
    doc.fontSize(10)
       .text(`TOTAL: $${formatCurrency(order.pricing.total)}`, { align: 'center' })
       .text(`Pago: ${order.paymentMethod}`, { align: 'center' })
       .moveDown();

    doc.fontSize(7)
       .text('Gracias por usar RapidEats', { align: 'center' });

    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });
  } catch (error) {
    logHelper.error('Failed to generate receipt PDF', error, { orderId });
    throw error;
  }
};

module.exports = {
  generateInvoicePDF,
  generateAndUploadInvoice,
  generateReceiptPDF,
  formatCurrency,
  translateStatus
};
