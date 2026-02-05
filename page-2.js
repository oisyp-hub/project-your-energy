import{i as A,o as m,a as u}from"./assets/subscription-i6W6BN63.js";/* empty css                      */const p=window.location.pathname,a=document.querySelector('[data-nav="home"]'),s=document.querySelector('[data-nav="favorites"]');a==null||a.classList.remove("active");s==null||s.classList.remove("active");p.endsWith("page-2.html")?s==null||s.classList.add("active"):a==null||a.classList.add("active");A();const d="yourEnergy:favorites",h=new URL("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAPCAYAAADUFP50AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAo0lEQVR42mNgQAIaGhoKKioq+4H4PwwrKyvfB+IABnwAqLAfqtAfyLYHYVVV1fkgMWyKHYCSCSAMtW0/jA/F80E2w/hw24Gc+8hOIxLbwzSDnDMfnzegLvqPLki5RmjI1sMUA8XjidKIrACX+CDRCIpXWISD/IrsX+qFKiipgVIMgeQIsv08umkGQMH3IM0gm9ExUsKvxzARGn/92DRCsT+yBgBhGXxwqC3lSwAAAABJRU5ErkJggg==",import.meta.url).href,r=document.querySelector("#favorites-list"),f=document.getElementById("favorites-right");function v(){try{const e=localStorage.getItem(d),o=e?JSON.parse(e):[];return Array.isArray(o)?o:[]}catch{return[]}}function y(e){localStorage.setItem(d,JSON.stringify(e)),window.dispatchEvent(new CustomEvent("favorites:changed"))}function w(e){const o=v().filter(n=>(n==null?void 0:n._id)!==e);y(o)}async function E(){var n,i;const e=document.getElementById("fav-quote-text"),o=document.getElementById("fav-quote-author");if(e){e.textContent="Loading quote...",o&&(o.textContent="");try{let t=null;if(typeof((n=u)==null?void 0:n.getQuote)=="function")t=await u.getQuote();else if(typeof((i=u)==null?void 0:i.getQuoteOfTheDay)=="function")t=await u.getQuoteOfTheDay();else throw new Error("Quote method not found in api. Need api.getQuote() or api.getQuoteOfTheDay()");const c=(t==null?void 0:t.quote)||(t==null?void 0:t.text)||(t==null?void 0:t.content)||(t==null?void 0:t.message),l=(t==null?void 0:t.author)||(t==null?void 0:t.name);e.textContent=c||"No quote available",o&&(o.textContent=l?`— ${l}`:"")}catch(t){console.error("❌ Quote load failed:",t),e.textContent="Failed to load quote. Please try again later.",o&&(o.textContent="")}}}function g(){if(!r)return;const e=v();r.innerHTML="";const o=e.length===0;f&&f.classList.toggle("is-empty",o),!o&&(r.innerHTML=e.map(n=>`
      <li class="fav-exercise" data-id="${n._id}">
        <div class="fav-exercise__top">
          <span class="fav-exercise__badge">WORKOUT</span>

          <button class="fav-exercise__trash" type="button" data-remove-fav aria-label="Remove from favorites">
            <img class="fav-exercise__trash-icon" src="${h}" alt="" aria-hidden="true" />
          </button>

          <button class="fav-exercise__start" type="button">Start →</button>
        </div>

        <h3 class="fav-exercise__title">${n.name}</h3>

        <p class="fav-exercise__meta">
          Burned calories: ${n.burnedCalories} / 3 min · Target: ${n.target}
        </p>
      </li>
    `).join(""))}r==null||r.addEventListener("click",e=>{var t;const o=e.target.closest("[data-remove-fav]");if(o){e.preventDefault(),e.stopPropagation();const c=o.closest(".fav-exercise"),l=(t=c==null?void 0:c.dataset)==null?void 0:t.id;if(!l)return;w(l);return}const n=e.target.closest(".fav-exercise");if(!n)return;const i=n.dataset.id;i&&m(i)});window.addEventListener("favorites:changed",g);document.addEventListener("DOMContentLoaded",()=>{E(),g()});
//# sourceMappingURL=page-2.js.map
