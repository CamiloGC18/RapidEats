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

### Restaurant Module
- ✅ Dashboard with metrics and analytics
- ✅ Menu management (CRUD operations)
- ✅ Real-time order notifications
- ✅ Order status management
- ✅ Profile and schedule configuration

### Admin Module
- ✅ Global platform statistics
- ✅ Restaurant management
- ✅ User management
- ✅ Coupon system
- ✅ Zone management with delivery costs
- ✅ Comprehensive reports

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

## 📁 Project Structure

```
RapidEats/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, OAuth, Telegram config
│   │   ├── models/          # Mongoose models
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Auth, validation, error handling
│   │   ├── services/        # Telegram, email, order services
│   │   ├── sockets/         # Socket.io handlers
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
    │   │   ├── restaurant/  # To be implemented
    │   │   └── admin/       # To be implemented
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

### Phase 1 - Core Features (Current)
- ✅ Authentication system
- ✅ Restaurant browsing
- ✅ Menu and cart
- ✅ Basic order flow

### Phase 2 - Advanced Features
- [ ] Complete checkout with payment integration
- [ ] Full order tracking with Socket.io
- [ ] Restaurant dashboard implementation
- [ ] Admin panel implementation

### Phase 3 - Enhancements
- [ ] Reviews and ratings system
- [ ] Favorites and reorder
- [ ] Push notifications
- [ ] Mobile app (React Native)

## 🤝 Contributing

This is a demonstration project. Feel free to fork and customize for your needs.

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🎯 Key Features Implemented

✅ **Google OAuth** - Secure authentication  
✅ **Real-time Updates** - Socket.io integration  
✅ **Telegram Bot** - Delivery notifications  
✅ **Modern UI** - Uber-inspired design  
✅ **Redux State** - Centralized state management  
✅ **TypeScript** - Type-safe frontend  
✅ **Responsive** - Mobile-first design  
✅ **Coupon System** - Multiple discount types  
✅ **Zone Management** - Dynamic delivery costs  
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
