/**
 * Utilidades SEO y Meta Tags
 */

interface MetaTags {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  author?: string;
}

interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

/**
 * Genera meta tags para SEO
 */
export const generateMetaTags = (tags: MetaTags) => {
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://rapideats.com';
  const defaultImage = `${baseUrl}/og-image.jpg`;

  return {
    title: tags.title,
    description: tags.description,
    keywords: tags.keywords?.join(', '),
    
    // Open Graph
    'og:title': tags.title,
    'og:description': tags.description,
    'og:image': tags.image || defaultImage,
    'og:url': tags.url || baseUrl,
    'og:type': tags.type || 'website',
    'og:site_name': 'RapidEats',
    'og:locale': 'es_CO',
    
    // Twitter Card
    'twitter:card': 'summary_large_image',
    'twitter:title': tags.title,
    'twitter:description': tags.description,
    'twitter:image': tags.image || defaultImage,
    'twitter:site': '@rapideats',
    'twitter:creator': tags.author || '@rapideats'
  };
};

/**
 * Genera structured data para restaurantes (Schema.org)
 */
export const generateRestaurantSchema = (restaurant: any): StructuredData => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    description: restaurant.description,
    image: restaurant.logo,
    address: {
      '@type': 'PostalAddress',
      streetAddress: restaurant.address?.street,
      addressLocality: restaurant.address?.city,
      addressRegion: restaurant.address?.state,
      postalCode: restaurant.address?.zipCode,
      addressCountry: 'CO'
    },
    telephone: restaurant.phone,
    servesCuisine: restaurant.categories,
    priceRange: restaurant.priceRange || '$$',
    aggregateRating: restaurant.rating ? {
      '@type': 'AggregateRating',
      ratingValue: restaurant.rating.average,
      reviewCount: restaurant.rating.count,
      bestRating: 5,
      worstRating: 1
    } : undefined,
    openingHoursSpecification: restaurant.hours ? Object.entries(restaurant.hours).map(([day, hours]: [string, any]) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: day,
      opens: hours.open,
      closes: hours.close
    })) : undefined,
    acceptsReservations: false,
    hasMenu: `${import.meta.env.VITE_APP_URL}/restaurant/${restaurant.slug}`
  };
};

/**
 * Genera structured data para productos/platos
 */
export const generateMenuItemSchema = (item: any, restaurant: any): StructuredData => {
  return {
    '@context': 'https://schema.org',
    '@type': 'MenuItem',
    name: item.name,
    description: item.description,
    image: item.image,
    offers: {
      '@type': 'Offer',
      price: item.price,
      priceCurrency: 'COP',
      availability: item.isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Restaurant',
        name: restaurant.name
      }
    },
    nutrition: item.nutrition ? {
      '@type': 'NutritionInformation',
      calories: item.nutrition.calories,
      fatContent: item.nutrition.fat,
      proteinContent: item.nutrition.protein,
      carbohydrateContent: item.nutrition.carbs
    } : undefined,
    suitableForDiet: item.dietary?.map((diet: string) => `https://schema.org/${diet}Diet`)
  };
};

/**
 * Genera structured data para reviews
 */
export const generateReviewSchema = (review: any, restaurant: any): StructuredData => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Restaurant',
      name: restaurant.name
    },
    author: {
      '@type': 'Person',
      name: review.user.name
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1
    },
    reviewBody: review.comment,
    datePublished: review.createdAt
  };
};

/**
 * Genera structured data para organización
 */
export const generateOrganizationSchema = (): StructuredData => {
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://rapideats.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'RapidEats',
    description: 'Plataforma premium de delivery de comida en Colombia y Venezuela',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: [
      'https://www.facebook.com/rapideats',
      'https://www.instagram.com/rapideats',
      'https://twitter.com/rapideats'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+57-300-123-4567',
      contactType: 'customer service',
      availableLanguage: ['Spanish', 'English']
    }
  };
};

/**
 * Genera structured data para breadcrumbs
 */
export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>): StructuredData => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
};

/**
 * Genera structured data para FAQs
 */
export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>): StructuredData => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
};

/**
 * Genera sitemap XML
 */
export const generateSitemap = (routes: Array<{ url: string; lastmod?: string; priority?: number }>) => {
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://rapideats.com';
  
  const urls = routes.map(route => `
    <url>
      <loc>${baseUrl}${route.url}</loc>
      ${route.lastmod ? `<lastmod>${route.lastmod}</lastmod>` : ''}
      <changefreq>weekly</changefreq>
      ${route.priority ? `<priority>${route.priority}</priority>` : '<priority>0.8</priority>'}
    </url>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;
};

/**
 * Genera robots.txt
 */
export const generateRobotsTxt = () => {
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://rapideats.com';
  
  return `
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /checkout/
Disallow: /profile/
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
  `.trim();
};

/**
 * Tracking de eventos de analytics
 */
export const trackEvent = (eventName: string, data?: any) => {
  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, data);
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, data);
  }
};

/**
 * Eventos comunes de tracking
 */
export const analytics = {
  pageView: (url: string) => {
    trackEvent('page_view', { page_path: url });
  },

  search: (query: string, results: number) => {
    trackEvent('search', { search_term: query, results_count: results });
  },

  viewItem: (item: any) => {
    trackEvent('view_item', {
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      price: item.price
    });
  },

  addToCart: (item: any) => {
    trackEvent('add_to_cart', {
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity
    });
  },

  beginCheckout: (total: number, items: any[]) => {
    trackEvent('begin_checkout', {
      value: total,
      currency: 'COP',
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    });
  },

  purchase: (orderId: string, total: number, items: any[]) => {
    trackEvent('purchase', {
      transaction_id: orderId,
      value: total,
      currency: 'COP',
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    });
  },

  signUp: (method: string) => {
    trackEvent('sign_up', { method });
  },

  login: (method: string) => {
    trackEvent('login', { method });
  },

  share: (method: string, contentType: string, contentId: string) => {
    trackEvent('share', {
      method,
      content_type: contentType,
      content_id: contentId
    });
  }
};

/**
 * Canonical URL helper
 */
export const getCanonicalUrl = (path: string) => {
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://rapideats.com';
  return `${baseUrl}${path}`;
};
