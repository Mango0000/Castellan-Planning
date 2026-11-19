/* 05-theme — Castellan light/dark switch, persistence and parent sync */

(function () {
  var root = document.documentElement;
  var btn = document.getElementById("sm-theme-toggle");
  if (!btn) return;

  function current() {
    return root.dataset.theme === "dark" ? "dark" : "light";
  }

  function sync() {
    var dark = current() === "dark";
    var label = "Switch to " + (dark ? "light" : "dark") + " theme";
    btn.textContent = dark ? "☀" : "☾";
    btn.setAttribute("aria-label", label);
    btn.setAttribute("aria-pressed", dark ? "true" : "false");
    btn.title = label;
  }

  btn.addEventListener("click", function () {
    var next = current() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("castellan.theme", next); } catch (e) {}
    sync();
    try {
      if (window.self !== window.top) {
        window.parent.postMessage({ type: "mock-theme-change", theme: next }, "*");
      }
    } catch (e) {}
  });

  if (window.MutationObserver) {
    new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  }
  sync();
})();
