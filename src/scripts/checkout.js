import { initPaddle, subscribePaddleEvents, showConnectionStatus } from './paddle-client.js';
import { ENV } from './env-config.js';

function initCheckout() {
  const triggerBtn = document.querySelector('[data-checkout-trigger]');
  if (!triggerBtn) return;

  const originalBtnText = triggerBtn.textContent.trim();
  const planKey = triggerBtn.getAttribute('data-plan'); // 'starter', 'business', 'professional'
  const env = window.__ENV__ || ENV || {};

  const priceMap = {
    starter: env.PRICE_ID_STARTER,
    business: env.PRICE_ID_BUSINESS,
    professional: env.PRICE_ID_PROFESSIONAL
  };

  const priceId = priceMap[planKey];

  // Notice banner element under checkout action
  const actionsContainer = triggerBtn.parentElement;
  let noticeEl = actionsContainer.querySelector('.checkout-notice-banner');
  if (!noticeEl) {
    noticeEl = document.createElement('div');
    noticeEl.className = 'checkout-notice-banner';
    noticeEl.style.cssText = 'display: none; margin-top: var(--space-4); padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); font-size: var(--scale-xs); line-height: 1.5; text-align: center;';
    actionsContainer.appendChild(noticeEl);
  }

  function showNotice(type, message) {
    noticeEl.style.display = 'block';
    if (type === 'error') {
      noticeEl.style.backgroundColor = 'rgba(229, 72, 77, 0.15)';
      noticeEl.style.borderColor = 'var(--color-error)';
      noticeEl.style.border = '1px solid var(--color-error)';
      noticeEl.style.color = '#ff8080';
    } else {
      noticeEl.style.backgroundColor = 'rgba(79, 140, 255, 0.15)';
      noticeEl.style.border = '1px solid var(--color-accent)';
      noticeEl.style.color = 'var(--color-accent-hover)';
    }
    noticeEl.textContent = message;
  }

  function hideNotice() {
    noticeEl.style.display = 'none';
  }

  function setButtonState(loading, label) {
    if (loading) {
      triggerBtn.disabled = true;
      triggerBtn.style.opacity = '0.75';
      triggerBtn.style.cursor = 'wait';
      triggerBtn.textContent = label || 'Connecting to Checkout…';
    } else {
      triggerBtn.disabled = false;
      triggerBtn.style.opacity = '1';
      triggerBtn.style.cursor = 'pointer';
      triggerBtn.textContent = originalBtnText;
    }
  }

  if (!priceId) {
    console.error(`Missing Price ID for plan: ${planKey}`);
    showConnectionStatus('error', 'Configuration error: Plan Price ID missing');
    showNotice('error', 'Configuration error: Missing price ID for this subscription tier.');
    triggerBtn.disabled = true;
    return;
  }

  // Subscribe to Paddle SDK events to reset button on close/error
  subscribePaddleEvents((event) => {
    switch (event.name) {
      case 'checkout.closed':
        setButtonState(false);
        break;

      case 'checkout.loaded':
        setButtonState(false);
        hideNotice();
        break;

      case 'checkout.error':
        setButtonState(false);
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isLiveToken = (env.PADDLE_CLIENT_TOKEN || '').startsWith('live_');

        if (isLocalhost && isLiveToken) {
          showNotice('error', 'Paddle Checkout Warning: Live Paddle client tokens are restricted to approved domains. On localhost, use a Sandbox client token (test_...) or test on your deployed domain.');
        } else {
          showNotice('error', 'Unable to open payment overlay. Please try again or contact support.');
        }
        break;
    }
  });

  // Attempt initial Paddle SDK setup
  initPaddle();

  triggerBtn.addEventListener('click', (e) => {
    e.preventDefault();
    hideNotice();

    const paddleInstance = initPaddle();

    if (!window.Paddle || !paddleInstance) {
      showNotice('error', 'Payment system is initializing or unavailable. Please refresh the page.');
      alert('Payment system is loading or unavailable. Please refresh the page.');
      return;
    }

    setButtonState(true, 'Opening Checkout…');

    try {
      window.Paddle.Checkout.open({
        items: [{ priceId: priceId, quantity: 1 }],
        settings: {
          displayMode: 'overlay',
          theme: 'dark',
          successUrl: `${window.location.origin}/checkout/success.html`
        }
      });
    } catch (err) {
      console.error('Error launching Paddle checkout overlay:', err);
      setButtonState(false);
      showNotice('error', 'Failed to launch checkout window. Please check browser popups or try again.');
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCheckout);
} else {
  initCheckout();
}

