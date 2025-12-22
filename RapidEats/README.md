# 🚀 RapidEats - Premium Delivery Platform

RapidEats is a full-stack delivery platform built with the MERN stack, featuring real-time order tracking, Telegram bot integration for delivery notifications, and a modern Uber-inspired design.

## 📋 Features

### Customer Module
- ✅ Google OAuth authentication
- ✅ Browse restaurants by category
- ✅ Interactive menu with product customization
- ✅ Shopping cart with coupon system
- ✅ Real-time order tracking
- ✅ Order history
- ✅ Stripe payment integration
- ✅ Live delivery tracking
- ✅ Order status notifications
- ✅ Reviews and ratings system
- ✅ Favorites management
- ✅ One-click reorder
- ✅ Push notifications
- ✅ **AI-powered recommendations** (Phase 3)
- ✅ **Loyalty program with tiers** (Phase 3)
- ✅ **Referral system with rewards** (Phase 3)
- ✅ **Support tickets and live chat** (Phase 3)

### Restaurant Module
- ✅ Dashboard with metrics and analytics
- ✅ Menu management (CRUD operations)
- ✅ Real-time order notifications
- ✅ Order status management
- ✅ Profile and schedule configuration
- ✅ Revenue tracking and statistics
- ✅ Product availability toggle
- ✅ Order filtering and search

### Admin Module
- ✅ Global platform statistics
- ✅ Restaurant management
- ✅ User management
- ✅ Coupon system
- ✅ Zone management with delivery costs
- ✅ Comprehensive reports
- ✅ Real-time analytics dashboard
- ✅ User role management
- ✅ Revenue and order charts
- ✅ **Advanced analytics with KPIs** (Phase 3)
- ✅ **Support ticket management** (Phase 3)
- ✅ **FAQ management** (Phase 3)
- ✅ **Loyalty program statistics** (Phase 3)
- ✅ **Referral tracking** (Phase 3)

### Delivery System (Telegram Bot)
- ✅ Automatic notifications to delivery group
- ✅ Order assignment with inline buttons
- ✅ Status updates (Preparing → On the way → Delivered)
- ✅ Real-time synchronization with web platform

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** - Server framework
- **MongoDB** + **Mongoose** - Database
- **Socket.io** - Real-time communication
- **Passport.js** - Google OAuth authentication
- **JWT** - Token-based auth
- **node-telegram-bot-api** - Telegram integration
- **Nodemailer** - Email notifications
- **Cloudinary** - Image storage
- **Firebase Admin SDK** - Push notifications

### Frontend
- **React 18** + **TypeScript** - UI framework
- **Vite** - Build tool
- **Redux Toolkit** - State management
- **React Router v6** - Navigation
- **Tailwind CSS** - Styling
- **Socket.io-client** - Real-time updates
- **Axios** - HTTP client
- **React Hook Form** + **Yup** - Form handling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **React Toastify** - Notifications
- **Firebase SDK** - Push notifications (optional)

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Google OAuth credentials
- Telegram Bot Token (optional)
- Cloudinary account (optional)

### 1. Clone and Setup

```bash
# Navigate to project directory
cd C:\Users\INTEL\CascadeProjects\RapidEats
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env with your credentials
# Required: MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
# Optional: TELEGRAM_BOT_TOKEN, EMAIL_USER, CLOUDINARY credentials

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend (from project root)
cd frontend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env with your API URL
# VITE_API_URL=http://localhost:5000/api
# VITE_SOCKET_URL=http://localhost:5000
# VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🔑 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret to `.env` files

## 💳 Stripe Payment Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create a new account or login
3. Get your API keys from the Developers section
4. Add to backend `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_your_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```
5. Set up webhook endpoint: `http://localhost:5000/api/payments/webhook`
6. Subscribe to events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`

## 🔌 Real-time Features (Socket.io)

### Available Events

**Customer Events:**
- `orderStatusUpdate` - Receive order status changes
- `deliveryLocationUpdate` - Track delivery driver location
- `newMessage` - Chat messages from support

**Restaurant Events:**
- `newOrder` - Notification when new order arrives
- `orderUpdate` - Order status changes

**Admin Events:**
- `newOrder` - Platform-wide new orders
- `userJoined` - User activity tracking

### Connection Example:
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');
socket.emit('authenticate', token);
socket.emit('joinOrder', orderId);

socket.on('orderStatusUpdate', (data) => {
  console.log('Order status:', data);
});
```

## 🤖 Telegram Bot Setup (Optional)

1. Talk to [@BotFather](https://t.me/botfather) on Telegram
2. Create new bot with `/newbot`
3. Copy the bot token
4. Create a group for delivery notifications
5. Add your bot to the group and make it admin
6. Get the group chat ID (use `/getUpdates` endpoint)
7. Add credentials to backend `.env`:
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token
   TELEGRAM_GROUP_CHAT_ID=-1001234567890
   ```

## � Firebase Push Notifications Setup (Optional)

Push notifications are optional. The app will work perfectly without them, but they enhance the user experience.

### Backend Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key" and download the JSON file
5. Add credentials to backend `.env`:
   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY_ID=your-private-key-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=your-client-id
   FIREBASE_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com
   ```

### Frontend Setup

1. In Firebase Console, go to Project Settings → General
2. Under "Your apps", click the web icon (</>)
3. Register your app and copy the configuration
4. Add to frontend `.env`:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_VAPID_KEY=your-vapid-key
   ```
5. Go to Project Settings → Cloud Messaging
6. Under "Web Push certificates", generate a new key pair (VAPID)
7. Copy the VAPID key to `VITE_FIREBASE_VAPID_KEY`

### Testing Push Notifications

1. Allow notifications in your browser when prompted
2. User will receive notifications for:
   - Order confirmations
   - Status updates (preparing, on the way, delivered)
   - Review reminders
   - Promotional offers (if enabled in preferences)

**Note:** If Firebase is not configured, the app will log a warning and continue working normally without push notifications.

## �📁 Project Structure

```
RapidEats/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, OAuth, Telegram config
│   │   ├── models/          # Mongoose models
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Auth, validation, error handling
│   │   ├── services/        # Telegram, email, order, payment services
│   │   ├── sockets/         # Socket.io handlers (enhanced)
│   │   ├── utils/           # Helper functions
│   │   └── server.js        # Entry point
│   ├── scripts/
│   │   └── seedDatabase.js  # Sample data seeder
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable components
    │   │   ├── common/
    │   │   └── layout/
    │   ├── pages/           # Page components
    │   │   ├── auth/
    │   │   ├── customer/
    │   │   ├── restaurant/  # ✅ NEW: Restaurant dashboard pages
    │   │   └── admin/       # ✅ NEW: Admin panel pages
    │   ├── store/           # Redux store
    │   │   └── slices/
    │   ├── hooks/           # Custom hooks
    │   ├── styles/          # Global styles
    │   ├── App.tsx
    │   └── main.tsx
    ├── .env.example
    └── package.json
```

## 🎨 Design System

### Colors
- **Primary Black**: `#000000`
- **Primary Green**: `#00D46A`
- **Gray Scale**: `#111111` to `#F8F9FA`
- **Success**: `#00D46A`
- **Warning**: `#FFD93D`
- **Error**: `#FF5252`

### Typography
- **Font**: Poppins (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

## 🔄 API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Restaurants
- `GET /api/restaurants` - List all restaurants
- `GET /api/restaurants/featured` - Featured restaurants
- `GET /api/restaurants/category/:category` - By category
- `GET /api/restaurants/:slug` - Restaurant details + menu

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - User's orders
- `GET /api/orders/:id` - Order details
- `GET /api/orders/:id/tracking` - Order tracking info

### Payments (NEW - Phase 2)
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment completion
- `POST /api/payments/refund` - Process refund
- `POST /api/payments/webhook` - Stripe webhook handler

### Restaurant Dashboard (NEW - Phase 2)
- `GET /api/restaurant/stats` - Restaurant statistics
- `GET /api/restaurant/orders/recent` - Recent orders
- `GET /api/restaurant/menu` - Get menu items
- `PATCH /api/restaurant/menu/:id` - Update menu item
- `DELETE /api/restaurant/menu/:id` - Delete menu item

### Admin Panel (NEW - Phase 2)
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/revenue-chart` - Revenue chart data
- `GET /api/admin/orders-chart` - Orders chart data
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/:id/status` - Toggle user status
- `PATCH /api/admin/users/:id/role` - Change user role

### Reviews (NEW - Phase 3)
- `POST /api/reviews` - Create review
- `GET /api/reviews/restaurant/:restaurantId` - Get restaurant reviews
- `GET /api/reviews/restaurant/:restaurantId/stats` - Review statistics
- `GET /api/reviews/user` - Get user's reviews
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `POST /api/reviews/:id/helpful` - Mark review as helpful
- `POST /api/reviews/:id/respond` - Restaurant responds to review
- `GET /api/reviews/can-review/:orderId` - Check if can review order

### Favorites (NEW - Phase 3)
- `GET /api/favorites` - Get user's favorites
- `GET /api/favorites/stats` - Favorites statistics
- `GET /api/favorites/check/:restaurantId` - Check if restaurant is favorited
- `POST /api/favorites` - Add to favorites
- `PATCH /api/favorites/:restaurantId` - Update favorite notes
- `DELETE /api/favorites/:restaurantId` - Remove from favorites

### Notifications (NEW - Phase 3)
- `POST /api/notifications/token` - Register push token
- `DELETE /api/notifications/token` - Unregister push token
- `GET /api/notifications/preferences` - Get notification preferences
- `PATCH /api/notifications/preferences` - Update notification preferences
- `POST /api/notifications/test` - Send test notification (dev only)

### Orders (Updated - Phase 3)
- `POST /api/orders` - Create order
- `GET /api/orders` - User's orders
- `GET /api/orders/:id` - Order details
- `GET /api/orders/:id/tracking` - Order tracking info
- `POST /api/orders/:orderId/reorder` - Reorder from past order

### Coupons
- `POST /api/coupons/validate` - Validate coupon code

## 🚀 Deployment

### Backend (Railway/Render/Heroku)
1. Create account on deployment platform
2. Connect GitHub repository
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Create account
2. Connect GitHub repository
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables
6. Deploy

## 📝 Sample Data

After running `npm run seed`, you'll have:
- **3 restaurants** (Burger Master, Sushi Express, Pizza Napolitana)
- **7 products** across different categories
- **3 coupons** (BIENVENIDO, ENVIOGRATIS, PROMO2X1)
- **3 delivery zones** (Centro, Norte, Sur)
- **Admin user**: admin@rapideats.com
- **Restaurant owner**: restaurant@rapideats.com

## 🔐 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- HTTP-only cookies for refresh tokens
- CORS configuration
- Helmet.js security headers
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- Role-based access control

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running locally or Atlas connection string is correct
- Check firewall settings

### Google OAuth Not Working
- Verify redirect URI matches exactly
- Check Client ID and Secret are correct
- Ensure Google+ API is enabled

### Telegram Bot Not Responding
- Verify bot token is correct
- Check bot is admin in the group
- Ensure webhook URL is accessible (for production)

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Change port in .env
PORT=5001
```

## 📚 Next Steps

### Phase 1 - Core Features ✅
- ✅ Authentication system
- ✅ Restaurant browsing
- ✅ Menu and cart
- ✅ Basic order flow

### Phase 2 - Advanced Features ✅
- ✅ Complete checkout with Stripe payment integration
- ✅ Full order tracking with Socket.io (real-time updates)
- ✅ Restaurant dashboard implementation (metrics, menu management)
- ✅ Admin panel implementation (user management, analytics)

### Phase 3 - Future Enhancements ✅
- ✅ Reviews and ratings system
- ✅ Favorites and reorder
- ✅ Push notifications (Firebase Cloud Messaging)
- [ ] Mobile app (React Native)

## 🤝 Contributing

This is a demonstration project. Feel free to fork and customize for your needs.

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🎯 Key Features Implemented

### Phase 1 - Core Features
✅ **Google OAuth** - Secure authentication  
✅ **Restaurant Browsing** - Search and filter restaurants  
✅ **Shopping Cart** - Add, remove, and manage items  
✅ **Coupon System** - Multiple discount types  
✅ **Zone Management** - Dynamic delivery costs  
✅ **Basic Order Flow** - Create and view orders  

### Phase 2 - Advanced Features
✅ **Stripe Payment Integration** - Secure payment processing  
✅ **Real-time Order Tracking** - Socket.io live updates  
✅ **Delivery Location Tracking** - Live driver location updates  
✅ **Restaurant Dashboard** - Complete management interface  
✅ **Admin Panel** - Platform-wide analytics and management  
✅ **Menu Management** - CRUD operations for products  
✅ **User Management** - Role-based access control  
✅ **Revenue Analytics** - Charts and statistics  
✅ **Order Status Notifications** - Real-time status updates  
✅ **Payment Refunds** - Automated refund processing  

### Phase 3 - Enhanced User Experience (UPDATED)
✅ **Reviews and Ratings System** - Complete review functionality  
  - Star ratings (overall, food quality, delivery service)
  - Written reviews with images
  - Restaurant responses to reviews
  - Helpful votes on reviews
  - Review statistics and distribution
  - Verified purchase badges

✅ **Favorites System** - Save favorite restaurants  
  - Add/remove restaurants from favorites
  - Personal notes for each favorite
  - Quick access to favorite restaurants
  - Favorites statistics by category

✅ **Reorder Functionality** - One-click reordering  
  - Reorder from past orders
  - Automatic product availability check
  - Price update notification
  - Smart cart management

✅ **Push Notifications** - Real-time alerts  
  - Firebase Cloud Messaging integration
  - Order status updates
  - Delivery tracking notifications
  - Promotional notifications
  - Review reminders
  - Customizable notification preferences

✅ **AI-Powered Recommendations** 🤖 - Personalized suggestions  
  - Collaborative filtering (similar users)
  - Content-based filtering (favorite categories)
  - Hybrid approach (60% collaborative + 40% content)
  - Trending restaurants and products
  - "Reorder from..." suggestions
  - Real-time recommendations

✅ **Loyalty Program** 🎁 - Gamified rewards system  
  - 4 tiers: Bronze, Silver, Gold, Platinum
  - Earn 1 point per $10 spent
  - 100 points = $10 discount
  - Monthly challenges (200-500 bonus points)
  - Tier benefits (5%-15% discount + free delivery)
  - Points history tracking
  - Rewards catalog

✅ **Referral System** 👥 - Social growth features  
  - Unique referral codes (8 characters)
  - $20 reward for both referrer and referred
  - Share via WhatsApp, Facebook, Twitter, Email
  - Referral statistics dashboard
  - Social proof: "X people ordered today"
  - Trending restaurants in zone

✅ **Premium Support** 🎧 - Customer service excellence  
  - Ticket system with priorities
  - Live messaging with support
  - 10 ticket categories
  - SLA tracking (15 min response, 24h resolution)
  - Customer satisfaction ratings
  - FAQ system with search
  - Multi-language support (ES/EN)
  - Help center with articles

✅ **Advanced Analytics** 📊 - Complete dashboard  
  - Real-time KPIs (revenue, orders, active users)
  - Revenue charts (30 days trend)
  - Orders by day of week
  - Top 10 restaurants by revenue
  - Category distribution (pie chart)
  - User growth (area chart)
  - Delivery time histogram
  - Support statistics
  - Loyalty program metrics
  - Active orders monitoring
  - Export reports (JSON/CSV)

### Additional Features
✅ **Telegram Bot** - Delivery notifications  
✅ **Modern UI** - Uber-inspired design  
✅ **Redux State** - Centralized state management  
✅ **TypeScript** - Type-safe frontend  
✅ **Responsive** - Mobile-first design  
✅ **Email Notifications** - Order confirmations  

## 💡 Tips

- Use MongoDB Compass to visualize your database
- Install Redux DevTools extension for debugging
- Use Postman/Insomnia to test API endpoints
- Check browser console for frontend errors
- Monitor backend logs for server issues

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Check console/server logs
4. Verify environment variables

---

**Built with ❤️ using MERN Stack**

*RapidEats - Your food, delivered fast!* 🚀
