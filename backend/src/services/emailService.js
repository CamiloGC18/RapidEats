const nodemailer = require('nodemailer');
const { formatCurrency } = require('../utils/helpers');

let transporter = null;

const initEmailService = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️  Email service not configured');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    console.log('✅ Email service initialized');
    return transporter;
  } catch (error) {
    console.error('❌ Error initializing email service:', error.message);
    return null;
  }
};

const sendOrderConfirmation = async (order) => {
  if (!transporter) {
    transporter = initEmailService();
  }

  if (!transporter || !order.customer.email) {
    return;
  }

  try {
    const itemsList = order.items.map(item => 
      `<li>${item.quantity}x ${item.name} - ${formatCurrency(item.subtotal)}</li>`
    ).join('');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.customer.email,
      subject: `Confirmación de Pedido #${order.orderNumber} - RapidEats`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #00D46A;">¡Pedido Confirmado!</h1>
          <p>Hola ${order.customer.name},</p>
          <p>Tu pedido ha sido confirmado y está siendo preparado.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Pedido #${order.orderNumber}</h2>
            <ul style="list-style: none; padding: 0;">
              ${itemsList}
            </ul>
            <hr>
            <p><strong>Subtotal:</strong> ${formatCurrency(order.pricing.subtotal)}</p>
            <p><strong>Envío:</strong> ${formatCurrency(order.pricing.deliveryCost)}</p>
            ${order.pricing.discount > 0 ? `<p><strong>Descuento:</strong> -${formatCurrency(order.pricing.discount)}</p>` : ''}
            <p style="font-size: 18px;"><strong>Total:</strong> ${formatCurrency(order.pricing.total)}</p>
          </div>
          
          <p><strong>Dirección de entrega:</strong><br>${order.customer.address}</p>
          <p><strong>Tiempo estimado:</strong> ${order.estimatedDeliveryTime}</p>
          
          <p style="color: #666; font-size: 14px;">Puedes hacer seguimiento de tu pedido en tiempo real desde nuestra plataforma.</p>
          
          <p>¡Gracias por tu preferencia!</p>
          <p style="color: #00D46A; font-weight: bold;">- Equipo RapidEats</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${order.customer.email}`);
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
  }
};

module.exports = {
  initEmailService,
  sendOrderConfirmation,
};
