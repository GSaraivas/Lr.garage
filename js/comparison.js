window.LRGarage.initComparisons = function () {
  document.querySelectorAll(".comparison").forEach(comparison => {
    const range = comparison.querySelector("input");
    const render = () => {
      comparison.style.setProperty("--split", range.value + "%");
      range.setAttribute("aria-valuetext", range.value + "% antes, " + (100 - range.value) + "% depois");
    };
    range.addEventListener("input", render);
    render();
  });
};
