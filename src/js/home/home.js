import { api } from '../api/yourEnergyApi';
import { storage } from '../services/storage';
import { homeState } from '../state/homeState';
import { openExerciseModal } from '../components/exerciseModal';

const PAGINATION_BP = 600;

// ========================
// Pagination helpers
// ========================
let lastTotalPages = 1; // щоб на resize перемальовувати коректно

function getPagesMobile3(totalPages, currentPage) {
  if (totalPages <= 3) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  let start = Number(currentPage) || 1;
  if (start > totalPages - 2) start = totalPages - 2;
  if (start < 1) start = 1;

  return [start, start + 1, start + 2];
}

function getPagesForPagination(totalPages, currentPage) {
  const isMobile = window.matchMedia(`(max-width: ${PAGINATION_BP}px)`).matches;

  if (isMobile) {
    return getPagesMobile3(totalPages, currentPage);
  }

  // ✅ десктоп як було: до 10 кнопок
  const max = Math.min(totalPages, 10);
  return Array.from({ length: max }, (_, i) => i + 1);
}

// ========================
// ✅ ПІД ТВОЮ ВЕРСТКУ
// ========================
const refs = {
  quoteText: document.querySelector('.quote-card__text'),
  quoteAuthor: document.querySelector('.quote-card__author'),

  tabs: document.querySelector('.exercises__tabs'),
  categories:
    document.querySelector('#categories-list') ||
    document.querySelector('.categories'),
  pagination: document.querySelector('.pagination'),

  exercisesSection: document.querySelector('#exercises-section'),
  exercisesTitle: document.querySelector('#exercises-title'),
  exercisesList: document.querySelector('#exercises-list'),

  // ✅ ГОЛОВНИЙ ЗАГОЛОВОК "Exercises" (для breadcrumb)
  mainTitle: document.querySelector('.exercises__title'),

  // ✅ TOP SEARCH (в хедері)
  searchForm: document.querySelector('#top-search-form'),
  searchInput: document.querySelector('#top-search-input'),
};

const FILTERS = ['Muscles', 'Body parts', 'Equipment'];

// ========================
// Pagination placement (mobile only)
// - mobile: cards -> pagination -> quote
// - desktop: restore to original place
// ========================
function fixPaginationPlacement() {
  if (!refs.pagination) return;

  // намагаємось знайти контейнер секції
  const container =
    document.querySelector('.exercises__container') ||
    refs.pagination.closest('.exercises__container') ||
    refs.pagination.parentElement;

  if (!container) return;

  const pagination = refs.pagination;

  // маркер "де пагінація має жити на десктопі"
  let marker = container.querySelector('[data-pagination-home]');
  if (!marker) {
    marker = document.createElement('span');
    marker.dataset.paginationHome = '1';
    marker.hidden = true;

    // запам’ятовуємо поточне місце (desktop) — вставляємо маркер ПЕРЕД пагінацією
    pagination.parentNode.insertBefore(marker, pagination);
  }

  const isMobile = window.matchMedia(`(max-width: ${PAGINATION_BP}px)`).matches;

  // wrapper quote-картки (звідси точно є .quote-card__text)
  const quoteCard =
    document.querySelector('.quote-card') ||
    container.querySelector('.quote-card') ||
    container.querySelector('[data-quote]');

  if (isMobile && quoteCard) {
    // ✅ мобілка: перед Quote
    quoteCard.insertAdjacentElement('beforebegin', pagination);
  } else {
    // ✅ десктоп: повертаємо назад (після маркера)
    marker.insertAdjacentElement('afterend', pagination);
  }
}

// ========================
// Init
// ========================
export async function initHome() {
  if (!refs.tabs || !refs.categories) {
    console.warn('Home markup not found: check selectors in home.js');
    return;
  }

  // ✅ початковий стейт
  homeState.activeFilter = homeState.activeFilter || 'Muscles';
  homeState.page = homeState.page || 1;
  homeState.limit = homeState.limit || 10;
  homeState.selectedCategory = null;
  homeState.keyword = '';

  renderTabs();
  await loadAndRenderQuote();
  await loadAndRenderCategories();

  bindEvents();

  // щоб одразу встати правильно (особливо якщо quote/контент домальовується)
  fixPaginationPlacement();
  setTimeout(fixPaginationPlacement, 0);
  setTimeout(fixPaginationPlacement, 100);

  // на resize: перемістити + перерендерити кнопки (3 на моб / до 10 на десктоп)
  window.addEventListener('resize', () => {
    if (refs.pagination) renderPagination(lastTotalPages, homeState.page);
    fixPaginationPlacement();
  });
}

// ========================
// Quote
// ========================
async function loadAndRenderQuote() {
  try {
    const data = await storage.getDailyQuote(() => api.getQuote());
    const quote = data.quote || data.text || '';
    const author = data.author || 'Unknown';

    if (refs.quoteText) refs.quoteText.textContent = quote;
    if (refs.quoteAuthor) refs.quoteAuthor.textContent = author;
  } catch (e) {
    if (refs.quoteText) refs.quoteText.textContent = 'Failed to load quote.';
    if (refs.quoteAuthor) refs.quoteAuthor.textContent = '';
    console.error(e);
  }
}

// ========================
// Tabs
// ========================
function renderTabs() {
  refs.tabs.innerHTML = FILTERS.map(f => {
    const active = f === homeState.activeFilter ? 'is-active' : '';
    return `
      <button
        class="exercises__tab ${active}"
        type="button"
        data-filter="${f}"
        role="tab"
        aria-selected="${f === homeState.activeFilter ? 'true' : 'false'}"
      >
        ${f}
      </button>`;
  }).join('');
}

/* ✅ Breadcrumb у заголовку: Exercises / abs */
function setMainTitle(categoryName = '') {
  if (!refs.mainTitle) return;

  if (!categoryName) {
    refs.mainTitle.textContent = 'Exercises';
    return;
  }

  refs.mainTitle.innerHTML = `Exercises <span class="exercises__subtitle">/ ${escapeHtml(
    categoryName
  )}</span>`;
}

// ✅ показ categories, ховаємо exercises
function showCategoriesView() {
  refs.categories.classList.remove('is-hidden');

  if (refs.exercisesSection) refs.exercisesSection.classList.add('is-hidden');
  if (refs.exercisesList) refs.exercisesList.innerHTML = '';

  // ✅ TOP SEARCH ховаємо
  if (refs.searchForm) refs.searchForm.classList.add('is-hidden');

  // ✅ повертаємо "Exercises" без "/ ..."
  setMainTitle('');

  // ✅ прибираємо дубльований заголовок справа (якщо він був)
  if (refs.exercisesTitle) refs.exercisesTitle.textContent = '';
}

// ✅ показ exercises, ховаємо categories
function showExercisesView() {
  refs.categories.classList.add('is-hidden');

  // ✅ TOP SEARCH показуємо
  if (refs.searchForm) refs.searchForm.classList.remove('is-hidden');

  if (!refs.exercisesSection) {
    refs.categories.classList.remove('is-hidden');
    refs.categories.innerHTML = `
      <li style="padding:16px;">
        ❗ Не знайдено блок <b>#exercises-section</b> у hero.html.
        Додай його (section з id="exercises-section", ul з id="exercises-list").
      </li>`;
    return;
  }

  refs.exercisesSection.classList.remove('is-hidden');

  if (!refs.exercisesList) {
    refs.exercisesSection.innerHTML = `
      <p style="padding:16px;">
        ❗ Не знайдено <b>#exercises-list</b> у hero.html.
        Додай ul з id="exercises-list".
      </p>`;
  }
}

// ========================
// Categories
// ========================
async function loadAndRenderCategories() {
  showCategoriesView();

  try {
    const { activeFilter, page, limit } = homeState;
    const data = await api.getFilters({ filter: activeFilter, page, limit });

    const items = data.results || data.data || data || [];

    if (!items.length) {
      refs.categories.innerHTML = `<li>No categories for "${activeFilter}"</li>`;
      if (refs.pagination) refs.pagination.innerHTML = '';
      lastTotalPages = 1;
      fixPaginationPlacement();
      return;
    }

    refs.categories.innerHTML = items
      .map(item => categoryCardTpl(item, activeFilter))
      .join('');

    if (refs.pagination && data.totalPages && Number(data.totalPages) > 1) {
      lastTotalPages = Number(data.totalPages) || 1;
      renderPagination(lastTotalPages, homeState.page);
    } else if (refs.pagination) {
      refs.pagination.innerHTML = '';
      lastTotalPages = 1;
    }

    fixPaginationPlacement();
  } catch (e) {
    refs.categories.innerHTML = `<li>Failed to load categories.</li>`;
    if (refs.pagination) refs.pagination.innerHTML = '';
    lastTotalPages = 1;
    fixPaginationPlacement();
    console.error(e);
  }
}

function categoryCardTpl(item, filter) {
  const name = item.name || item.filter || 'Category';
  const img = item.imgURL || item.imgUrl || item.image || '';

  return `
    <li class="category-card">
      <button
        type="button"
        class="category-card__btn"
        data-category="${escapeAttr(name)}"
        data-filter="${escapeAttr(filter)}"
        style="all: unset; cursor: pointer; display:block; width:100%; height:100%;"
      >
        ${
    img
      ? `<img class="category-card__img" src="${img}" alt="${escapeAttr(
        name
      )}" loading="lazy" />`
      : ''
  }
        <div class="category-card__overlay">
          <p class="category-card__name">${escapeHtml(name)}</p>
          <p class="category-card__type">${escapeHtml(filter)}</p>
        </div>
      </button>
    </li>
  `;
}

// ========================
// Exercises
// ========================
async function loadAndRenderExercises() {
  if (!homeState.selectedCategory) return;

  showExercisesView();

  const { activeFilter, selectedCategory, keyword, page, limit } = homeState;

  if (!refs.exercisesSection || !refs.exercisesList) return;

  // ✅ Breadcrumb: "Exercises / abs"
  setMainTitle(selectedCategory.name);

  // ✅ прибираємо дубль заголовка справа
  if (refs.exercisesTitle) refs.exercisesTitle.textContent = '';

  const params = { page, limit };
  if (activeFilter === 'Muscles') params.muscles = selectedCategory.name;
  if (activeFilter === 'Body parts') params.bodypart = selectedCategory.name;
  if (activeFilter === 'Equipment') params.equipment = selectedCategory.name;
  if (keyword) params.keyword = keyword;

  try {
    const data = await api.getExercises(params);
    const items = data.results || data.data || data || [];

    if (!items.length) {
      refs.exercisesList.innerHTML = `<li style="padding:16px;">No exercises found.</li>`;
      if (refs.pagination && data.totalPages && Number(data.totalPages) > 1) {
        lastTotalPages = Number(data.totalPages) || 1;
        renderPagination(lastTotalPages, page);
      } else if (refs.pagination) {
        refs.pagination.innerHTML = '';
        lastTotalPages = 1;
      }
      fixPaginationPlacement();
      return;
    }

    refs.exercisesList.innerHTML = items.map(exerciseCardTpl).join('');

    if (refs.pagination && data.totalPages && Number(data.totalPages) > 1) {
      lastTotalPages = Number(data.totalPages) || 1;
      renderPagination(lastTotalPages, page);
    } else if (refs.pagination) {
      refs.pagination.innerHTML = '';
      lastTotalPages = 1;
    }

    fixPaginationPlacement();
  } catch (e) {
    console.error(e);
    refs.exercisesList.innerHTML = `<li style="padding:16px;">Failed to load exercises.</li>`;
    if (refs.pagination) refs.pagination.innerHTML = '';
    lastTotalPages = 1;
    fixPaginationPlacement();
  }
}

/* ✅ картка вправи */
function exerciseCardTpl(ex) {
  const id = ex._id || ex.id;

  const name = ex.name || 'Exercise';
  const ratingNum = Number(ex.rating ?? 0);
  const rating = Number.isFinite(ratingNum) ? ratingNum.toFixed(1) : '0.0';

  const bodyPart = ex.bodyPart || ex.bodypart || '-';
  const target = ex.target || '-';

  const burnedCalories = ex.burnedCalories ?? ex.calories ?? '-';

  // по макету завжди " / 3 min"
  const time = 3;

  return `
    <li class="exercise-card">
      <div class="exercise-card__top">
        <div class="exercise-card__top-left">
          <span class="exercise-card__badge">WORKOUT</span>

          <span class="exercise-card__rating">
            ${rating}
            <img
              class="exercise-card__star-img"
              src="./img/star.png"
              alt=""
              aria-hidden="true"
            />
          </span>
        </div>

        <button class="exercise-card__start" type="button" data-exercise-id="${escapeAttr(
    id
  )}">
          Start <span class="exercise-card__arrow">→</span>
        </button>
      </div>

      <div class="exercise-card__name-row">
        <span class="exercise-card__icon-wrap" aria-hidden="true">
          <img class="exercise-card__icon" src="./img/icon.png" alt="" />
        </span>
        <h4 class="exercise-card__name">${escapeHtml(name)}</h4>
      </div>

      <p class="exercise-card__meta">
        <span>Burned calories: ${escapeHtml(String(burnedCalories))} / ${time} min</span>
        <span>Body part: <b>${escapeHtml(String(bodyPart))}</b></span>
        <span>Target: <b>${escapeHtml(String(target))}</b></span>
      </p>
    </li>
  `;
}

// ========================
// Events
// ========================
function bindEvents() {
  // tabs click
  refs.tabs.addEventListener('click', async e => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;

    const next = btn.dataset.filter;
    if (next === homeState.activeFilter) return;

    homeState.activeFilter = next;
    homeState.page = 1;
    homeState.selectedCategory = null;
    homeState.keyword = '';

    if (refs.searchInput) refs.searchInput.value = '';

    renderTabs();
    await loadAndRenderCategories();
  });

  // categories click
  refs.categories.addEventListener('click', async e => {
    const btn = e.target.closest('[data-category]');
    if (!btn) return;

    // ✅ якщо клікнули на start в карточці вправ — НЕ обробляємо як category
    if (e.target.closest('[data-exercise-id]')) return;

    const category = btn.dataset.category;
    const filter = btn.dataset.filter;

    homeState.selectedCategory = { name: category, filter };
    homeState.page = 1;
    homeState.keyword = '';

    if (refs.searchInput) refs.searchInput.value = '';

    await loadAndRenderExercises();
  });

  // ✅ TOP SEARCH submit
  if (refs.searchForm) {
    refs.searchForm.addEventListener('submit', async e => {
      e.preventDefault();
      if (!homeState.selectedCategory) return;

      const value = (refs.searchInput?.value || '').trim();
      homeState.keyword = value;
      homeState.page = 1;

      await loadAndRenderExercises();
    });
  }

  // pagination click
  if (refs.pagination) {
    refs.pagination.addEventListener('click', async e => {
      const btn = e.target.closest('[data-page]');
      if (!btn) return;

      const page = Number(btn.dataset.page);
      if (!Number.isFinite(page) || page === homeState.page) return;

      homeState.page = page;

      if (homeState.selectedCategory) {
        await loadAndRenderExercises();
      } else {
        await loadAndRenderCategories();
      }
    });
  }

  // ✅ Start click -> відкриває модалку
  document.addEventListener('click', async e => {
    const btn = e.target.closest('[data-exercise-id]');
    if (!btn) return;

    e.preventDefault();

    const id = btn.dataset.exerciseId;
    await openExerciseModal(id);
  });
}

// ========================
// ✅ Pagination render (FIXED)
// mobile: 3 pages window (123, 234, 345...)
// desktop: до 10
// ========================
function renderPagination(totalPages, currentPage) {
  if (!refs.pagination) return;

  const pages = Math.max(1, Number(totalPages) || 1);

  // якщо сторінка 1/1 — не показуємо пагінацію
  if (pages <= 1) {
    refs.pagination.innerHTML = '';
    return;
  }

  const pageList = getPagesForPagination(pages, currentPage);

  const buttons = pageList
    .map(p => {
      const isActive = p === currentPage;
      return `
        <button
          type="button"
          class="pagination__btn ${isActive ? 'is-active' : ''}"
          data-page="${p}"
          ${isActive ? 'aria-current="page"' : ''}
        >${p}</button>`;
    })
    .join('');

  refs.pagination.innerHTML = buttons;
}

// ========================
// helpers
// ========================
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
function escapeAttr(str) {
  return escapeHtml(str).replaceAll('`', '&#096;');
}
