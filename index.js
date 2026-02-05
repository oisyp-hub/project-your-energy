import{a as x,o as L,i as q}from"./assets/subscription-i6W6BN63.js";/* empty css                      */const h="ye_quote_daily_v1";function T(){return new Date().toISOString().slice(0,10)}const w={load(e){try{const i=localStorage.getItem(e);return i?JSON.parse(i):null}catch{return null}},save(e,i){localStorage.setItem(e,JSON.stringify(i))},async getDailyQuote(e){const i=this.load(h),a=T();if(i&&i.date===a&&i.data)return i.data;const n=await e();return this.save(h,{date:a,data:n}),n}},r={activeFilter:"Muscles",page:1,limit:10,selectedCategory:null,keyword:""},b=600;let l=1;function S(e,i){if(e<=3)return Array.from({length:e},(n,s)=>s+1);let a=Number(i)||1;return a>e-2&&(a=e-2),a<1&&(a=1),[a,a+1,a+2]}function M(e,i){if(window.matchMedia(`(max-width: ${b}px)`).matches)return S(e,i);const n=Math.min(e,10);return Array.from({length:n},(s,o)=>o+1)}const t={quoteText:document.querySelector(".quote-card__text"),quoteAuthor:document.querySelector(".quote-card__author"),tabs:document.querySelector(".exercises__tabs"),categories:document.querySelector("#categories-list")||document.querySelector(".categories"),pagination:document.querySelector(".pagination"),exercisesSection:document.querySelector("#exercises-section"),exercisesTitle:document.querySelector("#exercises-title"),exercisesList:document.querySelector("#exercises-list"),mainTitle:document.querySelector(".exercises__title"),searchForm:document.querySelector("#top-search-form"),searchInput:document.querySelector("#top-search-input")},A=["Muscles","Body parts","Equipment"];function d(){if(!t.pagination)return;const e=document.querySelector(".exercises__container")||t.pagination.closest(".exercises__container")||t.pagination.parentElement;if(!e)return;const i=t.pagination;let a=e.querySelector("[data-pagination-home]");a||(a=document.createElement("span"),a.dataset.paginationHome="1",a.hidden=!0,i.parentNode.insertBefore(a,i));const n=window.matchMedia(`(max-width: ${b}px)`).matches,s=document.querySelector(".quote-card")||e.querySelector(".quote-card")||e.querySelector("[data-quote]");n&&s?s.insertAdjacentElement("beforebegin",i):a.insertAdjacentElement("afterend",i)}async function E(){if(!t.tabs||!t.categories){console.warn("Home markup not found: check selectors in home.js");return}r.activeFilter=r.activeFilter||"Muscles",r.page=r.page||1,r.limit=r.limit||10,r.selectedCategory=null,r.keyword="",_(),await H(),await y(),N(),d(),setTimeout(d,0),setTimeout(d,100),window.addEventListener("resize",()=>{t.pagination&&m(l,r.page),d()})}async function H(){try{const e=await w.getDailyQuote(()=>x.getQuote()),i=e.quote||e.text||"",a=e.author||"Unknown";t.quoteText&&(t.quoteText.textContent=i),t.quoteAuthor&&(t.quoteAuthor.textContent=a)}catch(e){t.quoteText&&(t.quoteText.textContent="Failed to load quote."),t.quoteAuthor&&(t.quoteAuthor.textContent=""),console.error(e)}}function _(){t.tabs.innerHTML=A.map(e=>`
      <button
        class="exercises__tab ${e===r.activeFilter?"is-active":""}"
        type="button"
        data-filter="${e}"
        role="tab"
        aria-selected="${e===r.activeFilter?"true":"false"}"
      >
        ${e}
      </button>`).join("")}function v(e=""){if(t.mainTitle){if(!e){t.mainTitle.textContent="Exercises";return}t.mainTitle.innerHTML=`Exercises <span class="exercises__subtitle">/ ${u(e)}</span>`}}function $(){t.categories.classList.remove("is-hidden"),t.exercisesSection&&t.exercisesSection.classList.add("is-hidden"),t.exercisesList&&(t.exercisesList.innerHTML=""),t.searchForm&&t.searchForm.classList.add("is-hidden"),v(""),t.exercisesTitle&&(t.exercisesTitle.textContent="")}function F(){if(t.categories.classList.add("is-hidden"),t.searchForm&&t.searchForm.classList.remove("is-hidden"),!t.exercisesSection){t.categories.classList.remove("is-hidden"),t.categories.innerHTML=`
      <li style="padding:16px;">
        ❗ Не знайдено блок <b>#exercises-section</b> у hero.html.
        Додай його (section з id="exercises-section", ul з id="exercises-list").
      </li>`;return}t.exercisesSection.classList.remove("is-hidden"),t.exercisesList||(t.exercisesSection.innerHTML=`
      <p style="padding:16px;">
        ❗ Не знайдено <b>#exercises-list</b> у hero.html.
        Додай ul з id="exercises-list".
      </p>`)}async function y(){$();try{const{activeFilter:e,page:i,limit:a}=r,n=await x.getFilters({filter:e,page:i,limit:a}),s=n.results||n.data||n||[];if(!s.length){t.categories.innerHTML=`<li>No categories for "${e}"</li>`,t.pagination&&(t.pagination.innerHTML=""),l=1,d();return}t.categories.innerHTML=s.map(o=>C(o,e)).join(""),t.pagination&&n.totalPages&&Number(n.totalPages)>1?(l=Number(n.totalPages)||1,m(l,r.page)):t.pagination&&(t.pagination.innerHTML="",l=1),d()}catch(e){t.categories.innerHTML="<li>Failed to load categories.</li>",t.pagination&&(t.pagination.innerHTML=""),l=1,d(),console.error(e)}}function C(e,i){const a=e.name||e.filter||"Category",n=e.imgURL||e.imgUrl||e.image||"";return`
    <li class="category-card">
      <button
        type="button"
        class="category-card__btn"
        data-category="${p(a)}"
        data-filter="${p(i)}"
        style="all: unset; cursor: pointer; display:block; width:100%; height:100%;"
      >
        ${n?`<img class="category-card__img" src="${n}" alt="${p(a)}" loading="lazy" />`:""}
        <div class="category-card__overlay">
          <p class="category-card__name">${u(a)}</p>
          <p class="category-card__type">${u(i)}</p>
        </div>
      </button>
    </li>
  `}async function f(){if(!r.selectedCategory)return;F();const{activeFilter:e,selectedCategory:i,keyword:a,page:n,limit:s}=r;if(!t.exercisesSection||!t.exercisesList)return;v(i.name),t.exercisesTitle&&(t.exercisesTitle.textContent="");const o={page:n,limit:s};e==="Muscles"&&(o.muscles=i.name),e==="Body parts"&&(o.bodypart=i.name),e==="Equipment"&&(o.equipment=i.name),a&&(o.keyword=a);try{const c=await x.getExercises(o),g=c.results||c.data||c||[];if(!g.length){t.exercisesList.innerHTML='<li style="padding:16px;">No exercises found.</li>',t.pagination&&c.totalPages&&Number(c.totalPages)>1?(l=Number(c.totalPages)||1,m(l,n)):t.pagination&&(t.pagination.innerHTML="",l=1),d();return}t.exercisesList.innerHTML=g.map(k).join(""),t.pagination&&c.totalPages&&Number(c.totalPages)>1?(l=Number(c.totalPages)||1,m(l,n)):t.pagination&&(t.pagination.innerHTML="",l=1),d()}catch(c){console.error(c),t.exercisesList.innerHTML='<li style="padding:16px;">Failed to load exercises.</li>',t.pagination&&(t.pagination.innerHTML=""),l=1,d()}}function k(e){const i=e._id||e.id,a=e.name||"Exercise",n=Number(e.rating??0),s=Number.isFinite(n)?n.toFixed(1):"0.0",o=e.bodyPart||e.bodypart||"-",c=e.target||"-",g=e.burnedCalories??e.calories??"-";return`
    <li class="exercise-card">
      <div class="exercise-card__top">
        <div class="exercise-card__top-left">
          <span class="exercise-card__badge">WORKOUT</span>

          <span class="exercise-card__rating">
            ${s}
            <img
              class="exercise-card__star-img"
              src="./img/star.png"
              alt=""
              aria-hidden="true"
            />
          </span>
        </div>

        <button class="exercise-card__start" type="button" data-exercise-id="${p(i)}">
          Start <span class="exercise-card__arrow">→</span>
        </button>
      </div>

      <div class="exercise-card__name-row">
        <span class="exercise-card__icon-wrap" aria-hidden="true">
          <img class="exercise-card__icon" src="./img/icon.png" alt="" />
        </span>
        <h4 class="exercise-card__name">${u(a)}</h4>
      </div>

      <p class="exercise-card__meta">
        <span>Burned calories: ${u(String(g))} / 3 min</span>
        <span>Body part: <b>${u(String(o))}</b></span>
        <span>Target: <b>${u(String(c))}</b></span>
      </p>
    </li>
  `}function N(){t.tabs.addEventListener("click",async e=>{const i=e.target.closest("[data-filter]");if(!i)return;const a=i.dataset.filter;a!==r.activeFilter&&(r.activeFilter=a,r.page=1,r.selectedCategory=null,r.keyword="",t.searchInput&&(t.searchInput.value=""),_(),await y())}),t.categories.addEventListener("click",async e=>{const i=e.target.closest("[data-category]");if(!i||e.target.closest("[data-exercise-id]"))return;const a=i.dataset.category,n=i.dataset.filter;r.selectedCategory={name:a,filter:n},r.page=1,r.keyword="",t.searchInput&&(t.searchInput.value=""),await f()}),t.searchForm&&t.searchForm.addEventListener("submit",async e=>{var a;if(e.preventDefault(),!r.selectedCategory)return;const i=(((a=t.searchInput)==null?void 0:a.value)||"").trim();r.keyword=i,r.page=1,await f()}),t.pagination&&t.pagination.addEventListener("click",async e=>{const i=e.target.closest("[data-page]");if(!i)return;const a=Number(i.dataset.page);!Number.isFinite(a)||a===r.page||(r.page=a,r.selectedCategory?await f():await y())}),document.addEventListener("click",async e=>{const i=e.target.closest("[data-exercise-id]");if(!i)return;e.preventDefault();const a=i.dataset.exerciseId;await L(a)})}function m(e,i){if(!t.pagination)return;const a=Math.max(1,Number(e)||1);if(a<=1){t.pagination.innerHTML="";return}const s=M(a,i).map(o=>{const c=o===i;return`
        <button
          type="button"
          class="pagination__btn ${c?"is-active":""}"
          data-page="${o}"
          ${c?'aria-current="page"':""}
        >${o}</button>`}).join("");t.pagination.innerHTML=s}function u(e){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function p(e){return u(e).replaceAll("`","&#096;")}function P(){const e=document.querySelector("[data-mobile-menu]"),i=document.querySelector("[data-menu-open]"),a=document.querySelectorAll("[data-menu-close]");if(!e||!i){console.warn("Mobile menu: markup not found",{menu:e,openBtn:i});return}const n=()=>{e.classList.add("is-open"),e.setAttribute("aria-hidden","false"),i.setAttribute("aria-expanded","true"),document.body.style.overflow="hidden"},s=()=>{e.classList.remove("is-open"),e.setAttribute("aria-hidden","true"),i.setAttribute("aria-expanded","false"),document.body.style.overflow=""};i.addEventListener("click",n),a.forEach(o=>o.addEventListener("click",s)),document.addEventListener("keydown",o=>{o.key==="Escape"&&s()})}function I(){const e=document.querySelector(".header-center");if(!e)return;const i=window.location.pathname,n=i.endsWith("/")||i.endsWith("index.html")?"home":"favorites";e.querySelectorAll(".nav-item").forEach(s=>{const o=s.dataset.nav===n;s.classList.toggle("active",o),o?s.setAttribute("aria-current","page"):s.removeAttribute("aria-current")})}document.addEventListener("DOMContentLoaded",()=>{I(),P(),q(),E()});
//# sourceMappingURL=index.js.map
