/* Bazaar Chai House (concept project)
   Plain JavaScript. Every page works without it; the script only adds the
   mobile menu, the "open now" badge, the menu filter and form checks. */

/* ---------- Opening hours (edit here) ---------- */
const OPEN_MINUTES = 6 * 60 + 30;   // 6:30 am
const CLOSE_MINUTES = 23 * 60;      // 11:00 pm
const TIME_ZONE = 'Asia/Kolkata';

/* The café's local time, whatever time zone the visitor is in */
function cafeNow() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(new Date());
  const get = type => Number(parts.find(p => p.type === type).value);
  return get('hour') * 60 + get('minute');
}
function cafeToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(new Date()); // YYYY-MM-DD
}

/* ---------- Mobile menu ---------- */
const navToggle = document.getElementById('nav-toggle');
const siteNav = document.getElementById('site-nav');
function setNav(open) {
  siteNav.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
navToggle.addEventListener('click', () => setNav(!siteNav.classList.contains('is-open')));
siteNav.addEventListener('click', e => { if (e.target.closest('a')) setNav(false); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && siteNav.classList.contains('is-open')) { setNav(false); navToggle.focus(); }
});
document.addEventListener('click', e => {
  if (siteNav.classList.contains('is-open') && !e.target.closest('.site-header')) setNav(false);
});
window.matchMedia('(min-width: 761px)').addEventListener('change', e => { if (e.matches) setNav(false); });

/* ---------- "Open now" badge ---------- */
function formatTime(minutes) {
  const h = Math.floor(minutes / 60), m = minutes % 60;
  const suffix = h >= 12 ? 'pm' : 'am';
  return (h % 12 || 12) + (m ? ':' + String(m).padStart(2, '0') : ':00') + ' ' + suffix;
}
document.querySelectorAll('[data-open-status]').forEach(el => {
  const now = cafeNow();
  const open = now >= OPEN_MINUTES && now < CLOSE_MINUTES;
  el.dataset.state = open ? 'open' : 'closed';
  el.querySelector('[data-open-text]').textContent = open
    ? 'Open now, until ' + formatTime(CLOSE_MINUTES)
    : 'Closed now, opens at ' + formatTime(OPEN_MINUTES);
});

/* ---------- Menu filter ---------- */
const groups = [...document.querySelectorAll('[data-group]')];
const filterHost = document.getElementById('menu-filter');
if (filterHost && groups.length) {
  const count = document.getElementById('menu-count');
  const labels = [['all', 'All']].concat(groups.map(g => [g.dataset.group, g.dataset.label]));
  labels.forEach(([key, label], i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tab';
    b.dataset.filter = key;
    b.textContent = label;
    b.setAttribute('aria-pressed', String(i === 0));
    filterHost.appendChild(b);
  });
  count.textContent = 'Showing ' + groups.reduce((n, g) => n + g.querySelectorAll('.menu-item').length, 0) + ' items';
  filterHost.addEventListener('click', e => {
    const btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    const key = btn.dataset.filter;
    filterHost.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    let shown = 0;
    groups.forEach(g => {
      const visible = key === 'all' || g.dataset.group === key;
      g.hidden = !visible;
      if (visible) shown += g.querySelectorAll('.menu-item').length;
    });
    count.textContent = 'Showing ' + shown + ' items';
  });
}

/* ---------- Reservation form (demo: nothing is sent) ---------- */
const form = document.getElementById('reserve-form');
if (form) {
  const done = document.getElementById('reserve-done');
  const doneName = document.getElementById('done-name');
  const again = document.getElementById('reserve-again');
  const dateInput = form.elements['date'];
  dateInput.min = cafeToday();

  const checks = {
    name: v => v.trim() ? '' : 'Enter your name.',
    email: v => /^\S+@\S+\.\S+$/.test(v.trim()) ? '' : 'Enter an email address like name@example.com.',
    date: v => v && v >= cafeToday() ? '' : 'Choose a date from today onwards.',
    time: v => v && v >= '06:30' && v <= '22:30' ? '' : 'Choose a time between 6:30 am and 10:30 pm.'
  };

  function validate(field) {
    const input = form.elements[field];
    const message = checks[field](input.value);
    const error = document.getElementById(field + '-error');
    error.textContent = message;
    error.hidden = !message;
    if (message) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    return !message;
  }

  Object.keys(checks).forEach(field => {
    form.elements[field].addEventListener('blur', () => validate(field));
    form.elements[field].addEventListener('input', () => {
      if (form.elements[field].getAttribute('aria-invalid')) validate(field);
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const failed = Object.keys(checks).filter(field => !validate(field));
    if (failed.length) { form.elements[failed[0]].focus(); return; }
    doneName.textContent = form.elements['name'].value.trim();
    form.hidden = true;
    done.hidden = false;
    done.focus();
    form.reset();
  });

  again.addEventListener('click', () => {
    done.hidden = true;
    form.hidden = false;
    form.elements['name'].focus();
  });
}

document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });


/* ---------- Progressive reveal ---------- */
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
  revealItems.forEach(item => revealObserver.observe(item));
} else { revealItems.forEach(item => item.classList.add('is-visible')); }
