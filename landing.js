// Landing page interactions: scroll reveals, stat counters,
// FAQ accordion, and secondary sign-up triggers.

document.body.classList.add("js");

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// 1. Scroll reveal
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((el) => {
  if (prefersReducedMotion) {
    el.classList.add("revealed");
  } else {
    revealObserver.observe(el);
  }
});

// 2. Animated stat counters
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

const statsStrip = document.querySelector(".stats-strip");
if (statsStrip) {
  const counters = statsStrip.querySelectorAll(".stat-number");
  const runCounters = () =>
    counters.forEach((el) => {
      if (prefersReducedMotion) {
        el.textContent = parseInt(el.dataset.count, 10).toLocaleString();
      } else {
        animateCounter(el);
      }
    });

  if (prefersReducedMotion) {
    runCounters();
  } else {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          runCounters();
          statsObserver.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    statsObserver.observe(statsStrip);
  }
}

// Landing page cosmetic enhancements: scroll reveals + stat counters.
// Critical interactions (modals, FAQ, forms) live in script.js so the
// page never depends on this file for core functionality.
