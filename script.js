// language toggle (Hindi Devanagari / English Roman)
const langButtons = document.querySelectorAll('.lang-btn');
const savedLang = localStorage.getItem('site-lang');
if (savedLang === 'en') {
  document.body.classList.add('lang-en-active');
  langButtons.forEach(b => b.classList.toggle('active', b.dataset.lang === 'en'));
}
langButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const lang = btn.dataset.lang;
    langButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.body.classList.toggle('lang-en-active', lang === 'en');
    localStorage.setItem('site-lang', lang);
  });
});

// like buttons — uses free CounterAPI (api.counterapi.dev) so likes are
// real and visible to everyone, not just stored on one device
const LIKE_NAMESPACE = 'inner-voice-rv-ravi';
const likeButtons = document.querySelectorAll('.like-btn');

async function getCounter(poemId, action) {
  const url = `https://api.counterapi.dev/v1/${LIKE_NAMESPACE}/${poemId}${action ? '/' + action : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('counter request failed');
  const data = await res.json();
  return typeof data.count === 'number' ? data.count : (data.value ?? 0);
}

likeButtons.forEach((btn) => {
  const poemId = btn.dataset.poem;
  const countEl = btn.querySelector('.like-count');
  const heartEl = btn.querySelector('.heart');
  const likedKey = `liked-${poemId}`;

  if (localStorage.getItem(likedKey)) {
    btn.classList.add('liked');
    if (heartEl) heartEl.textContent = '❤️';
  }

  getCounter(poemId).then(count => {
    countEl.textContent = count;
  }).catch(() => {
    countEl.textContent = '0';
  });

  btn.addEventListener('click', async () => {
    if (localStorage.getItem(likedKey)) return; // ek device se ek hi like
    btn.disabled = true;
    try {
      const count = await getCounter(poemId, 'up');
      countEl.textContent = count;
      btn.classList.add('liked');
      if (heartEl) heartEl.textContent = '❤️';
      localStorage.setItem(likedKey, '1');
    } catch (err) {
      // network fail hua toh chhup chaap ignore, user ko error nahi dikhana
    } finally {
      btn.disabled = false;
    }
  });
});

// category filter pills
const pills = document.querySelectorAll('.pill');
const poems = document.querySelectorAll('.poem');
pills.forEach(pill => {
  pill.addEventListener('click', () => {
    pills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    const filter = pill.dataset.filter;
    poems.forEach(poem => {
      const matches = filter === 'all' || poem.dataset.category === filter;
      poem.classList.toggle('hidden', !matches);
    });
  });
});

// footer year
document.getElementById('year').textContent = new Date().getFullYear();

// brush divider draws itself when it scrolls into view
const dividers = document.querySelectorAll('.brush-divider');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('in-view');
  });
}, { threshold: 0.4 });
dividers.forEach(d => io.observe(d));

// share button: copies the poem text + page link, so user can paste on WhatsApp/Instagram
document.querySelectorAll('.share-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const poemId = btn.dataset.poem;
    const poemEl = document.getElementById(poemId);
    const title = poemEl.querySelector('.poem-title').innerText;
    const body = poemEl.querySelector('.poem-body').innerText;
    const url = `${location.origin}${location.pathname}#${poemId}`;
    const text = `${title}\n\n${body}\n\n${url}`;

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
      } else {
        await navigator.clipboard.writeText(text);
        btn.textContent = 'कॉपी हो गया ✓';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'शेयर करें ⤴';
          btn.classList.remove('copied');
        }, 1800);
      }
    } catch (err) {
      // user cancelled share sheet — no action needed
    }
  });
});
