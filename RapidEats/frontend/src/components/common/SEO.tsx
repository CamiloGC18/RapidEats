/**
 * Componente SEO para meta tags dinámicos
 */

import { Helmet } from 'react-helmet-async';
import { generateMetaTags, getCanonicalUrl } from '../../utils/seo';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  noindex?: boolean;
  structuredData?: any;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  author,
  noindex = false,
  structuredData
}) => {
  const metaTags = generateMetaTags({
    title,
    description,
    keywords,
    image,
    url,
    type,
    author
  });

  const fullTitle = `${title} | RapidEats - Delivery Premium`;
  const canonicalUrl = url || getCanonicalUrl(window.location.pathname);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={metaTags.keywords} />}
      <meta name="author" content={author || 'RapidEats'} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={metaTags['og:title']} />
      <meta property="og:description" content={metaTags['og:description']} />
      <meta property="og:image" content={metaTags['og:image']} />
      <meta property="og:url" content={metaTags['og:url']} />
      <meta property="og:type" content={metaTags['og:type']} />
      <meta property="og:site_name" content={metaTags['og:site_name']} />
      <meta property="og:locale" content={metaTags['og:locale']} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={metaTags['twitter:card']} />
      <meta name="twitter:title" content={metaTags['twitter:title']} />
      <meta name="twitter:description" content={metaTags['twitter:description']} />
      <meta name="twitter:image" content={metaTags['twitter:image']} />
      <meta name="twitter:site" content={metaTags['twitter:site']} />
      <meta name="twitter:creator" content={metaTags['twitter:creator']} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};
