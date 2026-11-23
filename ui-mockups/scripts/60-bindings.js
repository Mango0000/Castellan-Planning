/* 60-bindings — global event bindings and menu wiring */

  /* --------------------------------------------------------------- binding */

  $$("[data-archive-confirm]", shell).forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      openArchiveConfirm(btn.dataset.archiveConfirm, btn);
    });
  });
  var deleteAllBtn = $("#sm-archive-delete-all", shell);
  if (deleteAllBtn) deleteAllBtn.addEventListener("click", openDeleteAllConfirm);

  triggers.forEach(function (btn) {
    btn.addEventListener("click", function () { showView(btn); });
  });

  $$("[data-pick]", shell).forEach(function (b) {
    b.addEventListener("click", function () { selectWorkspace(b.dataset.pick); });
  });


  $$("[data-ctx-open]", shell).forEach(function (b) {
    b.addEventListener("click", function () { openContextTab(b.dataset.ctxOpen); });
  });

  var ctxClose = $("#sm-ctx-close", shell);
  if (ctxClose) {
    ctxClose.addEventListener("click", function () {
      ctxOpen = false;
      setCtxMenu(false);
      applyContext();
    });
  }
  var ctxExpand = $("#sm-ctx-expand", shell);
  if (ctxExpand) {
    ctxExpand.addEventListener("click", function () { openContextPanel(); });
  }

  var ctxPlus = $("#sm-ctx-plus", shell);
  var ctxMenu = $("#sm-ctx-menu", shell);
  function setCtxMenu(open) {
    if (!ctxMenu || !ctxPlus) return;
    ctxMenu.hidden = !open;
    ctxPlus.setAttribute("aria-expanded", String(open));
  }
  if (ctxPlus) {
    ctxPlus.addEventListener("click", function (e) {
      e.stopPropagation();
      if (!ctxAvailable) return;
      setCtxMenu(ctxMenu.hidden);
    });
  }
  $$("[data-ctx-add]", shell).forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      addContextTab(b.dataset.ctxAdd);
      setCtxMenu(false);
    });
  });
  addEventListener("click", function (e) {
    if (!ctxMenu || ctxMenu.hidden) return;
    if (ctxMenu.contains(e.target) || e.target === ctxPlus) return;
    setCtxMenu(false);
  });
  addEventListener("keydown", function (e) {
    if (e.key === "Escape") setCtxMenu(false);
  });
  var emptyAdd = $("#sm-ctx-empty-add", shell);
  if (emptyAdd) {
    emptyAdd.addEventListener("click", function () {
      setCtxMenu(true);
    });
  }

  var expRefresh = $("#sm-exp-refresh", shell);
  if (expRefresh) expRefresh.addEventListener("click", function () { renderExplorer(); });

  function setNavCollapsed(collapsed) {
    shellmock.classList.toggle("nav-collapsed", collapsed);
    if (navToggle) {
      navToggle.classList.toggle("on", collapsed);
      navToggle.setAttribute("aria-pressed", String(collapsed));
      navToggle.setAttribute("aria-label", collapsed ? "Expand workspaces rail" : "Collapse workspaces rail");
      navToggle.title = collapsed ? "Expand workspaces" : "Collapse workspaces";
    }
  }
  if (navToggle) navToggle.addEventListener("click", function () { setNavCollapsed(true); });
  if (navExpand) navExpand.addEventListener("click", function () { setNavCollapsed(false); });

  var wsSec = $("#sm-ws-sec", shell);
  var wsToggle = $("#sm-ws-toggle", shell);
  function setWorkspacesCollapsed(collapsed) {
    if (!wsSec || !wsToggle) return;
    wsSec.classList.toggle("collapsed", collapsed);
    wsToggle.setAttribute("aria-expanded", String(!collapsed));
    wsToggle.title = collapsed ? "Expand workspaces" : "Collapse workspaces";
    try { localStorage.setItem("castellan.workspacesCollapsed", collapsed ? "1" : "0"); } catch (e) {}
  }
  if (wsToggle) {
    wsToggle.addEventListener("click", function () {
      setWorkspacesCollapsed(!wsSec.classList.contains("collapsed"));
    });
  }
  var savedWsCollapsed = null;
  try { savedWsCollapsed = localStorage.getItem("castellan.workspacesCollapsed"); } catch (e) {}
  if (savedWsCollapsed === "1") setWorkspacesCollapsed(true);

  var tempSec = $("#sm-temp-sec", shell);
  var tempToggle = $("#sm-temp-toggle", shell);
  function setTemporaryCollapsed(collapsed) {
    if (!tempSec || !tempToggle) return;
    tempSec.classList.toggle("collapsed", collapsed);
    tempToggle.setAttribute("aria-expanded", String(!collapsed));
    tempToggle.title = collapsed ? "Expand temporary" : "Collapse temporary";
    try { localStorage.setItem("castellan.temporaryCollapsed", collapsed ? "1" : "0"); } catch (e) {}
  }
  if (tempToggle) {
    tempToggle.addEventListener("click", function () {
      setTemporaryCollapsed(!tempSec.classList.contains("collapsed"));
    });
  }
  var savedTempCollapsed = null;
  try { savedTempCollapsed = localStorage.getItem("castellan.temporaryCollapsed"); } catch (e) {}
  if (savedTempCollapsed === "1") setTemporaryCollapsed(true);

  var wsTaskState = {};
  try { wsTaskState = JSON.parse(localStorage.getItem("castellan.workspaceTaskCollapsed") || "{}") || {}; } catch (e) {}
  function setWorkspaceTasksCollapsed(key, collapsed) {
    var btn = $('[data-ws-toggle="' + key + '"]', shell);
    var kids = $("#sm-kids-" + key, shell);
    if (!btn || !kids) return;
    kids.hidden = !!collapsed;
    btn.classList.toggle("collapsed", !!collapsed);
    btn.setAttribute("aria-expanded", String(!collapsed));
    var label = (collapsed ? "Expand " : "Collapse ") + key + " tasks";
    btn.title = label;
    btn.setAttribute("aria-label", label);
    wsTaskState[key] = !!collapsed;
    try { localStorage.setItem("castellan.workspaceTaskCollapsed", JSON.stringify(wsTaskState)); } catch (e) {}
  }
  $$("[data-ws-toggle]", shell).forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.dataset.wsToggle;
      setWorkspaceTasksCollapsed(key, wsTaskState[key] !== true);
    });
  });
  Object.keys(wsTaskState).forEach(function (key) {
    setWorkspaceTasksCollapsed(key, wsTaskState[key] === true);
  });

  var wdServerBtn = $("#wd-server-btn", shell);
  if (wdServerBtn) {
    wdServerBtn.addEventListener("click", function () { toggleServer(dashboardWs); });
  }
  var previewStart = $("#sm-ctx-preview-start", shell);
  if (previewStart) {
    previewStart.addEventListener("click", function () {
      if (currentWs) toggleServer(currentWs);
    });
  }
  var wdTaskOpen = $("#wd-task-open", shell);
  if (wdTaskOpen) {
    wdTaskOpen.addEventListener("click", function () {
      var d = WS[dashboardWs];
      if (!d || !d.task) return;
      var trigger = $('.sm-side .sm-task[data-sm-view="' + d.task.view + '"]', shell) ||
                    $('.sm-side .sm-item[data-sm-view="' + d.task.view + '"]', shell);
      if (trigger) showView(trigger);
    });
  }
  var wdEdit = $("#wd-edit", shell);
  if (wdEdit) {
    wdEdit.addEventListener("click", function () {
      var editing = $("#sm-dash", shell).classList.toggle("editing");
      wdEdit.textContent = editing ? "Done editing" : "Edit layout";
    });
  }
  var addWidget = $("#wd-add-widget", shell);
  if (addWidget) {
    addWidget.addEventListener("click", function () {
      $("#wd-extra", shell).hidden = false;
      addWidget.hidden = true;
      var extraText = $("#wd-extra-text", shell);
      if (extraText) extraText.innerHTML = "production · " + WS[dashboardWs].name + ".vercel.app<br><small>added just now</small>";
    });
  }

