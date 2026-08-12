import { ENV } from './env-config.js';

/**
 * Shared Paddle.js Client Initialization & Event Handling
 */

let isInitialized = false;
const eventSubscribers = [];

export function subscribePaddleEvents(callback) {
  if (typeof callback === 'function') {
    eventSubscribers.push(callback);
  }
}

function notifySubscribers(event) {
  eventSubscribers.forEach(cb => {
    try {
      cb(event);
    } catch (e) {
      console.error('Error in Paddle event subscriber:', e);
    }
  });
}

export function showConnectionStatus(state, message) {
  const el = document.querySelector('[data-connection-status]');
  if (!el) return;
  const textEl = el.querySelector('.status-text') || el;
  textEl.textContent = message;
  el.setAttribute('data-state', state);
}

function handlePaddleEvent(event) {
  console.log('Paddle event:', event.name, event);

  switch (event.name) {
    case 'checkout.loaded':
      showConnectionStatus('connected', 'Checkout loaded');
      break;

    case 'checkout.completed':
      showConnectionStatus('connected', 'Payment completed!');
      const transactionId = event.data?.id || event.data?.transaction_id || '';
      window.location.href = `/checkout/success.html?txn=${encodeURIComponent(transactionId)}`;
      break;

    case 'checkout.closed':
      showConnectionStatus('connected', 'Payments ready');
      console.info('Checkout overlay dismissed by user');
      break;

    case 'checkout.error':
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isLiveToken = (window.__ENV__?.PADDLE_CLIENT_TOKEN || '').startsWith('live_');
      
      let errorMsg = 'Unable to open checkout.';
      if (isLocalhost && isLiveToken) {
        errorMsg = 'Paddle Live client token restricted on localhost. Domain approval required by Paddle.';
      } else if (event.data?.detail || event.data?.message) {
        errorMsg = `Checkout Error: ${event.data.detail || event.data.message}`;
      }
      
      showConnectionStatus('error', errorMsg);
      console.error('Paddle Checkout Error:', event.data || event);
      break;
  }

  notifySubscribers(event);
}

export function initPaddle() {
  if (isInitialized && window.Paddle) {
    return window.Paddle;
  }

  const env = window.__ENV__ || ENV || {};
  const clientToken = env.PADDLE_CLIENT_TOKEN;
  let paddleEnv = env.PADDLE_ENV || 'production';

  // Auto-detect sandbox tokens
  if (clientToken && clientToken.startsWith('test_')) {
    paddleEnv = 'sandbox';
  }

  if (!clientToken) {
    showConnectionStatus('error', 'Checkout configuration error. Missing client token.');
    console.error('Paddle client token is missing from environment.');
    return null;
  }

  if (!window.Paddle) {
    showConnectionStatus('error', 'Payment gateway failed to load. Please refresh.');
    console.error('Paddle.js script tag not loaded.');
    return null;
  }

  try {
    showConnectionStatus('loading', 'Connecting to payment gateway…');
    if (window.Paddle.Environment && typeof window.Paddle.Environment.set === 'function') {
      window.Paddle.Environment.set(paddleEnv);
    }
    window.Paddle.Initialize({
      token: clientToken,
      eventCallback: handlePaddleEvent
    });

    isInitialized = true;
    showConnectionStatus('connected', 'Payments ready');
    return window.Paddle;
  } catch (err) {
    console.error('Failed to initialize Paddle SDK:', err);
    showConnectionStatus('error', 'Failed to initialize payment system.');
    return null;
  }
}

