/* 05-theme — Castellan theme state shared by Settings and the blueprint */

(function () {
  var root = document.documentElement;

  function current() {
    return root.dataset.theme === "dark" ? "dark" : "light";
  }

  function applyTheme(next) {
    if (next !== "light" && next !== "dark") return;
    root.dataset.theme = next;
    try { localStorage.setItem("castellan.theme", next); } catch (e) {}
    try {
      if (window.self !== window.top) {
        window.parent.postMessage({ type: "mock-theme-change", theme: next }, "*");
      }
    } catch (e) {}
  }

  window.CastellanTheme = { current: current, set: applyTheme };
})();
