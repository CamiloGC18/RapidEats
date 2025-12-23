const { getBot } = require('../config/telegram');
const Order = require('../models/Order');
const { formatCurrency, getStatusName } = require('../utils/helpers');

const notifyNewOrder = async (order) => {
  const bot = getBot();
  if (!bot || !process.env.TELEGRAM_GROUP_CHAT_ID) {
    console.warn('⚠️  Telegram not configured, skipping notification');
    return;
  }

  try {
    const message = `
🆕 *NUEVO PEDIDO #${order.orderNumber}*

🏪 *Restaurante:* ${order.restaurantId.name}
📍 ${order.restaurantId.zone || 'N/A'}

👤 *Cliente:* ${order.customer.name}
📱 ${order.customer.phone}
📍 ${order.customer.address}
🗺️ *Zona:* ${order.customer.zone}

📦 *Pedido:*
${order.items.map(item => 
  `  • ${item.quantity}x ${item.name} - ${formatCurrency(item.subtotal)}`
).join('\n')}

💰 *Total:* ${formatCurrency(order.pricing.total)}
💳 *Pago:* ${order.paymentMethod}

${order.customer.notes ? `📝 *Notas:* ${order.customer.notes}` : ''}
    `;

    const keyboard = {
      inline_keyboard: [[
        { text: '✅ Tomar Pedido', callback_data: `take_order:${order._id}` }
      ]]
    };

    await bot.sendMessage(
      process.env.TELEGRAM_GROUP_CHAT_ID,
      message,
      {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      }
    );

    console.log(`✅ Telegram notification sent for order ${order.orderNumber}`);
  } catch (error) {
    console.error('❌ Error sending Telegram notification:', error.message);
  }
};

const sendDeliveryControls = async (userId, order) => {
  const bot = getBot();
  if (!bot) return;

  try {
    const message = `
🎯 *PEDIDO ASIGNADO #${order.orderNumber}*

👤 *Cliente:* ${order.customer.name}
📱 ${order.customer.phone}
📍 ${order.customer.address}
💰 *Total a cobrar:* ${formatCurrency(order.pricing.total)}
💳 *Pago:* ${order.paymentMethod}

📦 *Items:*
${order.items.map(item => `  • ${item.quantity}x ${item.name}`).join('\n')}
    `;

    const keyboard = {
      inline_keyboard: [
        [{ text: '👨‍🍳 En Preparación', callback_data: `status:${order._id}:preparing` }],
        [{ text: '🚴‍♂️ En Camino', callback_data: `status:${order._id}:on_the_way` }],
        [{ text: '✅ Entregado', callback_data: `status:${order._id}:delivered` }],
        [{ text: '❌ Cancelar', callback_data: `status:${order._id}:cancelled` }]
      ]
    };

    await bot.sendMessage(userId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('❌ Error sending delivery controls:', error.message);
  }
};

const setupTelegramHandlers = (io) => {
  const bot = getBot();
  if (!bot) return;

  bot.on('callback_query', async (callbackQuery) => {
    const action = callbackQuery.data;
    const user = callbackQuery.from;

    try {
      if (action.startsWith('take_order:')) {
        const orderId = action.split(':')[1];
        
        const order = await Order.findByIdAndUpdate(
          orderId,
          { 
            deliveryId: user.id,
            status: 'confirmed',
            $push: {
              statusHistory: {
                status: 'confirmed',
                timestamp: new Date(),
                updatedBy: user.id
              }
            }
          },
          { new: true }
        ).populate('restaurantId customerId');

        if (!order) {
          await bot.answerCallbackQuery(callbackQuery.id, {
            text: '❌ Pedido no encontrado',
            show_alert: true
          });
          return;
        }

        await bot.answerCallbackQuery(callbackQuery.id, {
          text: '✅ Pedido asignado exitosamente'
        });

        await bot.editMessageText(
          `${callbackQuery.message.text}\n\n✅ *Tomado por:* @${user.username || user.first_name}`,
          {
            chat_id: callbackQuery.message.chat.id,
            message_id: callbackQuery.message.message_id,
            parse_mode: 'Markdown'
          }
        );

        await sendDeliveryControls(user.id, order);

        io.to(`order_${orderId}`).emit('orderStatusUpdate', {
          orderId,
          status: 'confirmed',
          timestamp: new Date()
        });
      }

      if (action.startsWith('status:')) {
        const [, orderId, newStatus] = action.split(':');

        const order = await Order.findByIdAndUpdate(
          orderId,
          {
            status: newStatus,
            $push: {
              statusHistory: {
                status: newStatus,
                timestamp: new Date(),
                updatedBy: user.id
              }
            },
            ...(newStatus === 'delivered' && { deliveredAt: new Date() })
          },
          { new: true }
        );

        if (!order) {
          await bot.answerCallbackQuery(callbackQuery.id, {
            text: '❌ Pedido no encontrado',
            show_alert: true
          });
          return;
        }

        io.to(`order_${orderId}`).emit('orderStatusUpdate', {
          orderId,
          status: newStatus,
          timestamp: new Date()
        });

        await bot.answerCallbackQuery(callbackQuery.id, {
          text: `✅ Estado actualizado a: ${getStatusName(newStatus)}`
        });

        if (newStatus === 'delivered') {
          await bot.sendMessage(
            callbackQuery.from.id,
            '🎉 ¡Pedido completado! Puedes tomar un nuevo pedido.',
            { parse_mode: 'Markdown' }
          );
        } else {
          await sendDeliveryControls(callbackQuery.from.id, order);
        }
      }
    } catch (error) {
      console.error('❌ Error handling callback:', error.message);
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: '❌ Error al procesar la acción',
        show_alert: true
      });
    }
  });

  console.log('✅ Telegram handlers configured');
};

module.exports = {
  notifyNewOrder,
  sendDeliveryControls,
  setupTelegramHandlers
};
