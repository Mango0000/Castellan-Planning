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

  var newWsLayer = null;
  var newWsInput = null;
  var newWsCallback = null;
  var newWsRoot = "/home/manuel/Downloads/random_projects/codingPlatform";

  function closeNewWorkspace() {
    if (newWsLayer) newWsLayer.hidden = true;
    newWsCallback = null;
    if (newWsInput) newWsInput.value = "";
  }

  function buildNewWorkspaceDialog() {
    if (newWsLayer) return;
    newWsLayer = document.createElement("div");
    newWsLayer.className = "sm-new-ws-layer";
    newWsLayer.hidden = true;
    newWsLayer.innerHTML =
      '<div class="sm-new-ws-card" role="dialog" aria-modal="true" aria-labelledby="sm-new-ws-title">' +
      '<div class="sm-new-ws-h"><b id="sm-new-ws-title">New workspace</b><button class="sm-pop-x" id="sm-new-ws-x" type="button" aria-label="Close">×</button></div>' +
      '<div class="sm-new-ws-body"><label for="sm-new-ws-name">Name</label>' +
      '<input id="sm-new-ws-name" type="text" autocomplete="off" placeholder="project-name">' +
      '<p>Adds a workspace to the rail. You can create its first task next.</p></div>' +
      '<div class="sm-new-ws-f"><button id="sm-new-ws-cancel" type="button">Cancel</button>' +
      '<button class="primary" id="sm-new-ws-create" type="button">Create workspace</button></div></div>';
    shell.appendChild(newWsLayer);
    newWsInput = $("#sm-new-ws-name", newWsLayer);
    newWsLayer.addEventListener("click", function (e) {
      if (e.target === newWsLayer) closeNewWorkspace();
    });
    $("#sm-new-ws-x", newWsLayer).addEventListener("click", closeNewWorkspace);
    $("#sm-new-ws-cancel", newWsLayer).addEventListener("click", closeNewWorkspace);
    $("#sm-new-ws-create", newWsLayer).addEventListener("click", createNewWorkspace);
    newWsInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); createNewWorkspace(); }
      if (e.key === "Escape") closeNewWorkspace();
    });
    addEventListener("keydown", function (e) {
      if (e.key === "Escape" && newWsLayer && !newWsLayer.hidden) closeNewWorkspace();
    });
  }

  function openNewWorkspace(callback) {
    buildNewWorkspaceDialog();
    newWsCallback = callback || null;
    newWsLayer.hidden = false;
    if (newWsInput) {
      newWsInput.value = "";
      setTimeout(function () { newWsInput.focus(); }, 0);
    }
  }

  function addWorkspaceToRail(name) {
    var list = $("#sm-ws-list", shell);
    if (!list) return;
    var row = document.createElement("div");
    row.className = "sm-ws-row";
    var wsBtn = document.createElement("button");
    wsBtn.className = "sm-ws";
    wsBtn.type = "button";
    wsBtn.dataset.smWs = name;
    wsBtn.dataset.smView = "dashboard";
    var ic = document.createElement("span");
    ic.className = "ic";
    ic.textContent = "◇";
    var meta = document.createElement("span");
    meta.className = "meta";
    meta.textContent = "idle";
    wsBtn.appendChild(ic);
    wsBtn.appendChild(document.createTextNode(" " + name + " "));
    wsBtn.appendChild(meta);
    wsBtn.addEventListener("click", function () { openView("dashboard", { ws: name }); });
    var addBtn = document.createElement("button");
    addBtn.className = "sm-ws-add";
    addBtn.type = "button";
    addBtn.textContent = "＋";
    addBtn.title = "Add task to " + name;
    addBtn.setAttribute("aria-label", "Add task to " + name);
    addBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      selectWorkspace(name);
      openView("new", { ws: name });
    });
    row.appendChild(wsBtn);
    row.appendChild(addBtn);
    list.appendChild(row);

    var pickWrap = $(".sm-wspick", shell);
    if (pickWrap) {
      var pick = document.createElement("button");
      pick.type = "button";
      pick.dataset.pick = name;
      pick.textContent = name;
      pick.addEventListener("click", function () { selectWorkspace(name); });
      pickWrap.appendChild(pick);
    }
  }

  function createNewWorkspace() {
    if (!newWsInput) return;
    var name = newWsInput.value.trim();
    if (!name) { newWsInput.focus(); return; }
    if (!WS[name]) {
      WS[name] = {
        name: name, branch: "main", path: newWsRoot,
        desc: "A new workspace.", tags: [],
        about: "A new workspace. Start a task from the rail or the workspace dashboard.",
        server: { running: false, port: 3000, cmd: "npm run dev", meta: "not running", busy: false },
        task: null, change: { file: "—", add: 0, del: 0 }, diff: [], files: []
      };
      addWorkspaceToRail(name);
    }
    var cb = newWsCallback;
    closeNewWorkspace();
    if (cb) cb(name);
    else { selectWorkspace(name); openView("dashboard", { ws: name }); }
  }

  $$("[data-new-workspace]", shell).forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var mode = btn.dataset.newWorkspace;
      openNewWorkspace(function (name) {
        selectWorkspace(name);
        if (mode === "task") openView("new", { ws: name });
        else openView("dashboard", { ws: name });
      });
    });
  });

  var taskView = $('.sm-view[data-sm-view="auth"]', shell);
  if (taskView) {
    var taskTabs = $$("[data-task-tab]", taskView);
    var taskPanes = $$("[data-task-pane]", taskView);
    var taskBottom = $("[data-task-bottom]", taskView);
    var taskBottomToggle = $("[data-task-bottom-toggle]", taskView);
    var planCollapsed = false;

    function updateTaskBottom() {
      if (!taskBottom || !taskBottomToggle) return;
      var collapsed = taskBottom.classList.contains("collapsed");
      var lbl = $(".lbl", taskBottomToggle);
      if (lbl) lbl.textContent = collapsed ? "Show composer & pending" : "Hide composer & pending";
      taskBottomToggle.setAttribute("aria-expanded", String(!collapsed));
      taskBottomToggle.setAttribute("aria-label", (collapsed ? "Show" : "Hide") + " composer and pending items");
    }

    function setTaskTab(name) {
      taskView.dataset.taskTab = name;
      taskTabs.forEach(function (tab) {
        var on = tab.dataset.taskTab === name;
        tab.classList.toggle("on", on);
        tab.setAttribute("aria-selected", String(on));
        tab.tabIndex = on ? 0 : -1;
      });
      taskPanes.forEach(function (pane) {
        pane.hidden = pane.dataset.taskPane !== name;
      });
      if (taskBottom) {
        if (name === "chat") taskBottom.classList.remove("collapsed");
        else taskBottom.classList.toggle("collapsed", planCollapsed);
      }
      updateTaskBottom();
    }

    taskTabs.forEach(function (tab) {
      tab.addEventListener("click", function () { setTaskTab(tab.dataset.taskTab); });
    });

    if (taskBottomToggle) {
      taskBottomToggle.addEventListener("click", function () {
        if (taskView.dataset.taskTab !== "plan") return;
        planCollapsed = !planCollapsed;
        taskBottom.classList.toggle("collapsed", planCollapsed);
        updateTaskBottom();
      });
    }

    var planDoc = $("[data-plan-doc]", taskView);
    var planState = $("[data-plan-state]", taskView);
    var planBadge = $("[data-plan-badge]", taskView);
    var planApprove = $("[data-plan-approve]", taskView);
    var planApproved = false;
    if (planDoc) {
      planDoc.addEventListener("input", function () {
        if (planApproved) {
          planApproved = false;
          if (planApprove) { planApprove.disabled = false; planApprove.textContent = "Approve plan"; }
        }
        if (planState) { planState.textContent = "Draft · edited"; planState.classList.remove("approved"); }
        if (planBadge) { planBadge.textContent = "edited"; planBadge.classList.remove("approved"); }
      });
    }
    if (planApprove) {
      planApprove.addEventListener("click", function () {
        planApproved = true;
        if (planState) { planState.textContent = "Approved"; planState.classList.add("approved"); }
        if (planBadge) { planBadge.textContent = "approved"; planBadge.classList.add("approved"); }
        planApprove.textContent = "Approved";
        planApprove.disabled = true;
      });
    }

    setTaskTab("chat");
  }


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

