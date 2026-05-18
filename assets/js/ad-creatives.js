(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const frameworkSection = document.querySelector(".ad-framework-slide");
  const rulesSection = document.querySelector(".ad-rules-slide");

  if (!frameworkSection && !rulesSection) {
    return;
  }

  document.documentElement.classList.add("ad-js-ready");

  const revealTargets = [
    ...document.querySelectorAll(
      ".ad-framework-item, .ad-role-card, .ad-flow-card, .ad-scale-rules article"
    ),
  ];

  revealTargets.forEach((target, index) => {
    target.classList.add("ad-reveal-target");
    target.style.setProperty("--reveal-index", index % 8);
    target.addEventListener(
      "transitionend",
      (event) => {
        if (event.propertyName === "opacity") {
          target.style.setProperty("--reveal-index", 0);
        }
      },
      { once: true }
    );
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
    ...document.querySelectorAll(".ad-framework-item, .ad-role-card, .ad-flow-card"),
  ];

  tiltTargets.forEach((target) => {
    target.addEventListener("pointermove", (event) => {
      const rect = target.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      target.style.setProperty("--tilt-x", `${(-y * 3).toFixed(2)}deg`);
      target.style.setProperty("--tilt-y", `${(x * 4).toFixed(2)}deg`);
    });

    target.addEventListener("pointerleave", () => {
      target.style.removeProperty("--tilt-x");
      target.style.removeProperty("--tilt-y");
    });
  });

  if (!rulesSection) {
    return;
  }

  const flowItems = [...rulesSection.querySelectorAll(".ad-flow-card")];
  const scaleItems = [...rulesSection.querySelectorAll(".ad-scale-rules article")];
  const sequence = [...flowItems, ...scaleItems];
  let activeIndex = 0;
  let timerId = null;

  const setActiveItem = () => {
    sequence.forEach((item, index) => {
      item.classList.toggle("is-active", index === activeIndex);
    });
    activeIndex = (activeIndex + 1) % sequence.length;
  };

  const startSequence = () => {
    if (timerId || sequence.length === 0) {
      return;
    }
    setActiveItem();
    timerId = window.setInterval(setActiveItem, 1300);
  };

  const stopSequence = () => {
    if (!timerId) {
      return;
    }
    window.clearInterval(timerId);
    timerId = null;
    sequence.forEach((item) => item.classList.remove("is-active"));
  };

  const rulesObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          rulesSection.classList.add("is-running");
          startSequence();
        } else {
          rulesSection.classList.remove("is-running");
          stopSequence();
        }
      });
    },
    { threshold: 0.28 }
  );

  rulesObserver.observe(rulesSection);
})();
