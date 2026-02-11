import{b as y,o as T,a as w,i as q}from"./assets/subscription-BcEsYp59.js";/* empty css                      */const b="ye_quote_daily_v1";function M(){return new Date().toISOString().slice(0,10)}const S={load(t){try{const i=localStorage.getItem(t);return i?JSON.parse(i):null}catch{return null}},save(t,i){localStorage.setItem(t,JSON.stringify(i))},async getDailyQuote(t){const i=this.load(b),a=M();if(i&&i.date===a&&i.data)return i.data;const n=await t();return this.save(b,{date:a,data:n}),n}},s={activeFilter:"Muscles",page:1,selectedCategory:null,keyword:"",categoriesLimit:12,exercisesLimit:10},L=600;let l=1;function A(t,i){if(t<=3)return Array.from({length:t},(n,c)=>c+1);let a=Number(i)||1;return a>t-2&&(a=t-2),a<1&&(a=1),[a,a+1,a+2]}function E(t,i){if(window.matchMedia(`(max-width: ${L}px)`).matches)return A(t,i);const n=Math.min(t,10);return Array.from({length:n},(c,r)=>r+1)}const e={quoteText:document.querySelector(".quote-card__text"),quoteAuthor:document.querySelector(".quote-card__author"),tabs:document.querySelector(".exercises__tabs"),categories:document.querySelector("#categories-list")||document.querySelector(".categories"),pagination:document.querySelector(".pagination"),exercisesSection:document.querySelector("#exercises-section"),exercisesTitle:document.querySelector("#exercises-title"),exercisesList:document.querySelector("#exercises-list"),mainTitle:document.querySelector(".exercises__title"),searchForm:document.querySelector("#top-search-form"),searchInput:document.querySelector("#top-search-input")},$=["Muscles","Body parts","Equipment"];function d(){if(!e.pagination)return;const t=e.pagination,i=window.matchMedia(`(max-width: ${L}px)`).matches,a=!!s.selectedCategory;if(i){const n=document.querySelector(".quote-card");n&&n.insertAdjacentElement("beforebegin",t);return}a?e.exercisesList?e.exercisesList.insertAdjacentElement("afterend",t):e.exercisesSection&&e.exercisesSection.insertAdjacentElement("afterend",t):e.categories&&e.categories.insertAdjacentElement("afterend",t)}async function C(){if(!e.tabs||!e.categories){console.warn("Home markup not found: check selectors in home.js");return}s.activeFilter=s.activeFilter||"Muscles",s.page=s.page||1,s.categoriesLimit=s.categoriesLimit||12,s.exercisesLimit=s.exercisesLimit||10,s.selectedCategory=null,s.keyword="",_(),await F(),await x(),I(),d(),setTimeout(d,0),setTimeout(d,100),window.addEventListener("resize",()=>{e.pagination&&p(l,s.page),d()})}async function F(){try{const t=await S.getDailyQuote(()=>y.getQuote()),i=t.quote||t.text||"",a=t.author||"Unknown";e.quoteText&&(e.quoteText.textContent=i),e.quoteAuthor&&(e.quoteAuthor.textContent=a)}catch(t){e.quoteText&&(e.quoteText.textContent="Failed to load quote."),e.quoteAuthor&&(e.quoteAuthor.textContent=""),console.error(t)}}function _(){e.tabs.innerHTML=$.map(t=>`
      <button
        class="exercises__tab ${t===s.activeFilter?"is-active":""}"
        type="button"
        data-filter="${t}"
        role="tab"
        aria-selected="${t===s.activeFilter?"true":"false"}"
      >
        ${t}
      </button>`).join("")}function v(t=""){if(e.mainTitle){if(!t){e.mainTitle.textContent="Exercises";return}e.mainTitle.innerHTML=`Exercises <span class="exercises__subtitle">/ ${u(t)}</span>`}}function H(){e.categories.classList.remove("is-hidden"),e.exercisesSection&&e.exercisesSection.classList.add("is-hidden"),e.exercisesList&&(e.exercisesList.innerHTML=""),e.searchForm&&e.searchForm.classList.add("is-hidden"),v(""),e.exercisesTitle&&(e.exercisesTitle.textContent="")}function N(){if(e.categories.classList.add("is-hidden"),e.searchForm&&e.searchForm.classList.remove("is-hidden"),!e.exercisesSection){e.categories.classList.remove("is-hidden"),e.categories.innerHTML=`
      <li style="padding:16px;">
        ❗ Не знайдено блок <b>#exercises-section</b> у hero.html.
        Додай його (section з id="exercises-section", ul з id="exercises-list").
      </li>`;return}e.exercisesSection.classList.remove("is-hidden"),e.exercisesList||(e.exercisesSection.innerHTML=`
      <p style="padding:16px;">
        ❗ Не знайдено <b>#exercises-list</b> у hero.html.
        Додай ul з id="exercises-list".
      </p>`)}async function x(){H();try{const{activeFilter:t,page:i,categoriesLimit:a}=s,n=await y.getFilters({filter:t,page:i,limit:a}),c=n.results||n.data||n||[];if(!c.length){e.categories.innerHTML=`<li>No categories for "${t}"</li>`,e.pagination&&(e.pagination.innerHTML=""),l=1,d();return}e.categories.innerHTML=c.map(r=>k(r,t)).join(""),e.pagination&&n.totalPages&&Number(n.totalPages)>1?(l=Number(n.totalPages)||1,p(l,s.page)):e.pagination&&(e.pagination.innerHTML="",l=1),d()}catch(t){e.categories.innerHTML="<li>Failed to load categories.</li>",e.pagination&&(e.pagination.innerHTML=""),l=1,d(),console.error(t)}}function k(t,i){const a=t.name||t.filter||"Category",n=t.imgURL||t.imgUrl||t.image||"";return`
    <li class="category-card">
      <button
        type="button"
        class="category-card__btn"
        data-category="${g(a)}"
        data-filter="${g(i)}"
        style="all: unset; cursor: pointer; display:block; width:100%; height:100%;"
      >
        ${n?`<img class="category-card__img" src="${n}" alt="${g(a)}" loading="lazy" />`:""}
        <div class="category-card__overlay">
          <p class="category-card__name">${u(a)}</p>
          <p class="category-card__type">${u(i)}</p>
        </div>
      </button>
    </li>
  `}async function f(){if(!s.selectedCategory)return;N();const{activeFilter:t,selectedCategory:i,keyword:a,page:n,exercisesLimit:c}=s;if(!e.exercisesSection||!e.exercisesList)return;v(i.name),e.exercisesTitle&&(e.exercisesTitle.textContent="");const r={page:n,limit:c};t==="Muscles"&&(r.muscles=i.name),t==="Body parts"&&(r.bodypart=i.name),t==="Equipment"&&(r.equipment=i.name),a&&(r.keyword=a);try{const o=await y.getExercises(r),m=(o.results||o.data||o||[]).slice(0,c);if(!m.length){e.exercisesList.innerHTML='<li style="padding:16px;">No exercises found.</li>',e.pagination&&o.totalPages&&Number(o.totalPages)>1?(l=Number(o.totalPages)||1,p(l,n)):e.pagination&&(e.pagination.innerHTML="",l=1),d();return}e.exercisesList.innerHTML=m.map(P).join(""),e.pagination&&o.totalPages&&Number(o.totalPages)>1?(l=Number(o.totalPages)||1,p(l,n)):e.pagination&&(e.pagination.innerHTML="",l=1),d()}catch(o){console.error(o),e.exercisesList.innerHTML='<li style="padding:16px;">Failed to load exercises.</li>',e.pagination&&(e.pagination.innerHTML=""),l=1,d()}}function P(t){const i=t._id||t.id,a=t.name||"Exercise",n=Number(t.rating??0),c=Number.isFinite(n)?n.toFixed(1):"0.0",r=t.bodyPart||t.bodypart||"-",o=t.target||"-",h=t.burnedCalories??t.calories??"-";return`
    <li class="exercise-card">
      <div class="exercise-card__top">
        <div class="exercise-card__top-left">
          <span class="exercise-card__badge">WORKOUT</span>

          <span class="exercise-card__rating">
            ${c}
            <img
              class="exercise-card__star-img"
              src="./img/star.png"
              alt=""
              aria-hidden="true"
            />
          </span>
        </div>

        <button class="exercise-card__start" type="button" data-exercise-id="${g(i)}">
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
        <span>Burned calories: ${u(String(h))} / 3 min</span>
        <span>Body part: <b>${u(String(r))}</b></span>
        <span>Target: <b>${u(String(o))}</b></span>
      </p>
    </li>
  `}function I(){e.tabs.addEventListener("click",async t=>{const i=t.target.closest("[data-filter]");if(!i)return;const a=i.dataset.filter;a!==s.activeFilter&&(s.activeFilter=a,s.page=1,s.selectedCategory=null,s.keyword="",e.searchInput&&(e.searchInput.value=""),_(),await x())}),e.categories.addEventListener("click",async t=>{const i=t.target.closest("[data-category]");if(!i||t.target.closest("[data-exercise-id]"))return;const a=i.dataset.category,n=i.dataset.filter;s.selectedCategory={name:a,filter:n},s.page=1,s.keyword="",e.searchInput&&(e.searchInput.value=""),await f()}),e.searchForm&&e.searchForm.addEventListener("submit",async t=>{var a;if(t.preventDefault(),!s.selectedCategory)return;const i=(((a=e.searchInput)==null?void 0:a.value)||"").trim();s.keyword=i,s.page=1,await f()}),e.pagination&&e.pagination.addEventListener("click",async t=>{const i=t.target.closest("[data-page]");if(!i)return;const a=Number(i.dataset.page);!Number.isFinite(a)||a===s.page||(s.page=a,s.selectedCategory?await f():await x())}),document.addEventListener("click",async t=>{const i=t.target.closest("[data-exercise-id]");if(!i)return;t.preventDefault();const a=i.dataset.exerciseId;await T(a)})}function p(t,i){if(!e.pagination)return;const a=Math.max(1,Number(t)||1);if(a<=1){e.pagination.innerHTML="";return}const c=E(a,i).map(r=>{const o=r===i;return`
        <button
          type="button"
          class="pagination__btn ${o?"is-active":""}"
          data-page="${r}"
          ${o?'aria-current="page"':""}
        >${r}</button>`}).join("");e.pagination.innerHTML=c,d()}function u(t){return String(t).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function g(t){return u(t).replaceAll("`","&#096;")}function j(){const t=document.querySelector(".header-center");if(!t)return;const i=window.location.pathname,n=i.endsWith("/")||i.endsWith("index.html")?"home":"favorites";t.querySelectorAll(".nav-item").forEach(c=>{const r=c.dataset.nav===n;c.classList.toggle("active",r),r?c.setAttribute("aria-current","page"):c.removeAttribute("aria-current")})}document.addEventListener("DOMContentLoaded",()=>{j(),w(),q(),C()});
//# sourceMappingURL=index.js.map
