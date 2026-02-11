import{i as A,a as m,o as p,b as u}from"./assets/subscription-BcEsYp59.js";/* empty css                      */const h=window.location.pathname,a=document.querySelector('[data-nav="home"]'),s=document.querySelector('[data-nav="favorites"]');a==null||a.classList.remove("active");s==null||s.classList.remove("active");h.endsWith("page-2.html")?s==null||s.classList.add("active"):a==null||a.classList.add("active");A();document.addEventListener("DOMContentLoaded",()=>{m()});const f="yourEnergy:favorites",y=new URL("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAPCAYAAADUFP50AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAo0lEQVR42mNgQAIaGhoKKioq+4H4PwwrKyvfB+IABnwAqLAfqtAfyLYHYVVV1fkgMWyKHYCSCSAMtW0/jA/F80E2w/hw24Gc+8hOIxLbwzSDnDMfnzegLvqPLki5RmjI1sMUA8XjidKIrACX+CDRCIpXWISD/IrsX+qFKiipgVIMgeQIsv08umkGQMH3IM0gm9ExUsKvxzARGn/92DRCsT+yBgBhGXxwqC3lSwAAAABJRU5ErkJggg==",import.meta.url).href,i=document.querySelector("#favorites-list"),d=document.getElementById("favorites-right");function v(){try{const e=localStorage.getItem(f),n=e?JSON.parse(e):[];return Array.isArray(n)?n:[]}catch{return[]}}function w(e){localStorage.setItem(f,JSON.stringify(e)),window.dispatchEvent(new CustomEvent("favorites:changed"))}function E(e){const n=v().filter(o=>(o==null?void 0:o._id)!==e);w(n)}async function L(){var o,r;const e=document.getElementById("fav-quote-text"),n=document.getElementById("fav-quote-author");if(e){e.textContent="Loading quote...",n&&(n.textContent="");try{let t=null;if(typeof((o=u)==null?void 0:o.getQuote)=="function")t=await u.getQuote();else if(typeof((r=u)==null?void 0:r.getQuoteOfTheDay)=="function")t=await u.getQuoteOfTheDay();else throw new Error("Quote method not found in api. Need api.getQuote() or api.getQuoteOfTheDay()");const c=(t==null?void 0:t.quote)||(t==null?void 0:t.text)||(t==null?void 0:t.content)||(t==null?void 0:t.message),l=(t==null?void 0:t.author)||(t==null?void 0:t.name);e.textContent=c||"No quote available",n&&(n.textContent=l?`— ${l}`:"")}catch(t){console.error("❌ Quote load failed:",t),e.textContent="Failed to load quote. Please try again later.",n&&(n.textContent="")}}}function g(){if(!i)return;const e=v();i.innerHTML="";const n=e.length===0;d&&d.classList.toggle("is-empty",n),!n&&(i.innerHTML=e.map(o=>`
      <li class="fav-exercise" data-id="${o._id}">
        <div class="fav-exercise__top">
          <span class="fav-exercise__badge">WORKOUT</span>

          <button class="fav-exercise__trash" type="button" data-remove-fav aria-label="Remove from favorites">
            <img class="fav-exercise__trash-icon" src="${y}" alt="" aria-hidden="true" />
          </button>

          <button class="fav-exercise__start" type="button">Start →</button>
        </div>

        <h3 class="fav-exercise__title">${o.name}</h3>

        <p class="fav-exercise__meta">
          Burned calories: ${o.burnedCalories} / 3 min · Target: ${o.target}
        </p>
      </li>
    `).join(""))}i==null||i.addEventListener("click",e=>{var t;const n=e.target.closest("[data-remove-fav]");if(n){e.preventDefault(),e.stopPropagation();const c=n.closest(".fav-exercise"),l=(t=c==null?void 0:c.dataset)==null?void 0:t.id;if(!l)return;E(l);return}const o=e.target.closest(".fav-exercise");if(!o)return;const r=o.dataset.id;r&&p(r)});window.addEventListener("favorites:changed",g);document.addEventListener("DOMContentLoaded",()=>{L(),g()});
//# sourceMappingURL=page-2.js.map
