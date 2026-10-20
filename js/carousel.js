(function () {
  const INTERVAL_MS = 6000;

  const carousel = document.querySelector('.carousel');
  const slides = document.querySelectorAll('.slide');
  const dotsContainer = document.querySelector('.carousel-dots');
  let current = 0;
  let timer = null;

  const dots = Array.from(slides, (_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', 'Go to photo ' + (i + 1));
    dot.addEventListener('click', () => { goTo(i, true); start(); });
    dotsContainer.appendChild(dot);
    return dot;
  });

  function goTo(index, manual) {
    carousel.classList.toggle('manual', !!manual);
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function start() {
    stop();
    timer = setInterval(() => goTo(current + 1), INTERVAL_MS);
  }

  function stop() {
    clearInterval(timer);
  }

  document.querySelector('.carousel-btn.prev').addEventListener('click', () => { goTo(current - 1, true); start(); });
  document.querySelector('.carousel-btn.next').addEventListener('click', () => { goTo(current + 1, true); start(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { goTo(current - 1, true); start(); }
    if (e.key === 'ArrowRight') { goTo(current + 1, true); start(); }
  });

  // Pause while the tab is hidden so slides don't pile up
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  goTo(0);
  start();
})();
