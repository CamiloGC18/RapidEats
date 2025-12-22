const mongoose = require('mongoose');
require('dotenv').config();

const FAQ = require('../src/models/FAQ');
const Loyalty = require('../src/models/Loyalty');
const User = require('../src/models/User');

async function seedPhase3Data() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // ===== SEED FAQs =====
    console.log('\n📝 Seeding FAQs...');
    
    const faqs = [
      // General
      {
        category: 'general',
        question: '¿Qué es RapidEats?',
        answer: 'RapidEats es una plataforma premium de delivery que conecta a clientes con los mejores restaurantes de tu zona. Ofrecemos entregas rápidas, programa de lealtad y recomendaciones personalizadas.',
        language: 'es',
        order: 1,
        tags: ['general', 'intro']
      },
      {
        category: 'general',
        question: '¿En qué zonas operan?',
        answer: 'Actualmente operamos en Cúcuta (Colombia) y San Antonio del Táchira (Venezuela). Estamos expandiéndonos constantemente a nuevas zonas.',
        language: 'es',
        order: 2,
        tags: ['general', 'cobertura']
      },

      // Orders
      {
        category: 'orders',
        question: '¿Cómo hago un pedido?',
        answer: '1. Inicia sesión en tu cuenta\n2. Selecciona un restaurante\n3. Agrega productos al carrito\n4. Ingresa tu dirección de entrega\n5. Selecciona método de pago\n6. Confirma tu orden\n\n¡Recibirás actualizaciones en tiempo real!',
        language: 'es',
        order: 1,
        tags: ['orders', 'tutorial']
      },
      {
        category: 'orders',
        question: '¿Puedo cancelar mi pedido?',
        answer: 'Puedes cancelar tu pedido antes de que el restaurante lo confirme (generalmente 2-5 minutos). Una vez confirmado, contacta a soporte para asistencia.',
        language: 'es',
        order: 2,
        tags: ['orders', 'cancelacion']
      },
      {
        category: 'orders',
        question: '¿Cómo rastreo mi pedido?',
        answer: 'Ve a "Mis Pedidos" para ver el estado en tiempo real. Recibirás notificaciones cuando tu pedido esté siendo preparado, listo y en camino.',
        language: 'es',
        order: 3,
        tags: ['orders', 'tracking']
      },

      // Payments
      {
        category: 'payments',
        question: '¿Qué métodos de pago aceptan?',
        answer: 'Aceptamos tarjetas de crédito/débito a través de Stripe. Pronto agregaremos más opciones como PayPal y pagos en efectivo.',
        language: 'es',
        order: 1,
        tags: ['payments', 'metodos']
      },
      {
        category: 'payments',
        question: '¿Es seguro pagar en línea?',
        answer: 'Sí, 100% seguro. Usamos Stripe, una de las plataformas de pago más seguras del mundo. Nunca almacenamos tu información de tarjeta.',
        language: 'es',
        order: 2,
        tags: ['payments', 'seguridad']
      },

      // Delivery
      {
        category: 'delivery',
        question: '¿Cuánto cuesta el envío?',
        answer: 'El costo de envío varía según la distancia y el restaurante. Los miembros Platinum del programa de lealtad disfrutan de envío gratis siempre.',
        language: 'es',
        order: 1,
        tags: ['delivery', 'costos']
      },
      {
        category: 'delivery',
        question: '¿Cuánto tarda la entrega?',
        answer: 'El tiempo promedio de entrega es de 35-45 minutos, dependiendo de la preparación del restaurante y la distancia. Verás un estimado antes de confirmar tu orden.',
        language: 'es',
        order: 2,
        tags: ['delivery', 'tiempo']
      },

      // Loyalty
      {
        category: 'loyalty',
        question: '¿Cómo funciona el programa de lealtad?',
        answer: 'Ganas 1 punto por cada $10 pesos gastados. Acumula puntos para subir de tier (Bronze, Silver, Gold, Platinum) y obtener descuentos y beneficios exclusivos.\n\n100 puntos = $10 de descuento.',
        language: 'es',
        order: 1,
        tags: ['loyalty', 'puntos']
      },
      {
        category: 'loyalty',
        question: '¿Qué beneficios tiene cada tier?',
        answer: 'Bronze (0-999 pts): Puntos base\nSilver (1,000-2,999 pts): 5% descuento extra\nGold (3,000-5,999 pts): 10% descuento + envío gratis ocasional\nPlatinum (6,000+ pts): 15% descuento + envío siempre gratis',
        language: 'es',
        order: 2,
        tags: ['loyalty', 'tiers']
      },
      {
        category: 'loyalty',
        question: '¿Los puntos expiran?',
        answer: 'Los puntos no expiran mientras tu cuenta esté activa. Sin embargo, los rewards canjeados tienen 30 días de validez.',
        language: 'es',
        order: 3,
        tags: ['loyalty', 'expiracion']
      },

      // Account
      {
        category: 'account',
        question: '¿Cómo creo una cuenta?',
        answer: 'Puedes registrarte con tu cuenta de Google en segundos. Haz clic en "Iniciar Sesión" y selecciona "Continuar con Google".',
        language: 'es',
        order: 1,
        tags: ['account', 'registro']
      },
      {
        category: 'account',
        question: '¿Cómo refiero amigos?',
        answer: 'Ve a tu perfil y encontrarás tu código de referido único. Compártelo con amigos y ambos reciben $20 cuando completen su primera orden.',
        language: 'es',
        order: 2,
        tags: ['account', 'referidos']
      },

      // Technical
      {
        category: 'technical',
        question: '¿Por qué no recibo notificaciones?',
        answer: 'Ve a Configuración > Notificaciones y verifica que estén activadas. También asegúrate de haber dado permisos en tu navegador.',
        language: 'es',
        order: 1,
        tags: ['technical', 'notificaciones']
      },
      {
        category: 'technical',
        question: 'La app no carga, ¿qué hago?',
        answer: 'Intenta:\n1. Refrescar la página (F5)\n2. Limpiar caché del navegador\n3. Cerrar sesión y volver a entrar\n4. Probar en modo incógnito\n\nSi el problema persiste, contacta a soporte.',
        language: 'es',
        order: 2,
        tags: ['technical', 'problemas']
      }
    ];

    // Eliminar FAQs existentes y crear nuevos
    await FAQ.deleteMany({});
    const createdFAQs = await FAQ.insertMany(faqs);
    console.log(`✅ ${createdFAQs.length} FAQs creados`);

    // ===== SEED LOYALTY CHALLENGES =====
    console.log('\n🎯 Configurando challenges de lealtad...');
    
    // Buscar todos los usuarios customer
    const customers = await User.find({ role: 'customer' }).limit(10);
    
    if (customers.length > 0) {
      const loyaltyService = require('../src/services/loyaltyService');
      
      for (const customer of customers) {
        try {
          // Crear perfil de loyalty con challenges
          const loyalty = await loyaltyService.getOrCreateLoyalty(customer._id);
          console.log(`✅ Loyalty profile creado para ${customer.name}`);
        } catch (error) {
          console.log(`⚠️  Error creando loyalty para ${customer.name}:`, error.message);
        }
      }
    } else {
      console.log('ℹ️  No hay clientes para crear profiles de loyalty');
    }

    // ===== ACTUALIZAR REFERRAL CODES =====
    console.log('\n🔗 Actualizando códigos de referido...');
    
    const usersWithoutCode = await User.find({
      referralCode: { $exists: false }
    }).limit(20);
    
    for (const user of usersWithoutCode) {
      // El pre-save hook generará el código
      await user.save();
    }
    
    console.log(`✅ ${usersWithoutCode.length} códigos de referido generados`);

    console.log('\n✅ Seed de Fase 3 completado exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`- FAQs: ${createdFAQs.length}`);
    console.log(`- Loyalty Profiles: ${customers.length}`);
    console.log(`- Referral Codes: ${usersWithoutCode.length}`);

  } catch (error) {
    console.error('❌ Error en seed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Conexión cerrada');
    process.exit(0);
  }
}

// Ejecutar seed
if (require.main === module) {
  seedPhase3Data();
}

module.exports = seedPhase3Data;
