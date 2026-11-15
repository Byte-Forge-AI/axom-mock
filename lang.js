// Language switch shared by all pages. Storage is optional (try/catch).
var LANG = 'en';
try { LANG = localStorage.getItem('axom_lang') || 'en'; } catch (e) {}
function applyLang() {
  document.documentElement.lang = LANG === 'as' ? 'as' : 'en';
  document.querySelectorAll('[data-en]').forEach(function (el) {
    el.textContent = el.getAttribute('data-' + LANG) || el.getAttribute('data-en');
  });
  var b = document.getElementById('lang');
  if (b) b.textContent = LANG === 'en' ? 'অসমীয়া' : 'English';
  if (window.onLangChange) window.onLangChange();
}
document.addEventListener('DOMContentLoaded', function () {
  var b = document.getElementById('lang');
  if (b) b.addEventListener('click', function () {
    LANG = LANG === 'en' ? 'as' : 'en';
    try { localStorage.setItem('axom_lang', LANG); } catch (e) {}
    applyLang();
  });
  applyLang();
});
