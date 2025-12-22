require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Restaurant = require('../src/models/Restaurant');
const Product = require('../src/models/Product');
const Coupon = require('../src/models/Coupon');
const Zone = require('../src/models/Zone');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    await Zone.deleteMany({});

    const adminUser = await User.create({
      email: 'admin@rapideats.com',
      name: 'Admin RapidEats',
      role: 'admin',
      picture: 'https://ui-avatars.com/api/?name=Admin&background=00D46A&color=fff',
    });

    const restaurantOwner = await User.create({
      email: 'restaurant@rapideats.com',
      name: 'Restaurant Owner',
      role: 'restaurant',
      picture: 'https://ui-avatars.com/api/?name=Restaurant&background=00D46A&color=fff',
    });

    const zones = await Zone.insertMany([
      {
        name: 'Centro',
        deliveryCosts: [
          { toZone: 'Centro', cost: 3000 },
          { toZone: 'Norte', cost: 5000 },
          { toZone: 'Sur', cost: 6000 },
        ],
        isActive: true,
      },
      {
        name: 'Norte',
        deliveryCosts: [
          { toZone: 'Centro', cost: 5000 },
          { toZone: 'Norte', cost: 3000 },
          { toZone: 'Sur', cost: 7000 },
        ],
        isActive: true,
      },
      {
        name: 'Sur',
        deliveryCosts: [
          { toZone: 'Centro', cost: 6000 },
          { toZone: 'Norte', cost: 7000 },
          { toZone: 'Sur', cost: 3000 },
        ],
        isActive: true,
      },
    ]);

    const restaurants = await Restaurant.insertMany([
      {
        ownerId: restaurantOwner._id,
        name: 'Burger Master',
        slug: 'burger-master',
        description: 'Las mejores hamburguesas artesanales de la ciudad',
        category: 'Comida Rápida',
        logo: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200',
        banner: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800',
        schedule: {
          monday: { open: '11:00', close: '23:00', isOpen: true },
          tuesday: { open: '11:00', close: '23:00', isOpen: true },
          wednesday: { open: '11:00', close: '23:00', isOpen: true },
          thursday: { open: '11:00', close: '23:00', isOpen: true },
          friday: { open: '11:00', close: '00:00', isOpen: true },
          saturday: { open: '11:00', close: '00:00', isOpen: true },
          sunday: { open: '12:00', close: '22:00', isOpen: true },
        },
        zone: 'Centro',
        estimatedDeliveryTime: '30-40 min',
        isActive: true,
        isFeatured: true,
        rating: 4.8,
        totalOrders: 1250,
      },
      {
        ownerId: restaurantOwner._id,
        name: 'Sushi Express',
        slug: 'sushi-express',
        description: 'Sushi fresco y delicioso al mejor precio',
        category: 'Asiática',
        logo: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200',
        banner: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
        schedule: {
          monday: { open: '12:00', close: '22:00', isOpen: true },
          tuesday: { open: '12:00', close: '22:00', isOpen: true },
          wednesday: { open: '12:00', close: '22:00', isOpen: true },
          thursday: { open: '12:00', close: '22:00', isOpen: true },
          friday: { open: '12:00', close: '23:00', isOpen: true },
          saturday: { open: '12:00', close: '23:00', isOpen: true },
          sunday: { open: '12:00', close: '22:00', isOpen: true },
        },
        zone: 'Norte',
        estimatedDeliveryTime: '35-45 min',
        isActive: true,
        isFeatured: true,
        rating: 4.9,
        totalOrders: 980,
      },
      {
        ownerId: restaurantOwner._id,
        name: 'Pizza Napolitana',
        slug: 'pizza-napolitana',
        description: 'Auténtica pizza italiana con ingredientes importados',
        category: 'Italiana',
        logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200',
        banner: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
        schedule: {
          monday: { open: '17:00', close: '23:00', isOpen: true },
          tuesday: { open: '17:00', close: '23:00', isOpen: true },
          wednesday: { open: '17:00', close: '23:00', isOpen: true },
          thursday: { open: '17:00', close: '23:00', isOpen: true },
          friday: { open: '17:00', close: '00:00', isOpen: true },
          saturday: { open: '12:00', close: '00:00', isOpen: true },
          sunday: { open: '12:00', close: '23:00', isOpen: true },
        },
        zone: 'Centro',
        estimatedDeliveryTime: '40-50 min',
        isActive: true,
        isFeatured: false,
        rating: 4.7,
        totalOrders: 750,
      },
    ]);

    await Product.insertMany([
      {
        restaurantId: restaurants[0]._id,
        name: 'Burger Clásica',
        description: 'Carne 100% res, lechuga, tomate, cebolla, queso cheddar',
        price: 18000,
        category: 'Hamburguesas',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        isActive: true,
        hasToppings: true,
        toppings: [
          { name: 'Queso extra', price: 2000 },
          { name: 'Tocineta', price: 3000 },
          { name: 'Huevo', price: 2500 },
        ],
      },
      {
        restaurantId: restaurants[0]._id,
        name: 'Burger BBQ',
        description: 'Carne, queso, tocineta, cebolla caramelizada, salsa BBQ',
        price: 22000,
        category: 'Hamburguesas',
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400',
        isActive: true,
        hasToppings: true,
        toppings: [
          { name: 'Queso extra', price: 2000 },
          { name: 'Tocineta extra', price: 3000 },
        ],
      },
      {
        restaurantId: restaurants[0]._id,
        name: 'Papas Fritas',
        description: 'Papas crujientes con sal marina',
        price: 8000,
        category: 'Acompañamientos',
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
        isActive: true,
        hasToppings: false,
      },
      {
        restaurantId: restaurants[1]._id,
        name: 'Roll California',
        description: 'Cangrejo, aguacate, pepino, masago',
        price: 24000,
        category: 'Rolls',
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
        isActive: true,
        hasToppings: false,
      },
      {
        restaurantId: restaurants[1]._id,
        name: 'Roll Philadelphia',
        description: 'Salmón, queso crema, aguacate',
        price: 28000,
        category: 'Rolls',
        image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400',
        isActive: true,
        hasToppings: false,
      },
      {
        restaurantId: restaurants[2]._id,
        name: 'Pizza Margherita',
        description: 'Tomate, mozzarella, albahaca fresca',
        price: 32000,
        category: 'Pizzas',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
        isActive: true,
        hasToppings: true,
        toppings: [
          { name: 'Queso extra', price: 4000 },
          { name: 'Champiñones', price: 3000 },
        ],
      },
      {
        restaurantId: restaurants[2]._id,
        name: 'Pizza Pepperoni',
        description: 'Pepperoni, mozzarella, salsa de tomate',
        price: 35000,
        category: 'Pizzas',
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
        isActive: true,
        hasToppings: true,
        toppings: [
          { name: 'Pepperoni extra', price: 5000 },
          { name: 'Queso extra', price: 4000 },
        ],
      },
    ]);

    await Coupon.insertMany([
      {
        code: 'BIENVENIDO',
        description: '20% de descuento en tu primer pedido',
        type: 'percentage',
        value: 20,
        minOrderAmount: 20000,
        maxUses: 100,
        currentUses: 0,
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        code: 'ENVIOGRATIS',
        description: '$5000 de descuento en envío',
        type: 'fixed_amount',
        value: 5000,
        minOrderAmount: 30000,
        maxUses: 50,
        currentUses: 0,
        isActive: true,
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
      {
        code: 'PROMO2X1',
        description: '2x1 en productos seleccionados',
        type: '2x1',
        value: 0,
        minOrderAmount: 0,
        maxUses: null,
        currentUses: 0,
        isActive: true,
        expiresAt: null,
      },
    ]);

    console.log('✅ Database seeded successfully!');
    console.log(`
📊 Created:
   - ${await User.countDocuments()} users
   - ${await Restaurant.countDocuments()} restaurants
   - ${await Product.countDocuments()} products
   - ${await Coupon.countDocuments()} coupons
   - ${await Zone.countDocuments()} zones
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

connectDB().then(seedData);
