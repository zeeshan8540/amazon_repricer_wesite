// Environment configuration injected at runtime/build-time
const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

export const ENV = {
  PADDLE_ENV: metaEnv.VITE_PADDLE_ENV || 'production',
  PADDLE_CLIENT_TOKEN: metaEnv.VITE_PADDLE_CLIENT_TOKEN || 'live_5404b3f01d1b2f77cf215c3d0f7',
  PRICE_ID_STARTER: metaEnv.VITE_PRICE_ID_STARTER || 'pri_01kycw5t7wrakkyv7fs8nb0xt8',
  PRICE_ID_BUSINESS: metaEnv.VITE_PRICE_ID_BUSINESS || 'pri_01kycw7kah781g4fg0tq4jag7y',
  PRICE_ID_PROFESSIONAL: metaEnv.VITE_PRICE_ID_PROFESSIONAL || 'pri_01kycwbnj2cwegkasm8djs8nmf',
  FORMSPREE_ENDPOINT: metaEnv.VITE_FORMSPREE_ENDPOINT || 'https://formspree.io/f/maewjbwv',

  SUPPORT_EMAIL: metaEnv.VITE_SUPPORT_EMAIL || 'support@amazonrepricer.com'
};

if (typeof window !== 'undefined') {
  window.__ENV__ = Object.assign({}, ENV, window.__ENV__ || {});
}

