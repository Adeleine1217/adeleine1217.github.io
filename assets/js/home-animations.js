(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const statsGrid = document.querySelector(".stats-grid");
  const recommendationGrid = document.querySelector(".recommendation-grid");

  if (!statsGrid && !recommendationGrid) {
    return;
  }

  document.documentElement.classList.add("home-js-ready");

  const revealTargets = [
    ...document.querySelectorAll(".stats-grid .stat-card, .recommendation-grid .recommendation-card"),
  ];

  revealTargets.forEach((target, index) => {
    target.classList.add("home-reveal-target");
    target.style.setProperty("--home-reveal-index", index % 6);
  });

  if (reduceMotion) {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));

  const tiltTargets = [
    ...document.querySelectorAll(".stats-grid .stat-card, .recommendation-grid .recommendation-card"),
  ];

  tiltTargets.forEach((target) => {
    target.addEventListener("pointermove", (event) => {
      const rect = target.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      target.style.setProperty("--home-tilt-x", `${(-y * 2.5).toFixed(2)}deg`);
      target.style.setProperty("--home-tilt-y", `${(x * 3.5).toFixed(2)}deg`);
    });

    target.addEventListener("pointerleave", () => {
      target.style.removeProperty("--home-tilt-x");
      target.style.removeProperty("--home-tilt-y");
    });
  });

  if (!statsGrid) {
    return;
  }

  const statCards = [...statsGrid.querySelectorAll(".stat-card")];
  let activeIndex = 0;
  let timerId = null;

  const setActiveCard = () => {
    statCards.forEach((card, index) => {
      card.classList.toggle("is-active", index === activeIndex);
    });
    activeIndex = (activeIndex + 1) % statCards.length;
  };

  const startSequence = () => {
    if (timerId || statCards.length === 0) {
      return;
    }
    setActiveCard();
    timerId = window.setInterval(setActiveCard, 1450);
  };

  const stopSequence = () => {
    if (!timerId) {
      return;
    }
    window.clearInterval(timerId);
    timerId = null;
    statCards.forEach((card) => card.classList.remove("is-active"));
  };

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          statsGrid.classList.add("is-running");
          startSequence();
        } else {
          statsGrid.classList.remove("is-running");
          stopSequence();
        }
      });
    },
    { threshold: 0.32 }
  );

  statsObserver.observe(statsGrid);
})();
