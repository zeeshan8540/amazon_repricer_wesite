function initNav() {
  // Mobile drawer navigation toggle
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navLinks.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile nav when clicking a link inside it
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', false);
      });
    });

    // Close mobile nav when clicking outside header
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.site-header')) {
        navLinks.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', false);
      }
    });
  }

  // Active page link highlighting
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll('.nav-links a');

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    const normalizedPath = currentPath.endsWith('/') && currentPath !== '/' 
      ? currentPath.slice(0, -1) 
      : currentPath;
    const normalizedHref = href.endsWith('/') && href !== '/' 
      ? href.slice(0, -1) 
      : href;

    if (normalizedHref === '/' && (normalizedPath === '/' || normalizedPath === '/index.html')) {
      link.classList.add('active');
    } else if (normalizedHref !== '/' && (normalizedPath === normalizedHref || normalizedPath.startsWith(normalizedHref + '/'))) {
      link.classList.add('active');
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNav);
} else {
  initNav();
}

