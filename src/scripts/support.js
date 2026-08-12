import { ENV } from './env-config.js';

function initSupportForm() {
  const form = document.querySelector('form[name="support"]');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  if (!submitBtn) return;

  const originalBtnText = submitBtn.textContent.trim();

  let feedbackEl = form.querySelector('.support-feedback-banner');
  if (!feedbackEl) {
    feedbackEl = document.createElement('div');
    feedbackEl.className = 'support-feedback-banner';
    feedbackEl.style.cssText = 'display: none; margin-top: var(--space-4); padding: var(--space-4); border-radius: var(--radius-md); font-size: var(--scale-sm); text-align: center; line-height: 1.5;';
    form.appendChild(feedbackEl);
  }

  function showFeedback(type, message) {
    feedbackEl.style.display = 'block';
    if (type === 'success') {
      feedbackEl.style.backgroundColor = 'rgba(51, 196, 129, 0.15)';
      feedbackEl.style.border = '1px solid var(--color-success)';
      feedbackEl.style.color = 'var(--color-success-bright)';
    } else {
      feedbackEl.style.backgroundColor = 'rgba(229, 72, 77, 0.15)';
      feedbackEl.style.border = '1px solid var(--color-error)';
      feedbackEl.style.color = '#ff8080';
    }
    feedbackEl.textContent = message;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    feedbackEl.style.display = 'none';

    const email = form.querySelector('#email')?.value.trim();
    const subject = form.querySelector('#subject')?.value.trim();
    const message = form.querySelector('#message')?.value.trim();

    if (!email || !subject || !message) {
      showFeedback('error', 'Please fill out all required fields before submitting.');
      return;
    }

    const env = window.__ENV__ || ENV || {};
    const endpoint = env.FORMSPREE_ENDPOINT || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FORMSPREE_ENDPOINT : '');

    if (!endpoint) {
      showFeedback('error', 'Support form endpoint is not configured. Please set VITE_FORMSPREE_ENDPOINT in your environment or Netlify settings.');
      return;
    }

    // Disable button during submission
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.75';
    submitBtn.textContent = 'Sending Support Request…';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          subject: subject,
          message: message
        })
      });

      if (response.ok) {
        showFeedback('success', '✓ Thank you! Your support request has been sent. Our support team will contact you within 24 business hours.');
        form.reset();
      } else {
        const data = await response.json().catch(() => ({}));
        const errMsg = data.errors ? data.errors.map(err => err.message).join(', ') : 'Unable to send message.';
        showFeedback('error', `Submission Error: ${errMsg}`);
      }
    } catch (err) {
      console.error('Error submitting Formspree support form:', err);
      showFeedback('error', 'Network error occurred while submitting form. Please check your connection or contact support directly via email.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.textContent = originalBtnText;
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSupportForm);
} else {
  initSupportForm();
}

