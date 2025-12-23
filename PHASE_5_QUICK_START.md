# 🚀 RapidEats - Fase 5: Guía de Uso Rápida

## ✨ Nuevas Características Premium

### 1. Micro-interacciones

#### Haptic Feedback
```tsx
import { haptics } from './utils/microInteractions';

// Vibración ligera para clicks
button.onClick = () => {
  haptics.light();
};

// Vibración de éxito
onSuccess = () => {
  haptics.success();
};
```

#### Gestos Premium
```tsx
import { useSwipe, useLongPress } from './hooks/useGestures';

// Swipe
const bind = useSwipe({
  onSwipeLeft: () => console.log('Previous'),
  onSwipeRight: () => console.log('Next')
});

<div {...bind()}>Contenido</div>

// Long Press
const longPress = useLongPress({
  onLongPress: () => console.log('Long pressed!'),
  delay: 500
});

<button {...longPress()}>Mantén presionado</button>
```

### 2. Accesibilidad

#### Focus Trap en Modales
```tsx
import { useFocusTrap, useEscapeKey } from './hooks/useAccessibility';

const Modal = ({ isOpen, onClose }) => {
  const modalRef = useFocusTrap(isOpen);
  useEscapeKey(onClose, isOpen);

  return (
    <div ref={modalRef as any}>
      {/* Contenido del modal */}
    </div>
  );
};
```

#### Anuncios a Screen Readers
```tsx
import { announceToScreenReader } from './utils/accessibility';

onOrderComplete = () => {
  announceToScreenReader('Pedido completado exitosamente', 'polite');
};
```

### 3. Performance

#### Imágenes Optimizadas
```tsx
import { OptimizedImage } from './components/common/OptimizedImage';

<OptimizedImage 
  src="https://cloudinary.com/image.jpg"
  alt="Descripción"
  width={400}
  height={300}
  priority={false} // true para above-the-fold
/>
```

#### Listas Virtualizadas
```tsx
import { VirtualizedList } from './components/common/VirtualizedList';

<VirtualizedList
  items={largeArray}
  itemHeight={80}
  containerHeight={600}
  renderItem={(item, index) => (
    <ItemCard key={index} {...item} />
  )}
  onScrollEnd={() => loadMore()}
/>
```

#### Debounce para Búsquedas
```tsx
import { useDebounce } from './utils/performance';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  if (debouncedSearch) {
    performSearch(debouncedSearch);
  }
}, [debouncedSearch]);
```

### 4. SEO

#### Componente SEO
```tsx
import { SEO } from './components/common/SEO';
import { generateRestaurantSchema } from './utils/seo';

<SEO 
  title="Nombre del Restaurante"
  description="Descripción del restaurante"
  keywords={['comida', 'delivery', 'rápido']}
  structuredData={generateRestaurantSchema(restaurant)}
/>
```

#### Tracking de Analytics
```tsx
import { analytics } from './utils/seo';

// Track page view
analytics.pageView(window.location.pathname);

// Track product view
analytics.viewItem(product);

// Track add to cart
analytics.addToCart(product);

// Track purchase
analytics.purchase(orderId, total, items);
```

### 5. Cache Backend

#### Usar Cache Middleware
```javascript
const { cacheMiddleware } = require('./config/cache');

// Cache por 5 minutos (300 segundos)
router.get('/restaurants', cacheMiddleware(300), getRestaurants);
```

#### Cache Manual
```javascript
const { cache, cacheInvalidation } = require('./config/cache');

// Guardar en cache
await cache.set('key', data, 600); // 10 minutos

// Obtener del cache
const data = await cache.get('key');

// Invalidar cache
await cacheInvalidation.restaurants();
```

---

## 🎨 Componentes Nuevos

### SuccessAnimation
```tsx
import { SuccessAnimation } from './components/common/SuccessAnimation';

<SuccessAnimation
  show={showSuccess}
  title="¡Éxito!"
  message="Tu pedido ha sido creado"
  onComplete={() => setShowSuccess(false)}
/>
```

### EmptyState
```tsx
import { EmptyState } from './components/common/EmptyState';
import { ShoppingBag } from 'lucide-react';

<EmptyState
  icon={ShoppingBag}
  title="Carrito vacío"
  message="No tienes productos en tu carrito"
  actionLabel="Explorar restaurantes"
  onAction={() => navigate('/restaurants')}
/>
```

---

## 🔧 Variables de Entorno

Agregar al `.env`:

```bash
# Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_FB_PIXEL_ID=123456789
VITE_GTM_CONTAINER_ID=GTM-XXXXXXX
VITE_HOTJAR_SITE_ID=1234567

# App URL
VITE_APP_URL=https://rapideats.com

# Redis (Backend)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-password
```

---

## 📱 PWA

La aplicación ahora es installable como PWA:
- ✅ Funciona offline
- ✅ Push notifications
- ✅ Íconos y splash screens
- ✅ Background sync

---

## 🚀 Comandos

```bash
# Frontend
cd frontend
npm install
npm run dev      # Desarrollo
npm run build    # Producción
npm run preview  # Preview build

# Backend
cd backend
npm install
npm run dev      # Desarrollo con nodemon
npm start        # Producción
```

---

## 📊 Monitoreo

### Web Vitals
Los Web Vitals se registran automáticamente en producción. Ver consola del navegador.

### Backend Performance
```javascript
const { monitorMemory } = require('./middlewares/performance');

// Ejecutar cada 5 minutos
setInterval(monitorMemory, 5 * 60 * 1000);
```

---

## ✅ Checklist de Producción

- [ ] Configurar analytics (GA4, FB Pixel)
- [ ] Configurar Redis
- [ ] Generar íconos PWA (192x192, 512x512)
- [ ] Crear screenshots para PWA
- [ ] Configurar dominio en variables de entorno
- [ ] Habilitar HTTPS
- [ ] Configurar CDN (Cloudinary)
- [ ] Lighthouse audit (score 90+)
- [ ] Probar accesibilidad con screen readers
- [ ] Probar PWA en dispositivos móviles

---

## 📚 Recursos

- [Documentación completa](/PHASE_5_COMPLETE.md)
- [Resumen ejecutivo](/PHASE_5_SUMMARY.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Vitals](https://web.dev/vitals/)
- [PWA Checklist](https://web.dev/pwa-checklist/)

---

**¿Preguntas?** Consulta la documentación completa en `/PHASE_5_COMPLETE.md`
