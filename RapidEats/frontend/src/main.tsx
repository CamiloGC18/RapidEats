import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ToastContainer } from 'react-toastify'
import App from './App'
import { store } from './store'
import './styles/globals.css'
import './styles/accessibility.css'
import 'react-toastify/dist/ReactToastify.css'
import { initializeTracking } from './utils/analytics'
import { initPerformanceOptimizations } from './utils/performance'

// Inicializar analytics y performance optimizations
initializeTracking();
initPerformanceOptimizations();

// Registrar Service Worker
if ('serviceWorker' in navigator && import.meta.env.MODE === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registered:', registration);
      })
      .catch(error => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <BrowserRouter>
          <App />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            role="alert"
            aria-live="polite"
          />
        </BrowserRouter>
      </HelmetProvider>
    </Provider>
  </React.StrictMode>,
)
