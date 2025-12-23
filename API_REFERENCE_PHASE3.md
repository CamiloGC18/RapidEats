# 📡 RapidEats - Phase 3 API Reference

## Base URL
```
http://localhost:5000/api
```

All endpoints require authentication unless specified otherwise.  
Include JWT token in Authorization header: `Bearer <token>`

---

## 🤖 Recommendations API

### GET /recommendations/personalized
Get AI-powered personalized recommendations for the user.

**Query Parameters:**
- `limit` (optional): Number of recommendations (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "restaurant": { /* restaurant object */ },
      "score": 8.5,
      "reasons": ["collaborative", "content-based"]
    }
  ]
}
```

### GET /recommendations/trending/restaurants
Get trending restaurants (most ordered in last 7 days).

**Query Parameters:**
- `limit` (optional): Number of results (default: 10)
- `category` (optional): Filter by category

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "restaurant": { /* restaurant object */ },
      "orderCount": 45,
      "totalRevenue": 12500,
      "reason": "trending"
    }
  ]
}
```

### GET /recommendations/trending/products
Get trending products.

**Query Parameters:**
- `limit` (optional): Number of results (default: 20)
- `category` (optional): Filter by category

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "product": { /* product object */ },
      "orderCount": 120,
      "totalRevenue": 3600
    }
  ]
}
```

### GET /recommendations/reorder
Get "reorder from..." suggestions based on user's frequent orders.

**Query Parameters:**
- `limit` (optional): Number of suggestions (default: 5)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "restaurant": { /* restaurant object */ },
      "orderCount": 12,
      "lastOrder": "2024-12-20T10:30:00Z"
    }
  ]
}
```

---

## 🎁 Loyalty API

### GET /loyalty/profile
Get user's loyalty profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "loyalty": {
      "_id": "...",
      "user": "...",
      "points": 1250,
      "tier": "Silver",
      "lifetimePoints": 2100,
      "nextTierProgress": {
        "nextTier": "Gold",
        "pointsNeeded": 900,
        "progress": 70
      }
    },
    "benefits": {
      "discount": 5,
      "freeDelivery": false,
      "prioritySupport": false,
      "exclusiveOffers": true
    }
  }
}
```

### GET /loyalty/history
Get points history.

**Query Parameters:**
- `limit` (optional): Number of entries (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "earned",
      "amount": 50,
      "reason": "Orden #ORD123456",
      "createdAt": "2024-12-20T10:30:00Z"
    },
    {
      "type": "bonus",
      "amount": 100,
      "reason": "Bonus de bienvenida",
      "createdAt": "2024-12-15T08:00:00Z"
    }
  ]
}
```

### POST /loyalty/redeem
Redeem points for discount.

**Body:**
```json
{
  "points": 100
}
```

**Response:**
```json
{
  "success": true,
  "message": "Puntos redimidos exitosamente",
  "data": {
    "loyalty": { /* updated loyalty object */ },
    "reward": {
      "rewardId": "DISC1734698765432",
      "name": "Descuento de $10",
      "type": "discount",
      "value": 10,
      "expiresAt": "2025-01-20T10:30:00Z"
    }
  }
}
```

### GET /loyalty/challenges
Get active and completed challenges.

**Response:**
```json
{
  "success": true,
  "data": {
    "active": [
      {
        "challengeId": "monthly_orders_5",
        "name": "Ordena 5 veces este mes",
        "description": "Completa 5 órdenes durante este mes",
        "target": 5,
        "current": 2,
        "reward": 200,
        "expiresAt": "2024-12-31T23:59:59Z"
      }
    ],
    "completed": [
      {
        "challengeId": "monthly_orders_5_nov",
        "name": "Ordena 5 veces este mes",
        "target": 5,
        "current": 5,
        "reward": 200,
        "completedAt": "2024-11-25T15:20:00Z"
      }
    ]
  }
}
```

### GET /loyalty/rewards
Get available and used rewards.

**Response:**
```json
{
  "success": true,
  "data": {
    "available": [
      {
        "rewardId": "DISC1734698765432",
        "name": "Descuento de $10",
        "type": "discount",
        "value": 10,
        "expiresAt": "2025-01-20T10:30:00Z"
      }
    ],
    "used": []
  }
}
```

### POST /loyalty/rewards/:rewardId/use
Use a reward.

**Response:**
```json
{
  "success": true,
  "message": "Reward usado exitosamente",
  "data": {
    "rewardId": "DISC1734698765432",
    "name": "Descuento de $10",
    "type": "discount",
    "value": 10,
    "used": true,
    "usedAt": "2024-12-20T10:30:00Z"
  }
}
```

### GET /loyalty/tiers
Get tier benefits information.

**Response:**
```json
{
  "success": true,
  "data": {
    "currentTier": "Silver",
    "currentBenefits": {
      "discount": 5,
      "freeDelivery": false,
      "prioritySupport": false,
      "exclusiveOffers": true
    },
    "allTiers": [
      {
        "tier": "Bronze",
        "benefits": { /* ... */ },
        "required": 0,
        "current": false
      },
      {
        "tier": "Silver",
        "benefits": { /* ... */ },
        "required": 1000,
        "current": true
      }
    ]
  }
}
```

---

## 👥 Referrals API

### GET /referrals/code
Get user's referral code and share URLs.

**Response:**
```json
{
  "success": true,
  "data": {
    "referralCode": "ABC12345",
    "url": "http://localhost:3000?ref=ABC12345",
    "whatsapp": "https://wa.me/?text=...",
    "facebook": "https://www.facebook.com/sharer/...",
    "twitter": "https://twitter.com/intent/tweet?...",
    "email": "mailto:?subject=..."
  }
}
```

### POST /referrals/apply
Apply a referral code.

**Body:**
```json
{
  "referralCode": "ABC12345"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Código de referido aplicado exitosamente",
  "data": {
    "success": true,
    "referrer": {
      "name": "John Doe",
      "id": "..."
    }
  }
}
```

### GET /referrals/stats
Get referral statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "referralCode": "ABC12345",
    "totalReferrals": 5,
    "completedReferrals": 3,
    "pendingReferrals": 2,
    "pointsEarned": 150,
    "referrals": [
      {
        "user": {
          "name": "Jane Smith",
          "email": "jane@example.com"
        },
        "completedFirstOrder": true,
        "dateReferred": "2024-12-10T08:00:00Z"
      }
    ]
  }
}
```

### GET /referrals/social-proof/:restaurantId
Get social proof for a restaurant.

**Response:**
```json
{
  "success": true,
  "data": {
    "ordersToday": 12,
    "ordersThisWeek": 85,
    "message": "12 personas ordenaron de aquí hoy"
  }
}
```

### GET /referrals/trending/:zoneId
Get trending restaurants in a zone.

**Query Parameters:**
- `limit` (optional): Number of results (default: 5)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "restaurant": { /* restaurant object */ },
      "orderCount": 8,
      "trending": true
    }
  ]
}
```

---

## 🎧 Support API

### POST /support/tickets
Create a support ticket.

**Body:**
```json
{
  "category": "order_issue",
  "priority": "high",
  "subject": "Orden no llegó",
  "description": "Mi orden #ORD123456 nunca llegó...",
  "order": "order_id_here",
  "metadata": {
    "userAgent": "Mozilla/5.0...",
    "platform": "web"
  }
}
```

**Categories:** `order_issue`, `payment_issue`, `delivery_issue`, `restaurant_issue`, `account_issue`, `technical_issue`, `general_inquiry`, `complaint`, `suggestion`, `other`

**Priorities:** `low`, `medium`, `high`, `urgent`

**Response:**
```json
{
  "success": true,
  "message": "Ticket creado exitosamente",
  "data": {
    "_id": "...",
    "ticketNumber": "TKT000001",
    "status": "open",
    "category": "order_issue",
    "priority": "high",
    "subject": "Orden no llegó",
    "createdAt": "2024-12-20T10:30:00Z"
  }
}
```

### GET /support/tickets
Get user's tickets.

**Query Parameters:**
- `status` (optional): Filter by status
- `category` (optional): Filter by category
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "tickets": [ /* array of tickets */ ],
    "pagination": {
      "total": 15,
      "page": 1,
      "pages": 1
    }
  }
}
```

### GET /support/tickets/:ticketId
Get ticket details with messages.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "ticketNumber": "TKT000001",
    "status": "in_progress",
    "messages": [
      {
        "sender": { "name": "John Doe" },
        "senderRole": "customer",
        "message": "Mi orden no llegó...",
        "createdAt": "2024-12-20T10:30:00Z"
      },
      {
        "sender": { "name": "Support Agent" },
        "senderRole": "support",
        "message": "Lamento el inconveniente...",
        "createdAt": "2024-12-20T10:35:00Z"
      }
    ]
  }
}
```

### POST /support/tickets/:ticketId/messages
Add message to ticket.

**Body:**
```json
{
  "message": "Gracias por la respuesta...",
  "attachments": []
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mensaje agregado",
  "data": { /* updated ticket */ }
}
```

### PATCH /support/tickets/:ticketId/status
Update ticket status.

**Body:**
```json
{
  "status": "resolved"
}
```

**Statuses:** `open`, `in_progress`, `waiting_customer`, `resolved`, `closed`

### POST /support/tickets/:ticketId/rate
Rate ticket resolution.

**Body:**
```json
{
  "rating": 5,
  "feedback": "Excelente servicio"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Calificación guardada",
  "data": { /* updated ticket */ }
}
```

### GET /support/faqs
Get FAQs.

**Query Parameters:**
- `category` (optional): Filter by category
- `search` (optional): Search text
- `language` (optional): Language (default: 'es')

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "category": "orders",
      "question": "¿Cómo hago un pedido?",
      "answer": "1. Inicia sesión...",
      "views": 120,
      "helpful": 85,
      "notHelpful": 5
    }
  ]
}
```

### POST /support/faqs/:faqId/view
Increment FAQ views.

### POST /support/faqs/:faqId/rate
Rate FAQ as helpful or not.

**Body:**
```json
{
  "helpful": true
}
```

---

## 📊 Analytics API (Admin Only)

### GET /analytics/dashboard
Get complete dashboard data.

**Query Parameters:**
- `days` (optional): Number of days (default: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "kpis": { /* KPIs object */ },
    "charts": {
      "revenue": [ /* revenue chart data */ ],
      "ordersByDay": [ /* orders by day */ ],
      "topRestaurants": [ /* top restaurants */ ],
      "categoryDistribution": [ /* category data */ ],
      "userGrowth": [ /* user growth */ ],
      "deliveryTimeDistribution": [ /* delivery times */ ]
    },
    "stats": {
      "support": { /* support stats */ },
      "loyalty": { /* loyalty stats */ }
    },
    "activeOrders": [ /* active orders */ ]
  }
}
```

### GET /analytics/kpis
Get dashboard KPIs.

**Response:**
```json
{
  "success": true,
  "data": {
    "revenue": {
      "today": 15000,
      "yesterday": 12000,
      "thisWeek": 85000,
      "thisMonth": 320000,
      "changePercent": "25.0"
    },
    "orders": {
      "today": 45,
      "yesterday": 38,
      "changePercent": "18.4"
    },
    "activeUsers": {
      "today": 120,
      "thisWeek": 580
    },
    "conversionRate": "42.50",
    "avgDeliveryTime": "38",
    "platformRating": "4.6"
  }
}
```

### GET /analytics/charts/revenue
Get revenue chart data.

**Query Parameters:**
- `days` (optional): Number of days (default: 30)

### GET /analytics/charts/orders-by-day
Get orders by day of week.

### GET /analytics/charts/top-restaurants
Get top restaurants by revenue.

**Query Parameters:**
- `limit` (optional): Number of results (default: 10)
- `days` (optional): Number of days (default: 30)

### GET /analytics/charts/category-distribution
Get orders distribution by category.

### GET /analytics/charts/user-growth
Get user growth over time.

### GET /analytics/charts/delivery-time
Get delivery time distribution.

### GET /analytics/stats/support
Get support statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "byStatus": [
      { "_id": "open", "count": 5, "avgResponseTime": 8.5 },
      { "_id": "resolved", "count": 25, "avgResolutionTime": 120 }
    ],
    "satisfaction": {
      "avgRating": 4.5,
      "total": 20
    }
  }
}
```

### GET /analytics/stats/loyalty
Get loyalty program statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "tierDistribution": [
      { "_id": "Bronze", "count": 150, "avgPoints": 450 },
      { "_id": "Silver", "count": 80, "avgPoints": 1800 },
      { "_id": "Gold", "count": 30, "avgPoints": 4200 },
      { "_id": "Platinum", "count": 10, "avgPoints": 8500 }
    ],
    "totalPoints": {
      "totalIssued": 450000,
      "totalActive": 320000
    }
  }
}
```

### GET /analytics/active-orders
Get currently active orders.

**Response:**
```json
{
  "success": true,
  "data": [ /* array of active orders */ ]
}
```

### GET /analytics/export
Export report data.

**Query Parameters:**
- `startDate` (required): Start date (ISO format)
- `endDate` (required): End date (ISO format)
- `format` (optional): 'json' or 'csv' (default: 'json')
- `restaurantId` (optional): Filter by restaurant
- `category` (optional): Filter by category
- `zone` (optional): Filter by zone

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error message here",
  "error": "Error details (only in development)"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

- General endpoints: 100 requests per 15 minutes
- Authentication endpoints: 5 requests per 15 minutes

Exceeding limits returns `429 Too Many Requests`.

---

**Version:** 3.0.0  
**Last Updated:** December 2025
