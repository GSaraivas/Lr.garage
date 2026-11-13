(() => {
  const { config, initComparisons, initGallery, initAnimations } = window.LRGarage;
  const form = document.querySelector("#quote-form");
  const select = document.querySelector("#quote-service");
  const status = document.querySelector("#contact-status");
  const alternate = document.querySelector("#contact-alternative");
  const phone = config.whatsapp.replace(/\D/g, "");
  const whatsapp = /^\d{10,15}$/.test(phone);
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

  function quoteURL(service) {
    const message = service ? config.quoteMessage + "\nServiço de interesse: " + service + "." : config.quoteMessage;
    return "https://wa.me/" + phone + "?text=" + encodeURIComponent(message);
  }

  function externalContact(link, service) {
    link.href = quoteURL(service);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }

  document.querySelectorAll("[data-contact], [data-service]").forEach(link => {
    const service = link.dataset.service;
    if (whatsapp) externalContact(link, service);
    else if (service) link.addEventListener("click", () => { select.value = service; });
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (whatsapp) {
      window.open(quoteURL(select.value), "_blank", "noopener,noreferrer");
      return;
    }
    status.textContent = "O WhatsApp ainda está sendo configurado. Você pode pedir seu orçamento pelo Instagram.";
    status.hidden = false;
    alternate.hidden = false;
  });

  const menu = document.querySelector("#mobile-menu");
  const menuToggle = document.querySelector(".menu-toggle");
  menuToggle.addEventListener("click", () => {
    menu.showModal();
    menuToggle.setAttribute("aria-expanded", "true");
    menu.querySelector("[data-menu-close]").focus();
  });
  menu.querySelectorAll("a, [data-menu-close]").forEach(control => {
    control.addEventListener("click", () => menu.close());
  });
  menu.addEventListener("close", () => menuToggle.setAttribute("aria-expanded", "false"));
  matchMedia("(min-width: 980px)").addEventListener("change", event => {
    if (event.matches && menu.open) menu.close();
  });

  document.querySelector("#year").textContent = new Date().getFullYear();
  document.querySelectorAll("[data-instagram]").forEach(link => { link.href = config.instagram; });
  const location = [config.neighborhood, config.city, config.region].join(", ");
  const coordinates = config.coordinates;
  const hasCoordinates = coordinates && Number.isFinite(coordinates.latitude) && Number.isFinite(coordinates.longitude);
  const query = hasCoordinates ? coordinates.latitude + "," + coordinates.longitude : [config.address, location].filter(Boolean).join(", ");
  document.querySelector("#directions").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);
  document.querySelector("#map-note").hidden = Boolean(config.address || hasCoordinates);
  for (const [id, value] of [["address", config.address], ["hours", config.hours]]) {
    if (!value) continue;
    const element = document.getElementById(id);
    element.textContent = value;
    element.hidden = false;
  }
  const structuredData = document.querySelector('script[type="application/ld+json"]');
  const business = JSON.parse(structuredData.textContent);
  business.sameAs = [config.instagram];
  if (whatsapp) business.telephone = "+" + phone;
  if (config.address) business.address.streetAddress = config.address;
  if (hasCoordinates) business.geo = { "@type": "GeoCoordinates", ...coordinates };
  if (config.canonical) {
    const canonical = document.createElement("link");
    canonical.rel = "canonical";
    canonical.href = config.canonical;
    document.head.append(canonical);
    business.url = canonical.href;
    document.querySelector('[property="og:image"]').content = new URL("assets/images/subaru_azul.webp", canonical.href).href;
  }
  structuredData.textContent = JSON.stringify(business);

  const progress = document.querySelector(".scroll-progress");
  const header = document.querySelector(".header");
  let pending = false;
  function updateScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle("scrolled", window.scrollY > 20);
    progress.style.transform = "scaleX(" + (max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0) + ")";
    pending = false;
  }
  function queueScroll() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(updateScroll);
  }
  window.addEventListener("scroll", queueScroll, { passive: true });
  window.addEventListener("resize", queueScroll);
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => header.classList.toggle("away-from-hero", !entry.isIntersecting));
    observer.observe(document.querySelector(".hero"));
  }
  updateScroll();

  initComparisons();
  initGallery();
  const preloader = document.querySelector(".preloader");
  if (!reducedMotion.matches && performance.now() < 1100) {
    preloader.hidden = false;
    setTimeout(() => { preloader.hidden = true; }, 740);
  }
  let animated = false;
  function enhance(requireOptional = true) {
    window.lucide?.createIcons();
    if (animated || !window.gsap || !window.ScrollTrigger) return;
    if (requireOptional && (!window.SplitText || !window.Lenis)) return;
    animated = true;
    initAnimations();
  }
  enhance();
  document.querySelectorAll("script[async]").forEach(script => {
    script.addEventListener("load", () => enhance(), { once: true });
  });
  window.addEventListener("load", () => enhance(false), { once: true });
})();
