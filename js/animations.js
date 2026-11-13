window.LRGarage.initAnimations = function () {
  const { gsap, ScrollTrigger, SplitText, Lenis } = window;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);
  const media = gsap.matchMedia();

  media.add("(prefers-reduced-motion: no-preference)", () => {
    const finePointer = matchMedia("(pointer: fine)").matches;
    const controller = new AbortController();
    const { signal } = controller;
    const lenis = Lenis && finePointer ? new Lenis({
      anchors: true,
      autoRaf: false,
      prevent: node => Boolean(node.closest?.("dialog, .comparison, select"))
    }) : null;
    const tick = seconds => lenis.raf(seconds * 1000);
    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
    }

    const photo = document.querySelector(".hero-visual img");
    let split;
    if (performance.now() < 1700) {
      const lines = document.querySelectorAll(".hero h1 > span");
      split = SplitText ? SplitText.create(lines, { type: "lines", mask: "lines", aria: "none" }) : null;
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline.from(photo, { scale: 1.09, duration: 1.15 }, 0);
      timeline.from(".hero-blue-line", { scaleY: 0, transformOrigin: "top", duration: .7 }, .15);
      timeline.from(split ? split.lines : lines, { yPercent: 104, opacity: 0, duration: .75, stagger: .09 }, .16);
      timeline.from(".hero-description", { opacity: 0, y: 12, duration: .45 }, .49);
      timeline.from(".hero-actions .button", { opacity: 0, y: 12, duration: .45, stagger: .08 }, .58);
    }
    if (finePointer) {
      gsap.fromTo(".hero-visual", { yPercent: 0 }, {
        yPercent: 6, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
    }

    const elements = document.querySelectorAll("[data-reveal], [data-mask]");
    elements.forEach(element => {
      if (element.getBoundingClientRect().top < window.innerHeight) return;
      const mask = element.hasAttribute("data-mask");
      const start = mask ? { clipPath: "inset(0 100% 0 0)" } : { y: 23, opacity: 0 };
      gsap.from(element, {
        ...start, duration: mask ? .8 : .55, ease: "power2.out", clearProps: mask ? "clipPath" : "transform,opacity",
        scrollTrigger: { trigger: element, start: "top 94%", once: true }
      });
    });

    if (finePointer) {
      const addPointerMotion = element => {
        const set = gsap.quickTo(element, "x", { duration: .33, ease: "power2.out" });
        const lift = gsap.quickTo(element, "y", { duration: .33, ease: "power2.out" });
        const tiltX = gsap.quickTo(element, "rotationX", { duration: .35 });
        const tiltY = gsap.quickTo(element, "rotationY", { duration: .35 });
        element.addEventListener("pointermove", event => {
          if (event.pointerType !== "mouse") return;
          const rect = element.getBoundingClientRect();
          update((event.clientX - rect.left) / rect.width - .5, (event.clientY - rect.top) / rect.height - .5);
        }, { signal });
        element.addEventListener("pointerleave", () => update(0, 0), { signal });
        function update(x, y) {
          if (element.classList.contains("service-photo")) {
            gsap.set(element, { transformPerspective: 750 });
            tiltX(-y * 7);
            tiltY(x * 7);
          } else {
            set(x * 9);
            lift(y * 9);
          }
        }
      };
      document.querySelectorAll(".hero-actions .button, .service-photo").forEach(addPointerMotion);
    }

    return () => {
      controller.abort();
      split?.revert();
      if (lenis) {
        gsap.ticker.remove(tick);
        lenis.destroy();
      }
      gsap.set(".hero-actions .button, .service-photo", { clearProps: "transform" });
    };
  });
};
