function initTheme() {
  var theme = localStorage.getItem('theme') || 'light';
  var btn = document.getElementById('themeToggle');
  if (!btn) return;
  var icon = btn.querySelector('.material-symbols-outlined');
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    if (icon) icon.textContent = 'light_mode';
  } else {
    document.documentElement.classList.remove('dark');
    if (icon) icon.textContent = 'dark_mode';
  }
}

function toggleTheme() {
  var isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  var btn = document.getElementById('themeToggle');
  if (!btn) return;
  var icon = btn.querySelector('.material-symbols-outlined');
  if (icon) icon.textContent = isDark ? 'light_mode' : 'dark_mode';
}

function getBaseUrl() {
  var path = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
  var base = path.substring(0, path.lastIndexOf('/') + 1);
  return base || '/';
}
