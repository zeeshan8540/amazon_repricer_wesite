// Environment configuration injected at runtime/build-time for Paddle SDK
export const ENV = {
  PADDLE_ENV: 'production',
  PADDLE_CLIENT_TOKEN: 'live_5404b3f01d1b2f77cf215c3d0f7',
  PRICE_ID_STARTER: 'pri_01kycw5t7wrakkyv7fs8nb0xt8',
  PRICE_ID_BUSINESS: 'pri_01kycw7kah781g4fg0tq4jag7y',
  PRICE_ID_PROFESSIONAL: 'pri_01kycwbnj2cwegkasm8djs8nmf',
  SUPPORT_EMAIL: 'support@amazonrepricer.com'
};

if (typeof window !== 'undefined') {
  window.__ENV__ = window.__ENV__ || ENV;
}
