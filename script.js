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
