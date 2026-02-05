import { api } from '../api/yourEnergyApi.js';
import { openRatingModal } from './rating-modal.js';
const PAGINATION_BP = 600; // якщо у тебе 768 — зміни тут

function fixPaginationPlacement() {
  const container = document.querySelector('.exercises__container');
  if (!container) return;

  const pagination = container.querySelector('.pagination');
  if (!pagination) return;

  // маркер "де пагінація має жити на десктопі"
  let marker = container.querySelector('[data-pagination-home]');
  if (!marker) {
    marker = document.createElement('span');
    marker.dataset.paginationHome = '1';
    marker.hidden = true;
    pagination.parentNode.insertBefore(marker, pagination);
  }

  const isMobile = window.matchMedia(`(max-width: ${PAGINATION_BP}px)`).matches;

  // знайди quote (підстав свій клас якщо інший)
  const quote =
    container.querySelector('.quote-card') ||
    container.querySelector('.quote') ||
    container.querySelector('[data-quote]');

  if (isMobile && quote) {
    // ✅ мобілка: після карток, але перед Quote
    quote.insertAdjacentElement('beforebegin', pagination);
  } else {
    // ✅ десктоп: повертаємо назад (після маркера)
    marker.insertAdjacentElement('afterend', pagination);
  }
}

// 1) при старті
document.addEventListener('DOMContentLoaded', () => {
  fixPaginationPlacement();
  // якщо контент домальовується після fetch
  setTimeout(fixPaginationPlacement, 0);
  setTimeout(fixPaginationPlacement, 100);
});

// 2) при ресайзі
window.addEventListener('resize', () => {
  fixPaginationPlacement();

  // щоб при зміні ширини (моб/десктоп) пагінація перерендерилась
  if (paginationState) {
    renderPagination(
      paginationState.totalPages,
      paginationState.currentPage,
      paginationState.onPageChange
    );
  }
});

// ========================
// Pagination (mobile window = 3 pages)
// ========================
let paginationState = null;

function getMobileWindow3(totalPages, currentPage) {
  if (totalPages <= 3) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  let start = currentPage;
  if (start > totalPages - 2) start = totalPages - 2;
  if (start < 1) start = 1;

  return [start, start + 1, start + 2];
}

function buildPages(totalPages, currentPage) {
  const isMobile = window.matchMedia(`(max-width: ${PAGINATION_BP}px)`).matches;
  return isMobile
    ? getMobileWindow3(totalPages, currentPage)
    : Array.from({ length: totalPages }, (_, i) => i + 1); // десктоп: як було (всі сторінки)
}

/**
 * Рендер пагінації:
 * - мобілка: тільки 3 кнопки "вікном" (123, 234, 345...)
 * - десктоп: всі сторінки (можеш потім теж обмежити)
 */
export function renderPagination(totalPages, currentPage, onPageChange) {
  const root = document.querySelector('.pagination');
  if (!root) return;

  paginationState = { totalPages, currentPage, onPageChange };

  const pages = buildPages(totalPages, currentPage);

  root.innerHTML = pages
    .map(p => {
      const active = p === currentPage;
      return `
        <button
          class="pagination__btn"
          type="button"
          data-page="${p}"
          ${active ? 'aria-current="page"' : ''}
        >${p}</button>
      `;
    })
    .join('');

  if (!root.dataset.bound) {
    root.dataset.bound = '1';

    root.addEventListener('click', e => {
      const btn = e.target.closest('[data-page]');
      if (!btn) return;

      const next = Number(btn.dataset.page);
      if (!Number.isFinite(next) || next === currentPage) return;

      // callback у твою логіку (fetch/render)
      if (paginationState?.onPageChange) paginationState.onPageChange(next);
    });
  }
}

const LS_KEY = 'yourEnergy:favorites';

// ✅ Vite-friendly assets
const STAR_FULL_SRC = new URL('../../img/stars1.png', import.meta.url).href;
const STAR_EMPTY_SRC = new URL('../../img/starsbl.png', import.meta.url).href;

let isLoading = false;
const cache = new Map();

let currentExerciseId = null;
let currentExerciseData = null;

// ========================
// Favorites helpers
// ========================
function getFavs() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function isFav(id) {
  return getFavs().some(x => x?._id === id);
}

function saveFavs(arr) {
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
  window.dispatchEvent(new CustomEvent('favorites:changed'));
}

function addFav(ex) {
  const favs = getFavs();
  if (favs.some(x => x?._id === ex?._id)) return;
  favs.unshift(ex);
  saveFavs(favs);
}

function removeFav(id) {
  const favs = getFavs().filter(x => x?._id !== id);
  saveFavs(favs);
}

// ========================
// DOM (safe getter)
// ========================
function getModalEls() {
  const modal = document.querySelector('#exercise-modal'); // backdrop
  const content = document.querySelector('#exercise-modal-content');
  return { modal, content };
}

// ========================
// FORCE hide helpers (fix stacking modals)
// ========================
function forceHideExerciseModal() {
  const { modal, content } = getModalEls();
  if (!modal) return;

  modal.classList.add('is-hidden');
  modal.hidden = true; // 🔥 важливо, щоб точно пропав
  modal.setAttribute('aria-hidden', 'true');

  if (content) content.innerHTML = '';

  // якщо це був єдиний відкритий модал — повертаємо скрол
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

function forceHideRatingModal() {
  const rating = document.querySelector('#rating-modal');
  if (!rating) return;

  rating.classList.add('is-hidden');
  rating.hidden = true;
  rating.setAttribute('aria-hidden', 'true');
}

// ========================
// Modal open/close
// ========================
function onEsc(e) {
  if (e.key === 'Escape') closeModal();
}

function openModal() {
  const { modal } = getModalEls();
  if (!modal) return;

  // 🔥 якщо раптом відкритий rating — ховаємо його
  forceHideRatingModal();

  const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

  modal.hidden = false; // 🔥 повертаємо назад
  modal.classList.remove('is-hidden');
  modal.setAttribute('aria-hidden', 'false');

  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = `${scrollBarWidth}px`;

  document.addEventListener('keydown', onEsc);
}

export function closeModal() {
  const { modal, content } = getModalEls();
  if (!modal) return;

  modal.classList.add('is-hidden');
  modal.hidden = true; // 🔥 важливо
  modal.setAttribute('aria-hidden', 'true');

  if (content) content.innerHTML = '';

  document.body.style.overflow = '';
  document.body.style.paddingRight = '';

  document.removeEventListener('keydown', onEsc);

  currentExerciseId = null;
  currentExerciseData = null;
}

// ========================
// UI helpers
// ========================
function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function formatRating(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(1) : '-';
}

function getFullStarsCount(ratingValue) {
  const n = Number(ratingValue);
  if (!Number.isFinite(n)) return 0;
  return clamp(Math.round(n), 0, 5);
}

function renderStars(ratingValue) {
  const full = getFullStarsCount(ratingValue);
  const empty = 5 - full;

  const fullImg = `<img class="modal-exercise__star" src="${STAR_FULL_SRC}" alt="" aria-hidden="true" />`;
  const emptyImg = `<img class="modal-exercise__star" src="${STAR_EMPTY_SRC}" alt="" aria-hidden="true" />`;

  return `
    <div class="modal-exercise__stars" aria-label="${full} out of 5 stars">
      ${fullImg.repeat(full)}${emptyImg.repeat(empty)}
    </div>
  `;
}

function renderLoading() {
  const { content } = getModalEls();
  if (!content) return;

  content.innerHTML = `
    <div class="modal-exercise__media"></div>
    <div class="modal-exercise__info">
      <h2 class="modal-exercise__title">Loading...</h2>
      <p class="modal-exercise__desc">Please wait</p>

      <div class="modal-exercise__actions">
        <button class="btn btn--light" type="button" disabled>Loading...</button>
        <button class="btn btn--outline" type="button" disabled>Give a rating</button>
      </div>
    </div>
  `;
}

function renderExercise(data, exerciseId) {
  const { content } = getModalEls();
  if (!content) return;

  const name = data?.name ?? 'Exercise';
  const gifUrl = data?.gifUrl ?? '';

  const ratingText = formatRating(data?.rating);
  const starsHtml = renderStars(data?.rating);

  const target = data?.target ?? '-';
  const bodyPart = data?.bodyPart ?? '-';
  const burnedCalories = data?.burnedCalories ?? '-';
  const description = data?.description ?? '';

  const equipment = data?.equipment ?? 'body weight';
  const popular = data?.popular ?? data?.popularity ?? '150';

  const favText = isFav(exerciseId) ? 'Remove from favorites' : 'Add to favorites ♡';

  content.innerHTML = `
    <div class="modal-exercise__media">
      ${gifUrl ? `<img class="modal-exercise__img" src="${gifUrl}" alt="${name}" loading="lazy" />` : ''}
    </div>

    <div class="modal-exercise__info">
      <h2 class="modal-exercise__title">${name}</h2>

      <div class="modal-exercise__rating-row">
        <span class="modal-exercise__rating-num">${ratingText}</span>
        ${starsHtml}
      </div>

      <div class="modal-exercise__divider"></div>

      <div class="modal-exercise__tags">
        <span class="tag">Target <b>${target}</b></span>
        <span class="tag">Body Part <b>${bodyPart}</b></span>
        <span class="tag">Equipment <b>${equipment}</b></span>
        <span class="tag">Popular <b>${popular}</b></span>
      </div>

      <p class="modal-exercise__calories">
        Burned calories:<br> <b>${burnedCalories} / 3 min</b>
      </p>

      <div class="modal-exercise__divider"></div>

      <p class="modal-exercise__desc">${description}</p>

      <div class="modal-exercise__actions">
        <button class="btn btn--light" type="button" data-fav-toggle>${favText}</button>

        <button
          class="btn btn--outline"
          type="button"
          data-open-rating
          data-exercise-id="${exerciseId}"
        >
          Give a rating
        </button>
      </div>
    </div>
  `;
}

// ========================
// Event binding (safe)
// ========================
function bindModalEventsOnce() {
  const { modal, content } = getModalEls();
  if (!modal || !content) return;

  if (modal.dataset.bound) return;
  modal.dataset.bound = '1';

  // close by click on backdrop / close button
  modal.addEventListener('click', e => {
    const isBackdrop = e.target === modal;
    const isCloseBtn = e.target.closest('[data-close-modal]');
    if (isBackdrop || isCloseBtn) closeModal();
  });

  // delegation inside content
  content.addEventListener('click', e => {
    // ⭐ rating
    const ratingBtn = e.target.closest('[data-open-rating]');
    if (ratingBtn) {
      const exerciseId = ratingBtn.dataset.exerciseId;
      if (!exerciseId) return console.error('Give a rating: missing data-exercise-id');

      // 🔥 ЗАЛІЗНО: ховаємо exercise modal перед відкриттям rating
      closeModal();

      // якщо десь залишився видимим — приб’ємо
      forceHideExerciseModal();

      // 🔥 відкриваємо рейтинг
      requestAnimationFrame(() => openRatingModal(exerciseId));
      return;
    }

    // ❤️ favorites toggle
    const favBtn = e.target.closest('[data-fav-toggle]');
    if (!favBtn) return;

    if (!currentExerciseId || !currentExerciseData) return;

    if (isFav(currentExerciseId)) {
      removeFav(currentExerciseId);
    } else {
      addFav({
        _id: currentExerciseData._id,
        name: currentExerciseData.name,
        burnedCalories: currentExerciseData.burnedCalories,
        target: currentExerciseData.target,
        bodyPart: currentExerciseData.bodyPart,
        equipment: currentExerciseData.equipment,
        rating: currentExerciseData.rating,
        gifUrl: currentExerciseData.gifUrl,
        description: currentExerciseData.description,
        popular: currentExerciseData.popular ?? currentExerciseData.popularity,
      });
    }

    renderExercise(currentExerciseData, currentExerciseId);
  });
}

bindModalEventsOnce();
document.addEventListener('DOMContentLoaded', bindModalEventsOnce);

// ========================
// Public open
// ========================
export async function openExerciseModal(exerciseId) {
  if (!exerciseId) {
    console.error('openExerciseModal: exerciseId is missing');
    return;
  }

  const { modal, content } = getModalEls();
  if (!modal || !content) {
    console.warn('openExerciseModal: modal DOM not found on this page');
    return;
  }

  if (isLoading) return;
  isLoading = true;

  try {
    currentExerciseId = exerciseId;

    // 🔥 якщо відкритий rating — приб’ємо його
    forceHideRatingModal();

    openModal();
    renderLoading();

    if (cache.has(exerciseId)) {
      const data = cache.get(exerciseId);
      currentExerciseData = data;
      renderExercise(data, exerciseId);
      return;
    }

    const data = await api.getExerciseById(exerciseId);
    if (!data) throw new Error('No data returned from API');

    cache.set(exerciseId, data);
    currentExerciseData = data;
    renderExercise(data, exerciseId);
  } catch (err) {
    console.error('openExerciseModal error:', err);
    alert('Failed to load exercise');
    closeModal();
  } finally {
    isLoading = false;
  }
}
