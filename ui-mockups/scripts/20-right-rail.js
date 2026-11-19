/* 20-right-rail — context tab strip, panes, apply/open/close logic */

  function findTab(key) {
    for (var i = 0; i < ctxTabs.length; i++) if (ctxTabs[i].key === key) return ctxTabs[i];
    return null;
  }

  function activeTab() { return findTab(ctxTab); }

  function tabMeta(tab) {
    if (tab.kind === "file") {
      var f = fileMeta(tab.path);
      var kind = (f && f.kind) || kindOf(tab.path);
      return { label: baseName(tab.path), icon: iconFor(kind) };
    }
    return CTX_META[tab.kind] || { label: tab.kind, icon: "◻" };
  }

  function updateCtxPanes() {
    var none = ctxTabs.length === 0;
    var empty = $("#sm-ctx-empty", shell);
    if (empty) empty.hidden = !none;
    var active = activeTab();
    var pane = active ? active.kind : null;
    $$("[data-ctx-pane]", shell).forEach(function (p) {
      p.hidden = none || p.dataset.ctxPane !== pane;
    });
    if (active && active.kind === "explorer") renderExplorer();
    if (active && active.kind === "file") renderFile(active);
  }

  function renderCtxTabs() {
    var bar = $("#sm-ctx-tabbar", shell);
    if (!bar) return;
    bar.innerHTML = "";
    ctxTabs.forEach(function (tab) {
      var meta = tabMeta(tab);
      var el = document.createElement("div");
      el.className = "sm-ctx-tab" + (tab.key === ctxTab ? " on" : "");
      el.dataset.ctxTab = tab.key;
      el.setAttribute("role", "tab");
      el.tabIndex = 0;
      el.title = tab.kind === "file" ? fullPath(tab.path) : meta.label;
      el.innerHTML = '<span class="ci">' + meta.icon + '</span><span class="cl">' + esc(meta.label) + "</span>";
      var x = document.createElement("button");
      x.type = "button";
      x.className = "sm-ctx-tabx";
      x.dataset.ctxClose = tab.key;
      x.setAttribute("aria-label", "Close " + meta.label + " tab");
      x.textContent = "×";
      x.addEventListener("click", function (e) {
        e.stopPropagation();
        closeContextTab(tab.key);
      });
      el.appendChild(x);
      el.addEventListener("click", function () { setContextTab(tab.key); });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setContextTab(tab.key); }
      });
      bar.appendChild(el);
    });
    updateCtxPanes();
  }

  function setContextTab(key) {
    if (!findTab(key)) return;
    ctxTab = key;
    renderCtxTabs();
  }

  function closeContextTab(key) {
    ctxTabs = ctxTabs.filter(function (t) { return t.key !== key; });
    if (ctxTab === key) ctxTab = ctxTabs.length ? ctxTabs[ctxTabs.length - 1].key : null;
    renderCtxTabs();
  }

  function addContextTab(kind, path) {
    if (kind === "files") kind = "explorer";
    if (kind === "file") {
      if (!path || !fileMeta(path)) return;
      var key = "file:" + path;
      if (!findTab(key)) ctxTabs.push({ key: key, kind: "file", path: path });
      ctxTab = key;
    } else {
      if (!CTX_META[kind]) return;
      if (!findTab(kind)) ctxTabs.push({ key: kind, kind: kind });
      ctxTab = kind;
    }
    ctxOpen = true;
    applyContext();
    renderCtxTabs();
  }

  function openContextTab(kind) {
    if (!ctxAvailable) return;
    addContextTab(kind);
  }

  function openContextPanel() {
    if (!ctxAvailable) return;
    if (!ctxTabs.length) ctxTabs.push({ key: "explorer", kind: "explorer" });
    ctxOpen = true;
    if (!findTab(ctxTab)) ctxTab = ctxTabs[0].key;
    applyContext();
    renderCtxTabs();
  }

  function applyContext() {
    var visible = ctxAvailable && ctxOpen;
    if (ctxPanel) ctxPanel.hidden = !visible;
    if (ctxStub) ctxStub.hidden = !(ctxAvailable && !ctxOpen);
    if (visible) updateCtxPanes();
  }

