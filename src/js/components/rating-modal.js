import { api } from '../api/yourEnergyApi.js';

const STAR_FULL_SRC = new URL('../../img/stars1.png', import.meta.url).href;
const STAR_EMPTY_SRC = new URL('../../img/starsbl.png', import.meta.url).href;

let currentExerciseId = null;
let currentRating = 0;
let els = null;

// ========================
// DOM cache
// ========================
function getElsOnce() {
  if (els?.ratingModal && els?.ratingValueEl && els?.starsWrap && els?.form) return els;

  const ratingModal = document.querySelector('#rating-modal');
  const ratingValueEl = document.querySelector('#rating-value');
  const starsWrap = document.querySelector('#rating-stars');
  const form = document.querySelector('#rating-form');

  if (!ratingModal || !ratingValueEl || !starsWrap || !form) return null;

  els = { ratingModal, ratingValueEl, starsWrap, form };
  return els;
}

// ========================
// Helpers: modal visibility + body scroll
// ========================
function isModalVisible(modalEl) {
  if (!modalEl) return false;
  if (modalEl.classList.contains('is-hidden')) return false;
  if (modalEl.hidden) return false;
  if (modalEl.getAttribute('aria-hidden') === 'true') return false;
  return true;
}

function anyModalOpen() {
  const ex = document.querySelector('#exercise-modal');
  const rt = document.querySelector('#rating-modal');
  return isModalVisible(ex) || isModalVisible(rt);
}

function lockBodyScroll() {
  const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = `${scrollBarWidth}px`;
}

function unlockBodyScrollIfNoModals() {
  if (anyModalOpen()) return;
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

// ========================
// Toast (instead of alert)
// ========================
let toastTimer = null;

function showToast(text, type = 'success') {
  // прибрати попередній toast
  const old = document.querySelector('.rating-toast');
  if (old) old.remove();
  if (toastTimer) clearTimeout(toastTimer);

  const el = document.createElement('div');
  el.className = `rating-toast rating-toast--${type}`;
  el.textContent = text;

  document.body.appendChild(el);

  requestAnimationFrame(() => el.classList.add('is-visible'));

  toastTimer = setTimeout(() => {
    el.classList.remove('is-visible');
    setTimeout(() => el.remove(), 250);
  }, 2200);
}

// ========================
// Stars UI
// ========================
function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function paintStars(starsWrap, value) {
  const fullCount = clamp(Number(value) || 0, 0, 5);
  const btns = starsWrap.querySelectorAll('.rating-star-btn');

  btns.forEach(btn => {
    const v = Number(btn.dataset.value);
    const img = btn.querySelector('img');
    if (!img) return;
    img.src = v <= fullCount ? STAR_FULL_SRC : STAR_EMPTY_SRC;
  });
}

function renderStars(starsWrap) {
  starsWrap.innerHTML = '';

  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'rating-star-btn';
    btn.dataset.value = String(i);
    btn.setAttribute('aria-label', `${i} star${i === 1 ? '' : 's'}`);

    const img = document.createElement('img');
    img.className = 'rating-star';
    img.src = STAR_EMPTY_SRC;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');

    btn.append(img);
    starsWrap.append(btn);
  }

  paintStars(starsWrap, 0);
}

// ========================
// Close / ESC
// ========================
function onEsc(e) {
  if (e.key === 'Escape') closeRatingModal();
}

function closeRatingModal() {
  const got = getElsOnce();
  if (!got) return;

  const { ratingModal, form } = got;

  ratingModal.classList.add('is-hidden');
  ratingModal.hidden = true;
  ratingModal.setAttribute('aria-hidden', 'true');

  document.removeEventListener('keydown', onEsc);
  form.reset();

  currentExerciseId = null;
  currentRating = 0;

  unlockBodyScrollIfNoModals();

  // ✅ без циклічних імпортів: кажемо exerciseModal “повернись”
  window.dispatchEvent(new CustomEvent('rating:closed'));
}

// ========================
// Init (call once in main.js)
// ========================
function initRatingModal() {
  const got = getElsOnce();
  if (!got) {
    console.error(
      'Rating modal DOM not found (#rating-modal, #rating-form, #rating-stars, #rating-value).'
    );
    return;
  }

  const { ratingModal, ratingValueEl, starsWrap, form } = got;

  if (ratingModal.dataset.bound === '1') return;
  ratingModal.dataset.bound = '1';

  renderStars(starsWrap);

  // ✅ HOVER PREVIEW
  starsWrap.addEventListener('mouseover', e => {
    const btn = e.target.closest('.rating-star-btn');
    if (!btn) return;
    paintStars(starsWrap, Number(btn.dataset.value));
  });

  starsWrap.addEventListener('mouseleave', () => {
    paintStars(starsWrap, currentRating);
  });

  // keyboard focus preview
  starsWrap.addEventListener('focusin', e => {
    const btn = e.target.closest('.rating-star-btn');
    if (!btn) return;
    paintStars(starsWrap, Number(btn.dataset.value));
  });

  starsWrap.addEventListener('focusout', () => {
    paintStars(starsWrap, currentRating);
  });

  // click: set rating
  starsWrap.addEventListener('click', e => {
    const btn = e.target.closest('.rating-star-btn');
    if (!btn) return;

    currentRating = clamp(Number(btn.dataset.value), 0, 5);
    ratingValueEl.textContent = currentRating.toFixed(1);
    paintStars(starsWrap, currentRating);
  });

  // close by click on backdrop or close button
  ratingModal.addEventListener('click', e => {
    const isBackdrop = e.target === ratingModal;
    const isCloseBtn = e.target.closest('[data-close-rating]');
    if (isBackdrop || isCloseBtn) closeRatingModal();
  });

  // submit
  form.addEventListener('submit', async e => {
    e.preventDefault();

    if (!currentExerciseId) {
      showToast('No exercise selected', 'error');
      return;
    }

    if (!currentRating) {
      showToast('Please set rating', 'error');
      return;
    }

    const fd = new FormData(form);
    const email = String(fd.get('email') || '').trim();
    // comment зараз у тебе не відправляється в API — залишаю як є
    // const comment = String(fd.get('comment') || '').trim();

    if (!email) {
      showToast('Please enter email', 'error');
      return;
    }

    try {
      await api.rateExercise(currentExerciseId, {
        rate: currentRating,
        email,
      });

      closeRatingModal();
      showToast('Thanks! Rating sent.', 'success');
    } catch (err) {
      console.error('Failed to rate exercise:', err);
      showToast(`Failed to send rating: ${err.message}`, 'error');
    }
  });
}

// ========================
// Open
// ========================
function openRatingModal(exerciseId) {
  const got = getElsOnce();
  if (!got) return false;

  const { ratingModal, ratingValueEl, starsWrap, form } = got;

  currentExerciseId = exerciseId;
  currentRating = 0;

  ratingValueEl.textContent = '0.0';
  paintStars(starsWrap, 0);
  form.reset();

  ratingModal.hidden = false;
  ratingModal.classList.remove('is-hidden');
  ratingModal.setAttribute('aria-hidden', 'false');

  lockBodyScroll();
  document.addEventListener('keydown', onEsc);

  return true;
}

export { initRatingModal, openRatingModal, closeRatingModal };
