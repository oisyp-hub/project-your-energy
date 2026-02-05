const path = window.location.pathname;

const home = document.querySelector('[data-nav="home"]');
const fav = document.querySelector('[data-nav="favorites"]');

home?.classList.remove('active');
fav?.classList.remove('active');

if (path.endsWith('page-2.html')) {
  fav?.classList.add('active');
} else {
  home?.classList.add('active');
}
