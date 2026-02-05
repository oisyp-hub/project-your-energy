import './css/header.css';
import './css/hero.css';
import './css/exercises.css';
import './css/footer.css';
import './css/fonts.css';
import './css/modal.css';

import { initHome } from './js/home/home.js';
import { initMobileMenu } from './js/components/mobilemenu.js';
import { initRatingModal } from './js/components/rating-modal.js';

function setActiveHeaderTab() {
  const nav = document.querySelector('.header-center');
  if (!nav) return;

  const path = window.location.pathname;
  const isHome = path.endsWith('/') || path.endsWith('index.html');
  const activeKey = isHome ? 'home' : 'favorites';

  nav.querySelectorAll('.nav-item').forEach(a => {
    const isActive = a.dataset.nav === activeKey;
    a.classList.toggle('active', isActive);

    if (isActive) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setActiveHeaderTab();
  initMobileMenu();
  initRatingModal();
  initHome();
});
