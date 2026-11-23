/* 50-navigation — view switching, active rail state and showView */

  function openView(name, opts) {
    opts = opts || {};
    closePickers();
    currentView = name;

    views.forEach(function (v) { v.hidden = v.dataset.smView !== name; });

    var ws = null;
    var canCtx = false;
    if (name === "auth") { ws = "acme-web"; canCtx = true; }
    else if (name === "rate") { ws = "api-core"; canCtx = true; }
    else if (name === "dashboard") {
      ws = opts.ws || dashboardWs;
      dashboardWs = ws;
      canCtx = true;
    }
    else if (name === "temp-new") { ws = null; canCtx = false; }
    else if (name === "temp") { ws = null; canCtx = false; }
    else if (name === "global") { ws = null; canCtx = false; }
    else if (name === "archived") { ws = null; canCtx = false; }
    else if (name === "new") {
      selectWorkspace(opts.ws || lastWorkspace);
    }

    currentWs = ws;
    ctxAvailable = canCtx;

    if (name === "rate") clearRateUnread();
    if (name === "dashboard") renderDashboard(ws);
    if (name === "global") renderGlobalDashboard();
    if (ws) syncContext(ws);

    applyContext();
    renderAllComposerChips();

    $$(".sm-side .on", shell).forEach(function (el) { el.classList.remove("on"); });
    if (name === "auth" || name === "rate") {
      var row = $('.sm-side .sm-ws[data-sm-ws="' + ws + '"]', shell);
      if (row) row.classList.add("on");
      var task = $('.sm-side .sm-task[data-sm-view="' + name + '"]', shell);
      if (task) task.classList.add("on");
      var work = $('.sm-side .sm-item[data-sm-view="' + name + '"]', shell);
      if (work) work.classList.add("on");
    } else if (name === "dashboard") {
      var wrow = $('.sm-side .sm-ws[data-sm-ws="' + ws + '"]', shell);
      if (wrow) wrow.classList.add("on");
    } else if (name === "global") {
      var gbtn = $('.sm-side [data-sm-view="global"]', shell);
      if (gbtn) gbtn.classList.add("on");
    } else if (name === "new") {
      var newBtn = $('.sm-side .sm-new[data-sm-view="new"]', shell);
      if (newBtn) newBtn.classList.add("on");
    } else if (name === "temp-new" || name === "temp") {
      var tempTop = $('.sm-side .sm-new[data-sm-view="temp-new"]', shell);
      if (tempTop) tempTop.classList.add("on");
      if (name === "temp") {
        var temp = $('.sm-side .sm-item[data-sm-view="temp"]', shell);
        if (temp) temp.classList.add("on");
      }
    } else if (name === "archived") {
      var archiveRow = $('.sm-side [data-sm-view="archived"]', shell);
      if (archiveRow) archiveRow.classList.add("on");
    }
  }

  function showView(btn) {
    var name = btn.dataset.smView;
    if (!name) return;
    if (name === "temp-new") resetTempContext();
    openView(name, { ws: btn.dataset.smWs });
  }

