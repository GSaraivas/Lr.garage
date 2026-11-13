window.LRGarage.initGallery = function () {
  const dialog = document.querySelector("#lightbox");
  const tiles = [...document.querySelectorAll("[data-gallery]")];
  const wrapper = dialog.querySelector(".swiper-wrapper");
  const caption = dialog.querySelector(".lightbox-caption");
  const previous = dialog.querySelector(".gallery-prev");
  const next = dialog.querySelector(".gallery-next");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let index = 0;
  let carousel;
  let opener;
  let touchStart;

  const slides = tiles.map(tile => {
    const slide = document.createElement("div");
    const image = tile.querySelector("img").cloneNode();
    slide.className = "swiper-slide";
    slide.hidden = true;
    slide.append(image);
    wrapper.append(slide);
    return slide;
  });

  function render() {
    const title = tiles[index].querySelector("img").alt;
    caption.textContent = (index + 1) + " / " + tiles.length + " · " + title;
    if (!carousel) slides.forEach((slide, position) => { slide.hidden = index !== position; });
    previous.disabled = index === 0;
    next.disabled = index === tiles.length - 1;
  }

  function move(step) {
    const destination = Math.max(0, Math.min(tiles.length - 1, index + step));
    if (carousel) {
      carousel.slideTo(destination, reduceMotion.matches ? 0 : 280);
    } else {
      index = destination;
      render();
    }
  }

  tiles.forEach((tile, position) => tile.addEventListener("click", () => {
    opener = tile;
    index = position;
    dialog.showModal();
    if (window.Swiper && !carousel) {
      slides.forEach(slide => { slide.hidden = false; });
      dialog.classList.add("has-swiper");
      carousel = new window.Swiper(dialog.querySelector(".swiper"), {
        initialSlide: index,
        speed: reduceMotion.matches ? 0 : 280,
        on: { slideChange(instance) { index = instance.activeIndex; render(); } }
      });
    }
    if (carousel) {
      carousel.update();
      carousel.slideTo(position, 0, false);
    }
    render();
    dialog.querySelector(".lightbox-close").focus();
  }));

  previous.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  dialog.querySelector(".lightbox-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => opener.focus());
  dialog.addEventListener("keydown", event => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    move(event.key === "ArrowLeft" ? -1 : 1);
  });
  wrapper.addEventListener("touchstart", event => { touchStart = event.changedTouches[0].clientX; }, { passive: true });
  wrapper.addEventListener("touchend", event => {
    const distance = event.changedTouches[0].clientX - touchStart;
    if (!carousel && Math.abs(distance) > 45) move(distance < 0 ? 1 : -1);
  }, { passive: true });
};
