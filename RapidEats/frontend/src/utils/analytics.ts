/**
 * Scripts de Analytics y Tracking
 */

/**
 * Script de Google Analytics 4
 */
export const googleAnalyticsScript = (measurementId: string) => `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${measurementId}', {
    page_path: window.location.pathname,
    send_page_view: false
  });
`;

/**
 * Script de Facebook Pixel
 */
export const facebookPixelScript = (pixelId: string) => `
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${pixelId}');
  fbq('track', 'PageView');
`;

/**
 * Script de Google Tag Manager
 */
export const googleTagManagerScript = (containerId: string) => `
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${containerId}');
`;

/**
 * Script de Hotjar
 */
export const hotjarScript = (siteId: string) => `
  (function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:${siteId},hjsv:6};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
  })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
`;

/**
 * Inicializar scripts de tracking
 */
export const initializeTracking = () => {
  const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
  const FB_PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID;
  const GTM_CONTAINER_ID = import.meta.env.VITE_GTM_CONTAINER_ID;
  const HOTJAR_SITE_ID = import.meta.env.VITE_HOTJAR_SITE_ID;

  // Solo inicializar en producción
  if (import.meta.env.MODE !== 'production') {
    console.log('🔧 Analytics disabled in development mode');
    return;
  }

  // Google Analytics 4
  if (GA_MEASUREMENT_ID) {
    const gaScript = document.createElement('script');
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    gaScript.async = true;
    document.head.appendChild(gaScript);

    const gaConfigScript = document.createElement('script');
    gaConfigScript.innerHTML = googleAnalyticsScript(GA_MEASUREMENT_ID);
    document.head.appendChild(gaConfigScript);
    
    console.log('✅ Google Analytics initialized');
  }

  // Facebook Pixel
  if (FB_PIXEL_ID) {
    const fbScript = document.createElement('script');
    fbScript.innerHTML = facebookPixelScript(FB_PIXEL_ID);
    document.head.appendChild(fbScript);
    
    const fbNoScript = document.createElement('noscript');
    fbNoScript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1"/>`;
    document.body.appendChild(fbNoScript);
    
    console.log('✅ Facebook Pixel initialized');
  }

  // Google Tag Manager
  if (GTM_CONTAINER_ID) {
    const gtmScript = document.createElement('script');
    gtmScript.innerHTML = googleTagManagerScript(GTM_CONTAINER_ID);
    document.head.insertBefore(gtmScript, document.head.firstChild);
    
    const gtmNoScript = document.createElement('noscript');
    gtmNoScript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.insertBefore(gtmNoScript, document.body.firstChild);
    
    console.log('✅ Google Tag Manager initialized');
  }

  // Hotjar
  if (HOTJAR_SITE_ID) {
    const hjScript = document.createElement('script');
    hjScript.innerHTML = hotjarScript(HOTJAR_SITE_ID);
    document.head.appendChild(hjScript);
    
    console.log('✅ Hotjar initialized');
  }
};
