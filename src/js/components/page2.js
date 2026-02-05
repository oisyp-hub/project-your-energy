import { api } from '../api/yourEnergyApi.js';
import { openExerciseModal } from './exerciseModal.js';

const LS_KEY = 'yourEnergy:favorites';

// ✅ Vite-friendly trash icon
const TRASH_SRC = new URL('../../img/trash.png', import.meta.url).href;

const listEl = document.querySelector('#favorites-list');
const rightEl = document.getElementById('favorites-right');

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

function saveFavs(arr) {
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
  window.dispatchEvent(new CustomEvent('favorites:changed'));
}

function removeFav(id) {
  const next = getFavs().filter(x => x?._id !== id);
  saveFavs(next);
}

// ========================
// Quote loader (Favorites left card)
// ========================
async function loadFavoriteQuote() {
  const textEl = document.getElementById('fav-quote-text');
  const authorEl = document.getElementById('fav-quote-author');
  if (!textEl) return;

  textEl.textContent = 'Loading quote...';
  if (authorEl) authorEl.textContent = '';

  try {
    // Підтримуємо 2 типові назви методу з вашого api
    let data = null;

    if (typeof api?.getQuote === 'function') {
      data = await api.getQuote();
    } else if (typeof api?.getQuoteOfTheDay === 'function') {
      data = await api.getQuoteOfTheDay();
    } else {
      throw new Error('Quote method not found in api. Need api.getQuote() or api.getQuoteOfTheDay()');
    }

    // Під різні формати відповіді
    const text = data?.quote || data?.text || data?.content || data?.message;
    const author = data?.author || data?.name;

    textEl.textContent = text || 'No quote available';
    if (authorEl) authorEl.textContent = author ? `— ${author}` : '';
  } catch (err) {
    console.error('❌ Quote load failed:', err);
    textEl.textContent = 'Failed to load quote. Please try again later.';
    if (authorEl) authorEl.textContent = '';
  }
}

// ========================
// Render favorites list + empty state
// ========================
function renderFavorites() {
  if (!listEl) return;

  const favs = getFavs();
  listEl.innerHTML = '';

  const isEmpty = favs.length === 0;

  // ✅ empty-state як на макеті: показуємо текст окремим блоком через клас
  if (rightEl) rightEl.classList.toggle('is-empty', isEmpty);

  if (isEmpty) return;

  listEl.innerHTML = favs
    .map(
      ex => `
      <li class="fav-exercise" data-id="${ex._id}">
        <div class="fav-exercise__top">
          <span class="fav-exercise__badge">WORKOUT</span>

          <button class="fav-exercise__trash" type="button" data-remove-fav aria-label="Remove from favorites">
            <img class="fav-exercise__trash-icon" src="${TRASH_SRC}" alt="" aria-hidden="true" />
          </button>

          <button class="fav-exercise__start" type="button">Start →</button>
        </div>

        <h3 class="fav-exercise__title">${ex.name}</h3>

        <p class="fav-exercise__meta">
          Burned calories: ${ex.burnedCalories} / 3 min · Target: ${ex.target}
        </p>
      </li>
    `
    )
    .join('');
}

// ========================
// Click handlers
// - trash => remove
// - card/start => open modal
// ========================
listEl?.addEventListener('click', e => {
  // 🗑 remove (не відкривати модалку)
  const trashBtn = e.target.closest('[data-remove-fav]');
  if (trashBtn) {
    e.preventDefault();
    e.stopPropagation();

    const card = trashBtn.closest('.fav-exercise');
    const id = card?.dataset?.id;
    if (!id) return;

    removeFav(id); // викличе favorites:changed => renderFavorites()
    return;
  }

  // open modal
  const card = e.target.closest('.fav-exercise');
  if (!card) return;

  const id = card.dataset.id;
  if (!id) return;

  openExerciseModal(id);
});

// ========================
// Sync on changes
// ========================
window.addEventListener('favorites:changed', renderFavorites);

// ========================
// Init
// ========================
document.addEventListener('DOMContentLoaded', () => {
  loadFavoriteQuote();
  renderFavorites();
});
