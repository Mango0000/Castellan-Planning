/* 90-resizing — left/right rail drag sizing */

  /* -------------------------------------------------------------- resizing */

  function readWidth(key, fallback, min, max) {
    var n = NaN;
    try { n = parseFloat(localStorage.getItem(key)); } catch (e) {}
    if (!isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  function saveWidth(key, value) {
    try { localStorage.setItem(key, String(Math.round(value))); } catch (e) {}
  }

  function uiScale() {
    var n = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--ui-scale"));
    return isFinite(n) && n > 0 ? n : 1;
  }

  var leftW = readWidth("mock-left-w", 214, 176, 320);
  var rightW = readWidth("mock-right-w", 288, 240, 1600);
  shell.style.setProperty("--left-w", leftW + "px");
  shell.style.setProperty("--right-w", rightW + "px");

  function bindResizer(el, side) {
    if (!el) return;
    el.addEventListener("pointerdown", function (e) {
      if (side === "left" && shellmock.classList.contains("nav-collapsed")) return;
      e.preventDefault();
      var scale = uiScale();
      var startX = e.clientX;
      var appW = shellmock.getBoundingClientRect().width / scale;
      var sideEl = $(".sm-side", shell);
      var startW = (side === "left" ? sideEl.getBoundingClientRect().width : ctxPanel.getBoundingClientRect().width) / scale;
      document.body.classList.add("resizing");

      function move(ev) {
        var dx = (ev.clientX - startX) / scale;
        var w = side === "left" ? startW + dx : startW - dx;
        if (side === "left") {
          var ctxW = ctxPanel && !ctxPanel.hidden ? ctxPanel.getBoundingClientRect().width / scale : 0;
          var max = Math.min(320, Math.max(176, appW - ctxW - 300));
          w = Math.max(176, Math.min(max, w));
          shell.style.setProperty("--left-w", w + "px");
        } else {
          var leftNow = sideEl.getBoundingClientRect().width / scale;
          var maxR = Math.max(240, Math.min(1600, appW - leftNow - 300));
          w = Math.max(240, Math.min(maxR, w));
          shell.style.setProperty("--right-w", w + "px");
        }
      }
      function up() {
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
        document.body.classList.remove("resizing");
        var final = (side === "left" ? sideEl.getBoundingClientRect().width : ctxPanel.getBoundingClientRect().width) / scale;
        saveWidth(side === "left" ? "mock-left-w" : "mock-right-w", final);
      }
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up, { once: false });
    });
  }

  bindResizer($("#sm-resize-left", shell), "left");
  bindResizer($("#sm-resize-right", shell), "right");

