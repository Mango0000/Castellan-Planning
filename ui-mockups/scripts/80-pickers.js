/* 80-pickers — add menu, Upload, Remote chooser, model and effort popovers */

  function buildPickers() {
    if (attachPop) return;

    attachPop = document.createElement("div");
    attachPop.className = "sm-pop sm-add-pop";
    attachPop.id = "sm-attach-pop";
    attachPop.hidden = true;
    attachPop.innerHTML =
      '<div class="sm-pop-h"><b>Add files</b><button class="sm-pop-x" id="sm-attach-x" type="button" aria-label="Close">×</button></div>' +
      '<div class="sm-add-menu">' +
      '<button class="sm-add-item" id="sm-add-upload" type="button"><span class="ico">⇪</span><span class="sm-add-copy"><b>Upload</b><small>From this device</small></span></button>' +
      '<button class="sm-add-item" id="sm-add-remote" type="button"><span class="ico">▤</span><span class="sm-add-copy"><b>Remote</b><small>From the remote machine</small></span></button>' +
      '</div>';
    shell.appendChild(attachPop);
    attachPop.addEventListener("click", function (e) { e.stopPropagation(); });
    $("#sm-attach-x", attachPop).addEventListener("click", closeAttach);
    $("#sm-add-upload", attachPop).addEventListener("click", function () {
      closeAttach();
      if (localInput) localInput.click();
    });
    $("#sm-add-remote", attachPop).addEventListener("click", function () {
      closeAttach();
      openRemote(activeComposer);
    });

    localInput = document.createElement("input");
    localInput.type = "file";
    localInput.multiple = true;
    localInput.hidden = true;
    localInput.id = "sm-local-input";
    localInput.addEventListener("change", handleLocalFiles);
    shell.appendChild(localInput);

    remoteBack = document.createElement("div");
    remoteBack.className = "sm-modal-back";
    remoteBack.hidden = true;
    remoteBack.addEventListener("click", closeRemote);
    shell.appendChild(remoteBack);

    remotePop = document.createElement("div");
    remotePop.className = "sm-remote-pop";
    remotePop.id = "sm-remote-pop";
    remotePop.hidden = true;
    remotePop.innerHTML =
      '<div class="sm-remote-h"><div><b>Remote files</b><span class="sm-remote-sub" id="sm-remote-sub"></span></div>' +
      '<button class="sm-pop-x" id="sm-remote-x" type="button" aria-label="Close">×</button></div>' +
      '<div class="sm-remote-body">' +
      '<div class="sm-remote-ctx" id="sm-remote-ctx"><div class="sm-pop-label">Workspace</div><div class="sm-attach-ws" id="sm-remote-ws"></div></div>' +
      '<div class="sm-exp-loc sm-remote-pathbar"><button class="sm-exp-nav" id="sm-remote-up" type="button" aria-label="Up one folder" title="Up one folder">←</button>' +
      '<div class="sm-exp-path" id="sm-remote-path" title="/home/manuel/Downloads/random_projects/codingPlatform">/home/manuel/Downloads/random_projects/codingPlatform</div>' +
      '<button class="sm-exp-nav" id="sm-remote-refresh" type="button" aria-label="Refresh folder" title="Refresh">⟳</button></div>' +
      '<div class="sm-remote-searchrow"><span>⌕</span><input id="sm-remote-search" type="text" autocomplete="off" placeholder="Search files in this folder…"></div>' +
      '<div class="sm-remote-list" id="sm-remote-list"></div>' +
      '</div>' +
      '<div class="sm-remote-f"><span id="sm-remote-count"></span><span class="sp"></span>' +
      '<button class="sm-mini" id="sm-remote-cancel" type="button">Cancel</button>' +
      '<button class="sm-mini primary" id="sm-remote-done" type="button">Attach</button></div>';
    shell.appendChild(remotePop);
    remotePop.addEventListener("click", function (e) { e.stopPropagation(); });
    $("#sm-remote-x", remotePop).addEventListener("click", closeRemote);
    $("#sm-remote-cancel", remotePop).addEventListener("click", closeRemote);
    $("#sm-remote-done", remotePop).addEventListener("click", commitRemote);
    $("#sm-remote-search", remotePop).addEventListener("input", function () {
      clearTimeout(remoteClickTimer);
      remoteSearch = this.value || "";
      renderRemoteFiles();
    });
    $("#sm-remote-up", remotePop).addEventListener("click", function () {
      if (!remoteDir.length) return;
      remoteDir.pop();
      remoteOpenDirs = {};
      remoteSearch = "";
      var search = $("#sm-remote-search", remotePop);
      if (search) search.value = "";
      renderRemote();
    });
    $("#sm-remote-refresh", remotePop).addEventListener("click", function () { renderRemoteFiles(); });

    selectPop = document.createElement("div");
    selectPop.className = "sm-pop sm-select-pop";
    selectPop.id = "sm-select-pop";
    selectPop.hidden = true;
    selectPop.innerHTML =
      '<div class="sm-pop-h"><b id="sm-select-title">Model</b><button class="sm-pop-x" id="sm-select-x" type="button" aria-label="Close">×</button></div>' +
      '<div class="sm-pop-body" id="sm-select-body"></div>' +
      '<div class="sm-pop-f"><span>Applies to this chat only</span></div>';
    shell.appendChild(selectPop);
    selectPop.addEventListener("click", function (e) { e.stopPropagation(); });
    $("#sm-select-x", selectPop).addEventListener("click", closeSelector);

    addEventListener("click", function (e) {
      if (attachPop && !attachPop.hidden && !attachPop.contains(e.target) && e.target !== activeAttachBtn) closeAttach();
      if (selectPop && !selectPop.hidden && !selectPop.contains(e.target) && e.target !== activeSelectBtn) closeSelector();
    });
    addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeAttach(); closeSelector(); closeRemote(); }
    });
  }

  function positionPop(pop, anchor) {
    if (!pop || !anchor) return;
    pop.hidden = false;
    var r = anchor.getBoundingClientRect();
    var w = pop.offsetWidth;
    var h = pop.offsetHeight;
    var vw = innerWidth;
    var vh = innerHeight;
    var left = Math.max(8, Math.min(r.left, vw - w - 8));
    pop.style.left = left + "px";
    if (r.top > h + 14) {
      pop.style.top = "auto";
      pop.style.bottom = (vh - r.top + 7) + "px";
    } else {
      pop.style.bottom = "auto";
      pop.style.top = (Math.min(r.bottom + 7, vh - h - 8)) + "px";
    }
  }

  function closeAttach() {
    if (!attachPop) return;
    attachPop.hidden = true;
    if (activeAttachBtn) {
      activeAttachBtn.classList.remove("on");
      activeAttachBtn.setAttribute("aria-expanded", "false");
    }
    activeAttachBtn = null;
  }

  function closeSelector() {
    if (!selectPop) return;
    selectPop.hidden = true;
    if (activeSelectBtn) activeSelectBtn.classList.remove("on");
    activeSelectBtn = null;
    activeSelectKind = null;
  }

  function closeRemote() {
    clearTimeout(remoteClickTimer);
    if (remoteBack) remoteBack.hidden = true;
    if (remotePop) remotePop.hidden = true;
    remotePending = [];
  }

  function closePickers() {
    closeAttach();
    closeSelector();
    closeRemote();
    closeArchiveConfirm();
  }

  function openAttach(box, btn) {
    if (!attachPop) return;
    if (!attachPop.hidden && activeComposer === box) { closeAttach(); return; }
    closeSelector();
    closeRemote();
    if (activeAttachBtn && activeAttachBtn !== btn) {
      activeAttachBtn.classList.remove("on");
      activeAttachBtn.setAttribute("aria-expanded", "false");
    }
    activeComposer = box;
    activeAttachBtn = btn;
    positionPop(attachPop, btn);
    btn.classList.add("on");
    btn.setAttribute("aria-expanded", "true");
  }

  function openSelector(box, btn, kind) {
    if (!selectPop) return;
    if (!selectPop.hidden && activeComposer === box && activeSelectKind === kind) { closeSelector(); return; }
    closeAttach();
    closeRemote();
    if (activeSelectBtn && activeSelectBtn !== btn) activeSelectBtn.classList.remove("on");
    activeComposer = box;
    activeSelectBtn = btn;
    activeSelectKind = kind;
    renderSelector();
    positionPop(selectPop, btn);
    btn.classList.add("on");
  }

  function openRemote(box) {
    if (!box || !remotePop) return;
    closeAttach();
    closeSelector();
    activeComposer = box;
    clearTimeout(remoteClickTimer);
    var tempBox = isTempComposer(box);
    remoteWsId = tempBox ? (tempWs || "") : (currentView === "new" ? lastWorkspace : (currentWs || lastWorkspace || ""));
    remoteDir = [];
    remoteOpenDirs = {};
    remoteSearch = "";
    remotePending = composerState(box).files.slice();
    var search = $("#sm-remote-search", remotePop);
    if (search) search.value = "";
    renderRemote();
    if (remoteBack) remoteBack.hidden = false;
    remotePop.hidden = false;
    if (search) setTimeout(function () { search.focus(); }, 0);
  }

  function handleLocalFiles() {
    if (!activeComposer || !localInput) return;
    var st = composerState(activeComposer);
    Array.prototype.forEach.call(localInput.files || [], function (file) {
      var exists = (st.local || []).some(function (f) { return f.name === file.name && f.size === file.size; });
      if (!exists) st.local.push({ name: file.name, size: file.size, type: file.type || "" });
    });
    renderComposerChips(activeComposer);
    localInput.value = "";
  }

  function commitRemote() {
    if (activeComposer) {
      var st = composerState(activeComposer);
      st.files = remotePending.slice();
      renderComposerChips(activeComposer);
    }
    closeRemote();
  }

  function remoteRootPath() {
    var d = remoteWsId && WS[remoteWsId];
    return (d && d.path) || "/home/manuel/Downloads/random_projects/codingPlatform";
  }

  function remoteFullPath() {
    var root = remoteRootPath().replace(/\/$/, "");
    return root + (remoteDir.length ? "/" + remoteDir.join("/") : "");
  }

  function remoteNode() {
    var node = treeRoot;
    for (var i = 0; i < remoteDir.length; i++) {
      var next = null;
      (node.children || []).some(function (c) {
        if (c.type === "dir" && c.name === remoteDir[i]) { next = c; return true; }
        return false;
      });
      if (!next) { remoteDir = remoteDir.slice(0, i); break; }
      node = next;
    }
    return node || treeRoot;
  }

  function renderRemotePath() {
    var p = $("#sm-remote-path", remotePop);
    var full = remoteFullPath();
    if (p) { p.textContent = full; p.title = full; p.scrollLeft = 0; }
    var up = $("#sm-remote-up", remotePop);
    if (up) up.disabled = remoteDir.length === 0;
  }

  function remoteFileRow(path, depth, parentLabel) {
    var st = composerState(activeComposer);
    var f = fileMap[path] || {};
    var kind = f.kind || kindOf(path);
    var on = remotePending.indexOf(path) !== -1;
    var row = document.createElement("button");
    row.type = "button";
    row.className = "sm-exp-row file" + (on ? " on" : "");
    row.style.paddingLeft = (5 + depth * 11) + "px";
    row.title = remoteRootPath().replace(/\/$/, "") + path;
    row.innerHTML = '<span class="ico">' + iconFor(kind) + '</span><span class="nm">' + esc(baseName(path)) + '</span>' +
      (parentLabel ? '<span class="sm-remote-parent">' + esc(parentLabel) + '</span>' : '') +
      '<span class="meta">' + esc(f.size || "") + '</span><span class="sm-remote-check">' + (on ? "✓" : "＋") + '</span>';
    row.addEventListener("click", function () {
      clearTimeout(remoteClickTimer);
      var idx = remotePending.indexOf(path);
      if (idx === -1) remotePending.push(path);
      else remotePending = remotePending.filter(function (p) { return p !== path; });
      on = !on;
      row.classList.toggle("on", on);
      row.querySelector(".sm-remote-check").textContent = on ? "✓" : "＋";
      updateRemoteCount();
    });
    row.addEventListener("dblclick", function (e) {
      e.preventDefault();
      if (remotePending.indexOf(path) === -1) remotePending.push(path);
      row.classList.add("on");
      row.querySelector(".sm-remote-check").textContent = "✓";
      updateRemoteCount();
    });
    return row;
  }

  function renderRemoteSearch(q) {
    var list = $("#sm-remote-list", remotePop);
    list.innerHTML = "";
    var node = remoteNode();
    var base = remoteDir.length ? "/" + remoteDir.join("/") : "";
    var matches = [];
    function walk(n, rel) {
      (n.children || []).forEach(function (c) {
        var next = rel + "/" + c.name;
        if (c.type === "dir") walk(c, next);
        else if (next.toLowerCase().indexOf(q) !== -1 || c.name.toLowerCase().indexOf(q) !== -1) matches.push({ path: c.path, rel: next });
      });
    }
    walk(node, base);
    matches.sort(function (a, b) { return a.rel.localeCompare(b.rel); }).forEach(function (m) {
      var parent = m.rel.split("/").slice(0, -1).join("/") || "/";
      list.appendChild(remoteFileRow(m.path, 0, parent));
    });
    if (!matches.length) {
      var empty = document.createElement("div");
      empty.className = "sm-remote-empty";
      empty.textContent = "No files match that search.";
      list.appendChild(empty);
    }
    updateRemoteCount();
  }

  function renderRemote() {
    if (!activeComposer || !remotePop) return;
    var temp = isTempComposer(activeComposer);
    var sub = $("#sm-remote-sub", remotePop);
    if (sub) sub.textContent = temp ? "optional context · read-only" : ((currentWs || lastWorkspace) + " · read-only");
    show($("#sm-remote-ctx", remotePop), temp);
    if (temp) {
      var wsWrap = $("#sm-remote-ws", remotePop);
      wsWrap.innerHTML = "";
      var choices = [{ id: "", label: "No context" }].concat(Object.keys(WS).map(function (id) { return { id: id, label: id }; }));
      choices.forEach(function (c) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "sm-wschoice" + ((tempWs || "") === c.id ? " on" : "");
        b.textContent = c.label;
        b.addEventListener("click", function () { setTempWorkspace(c.id, activeComposer); });
        wsWrap.appendChild(b);
      });
    }
    renderRemotePath();
    renderRemoteFiles();
  }

  function renderRemoteFiles() {
    if (!activeComposer || !remotePop) return;
    var list = $("#sm-remote-list", remotePop);
    if (!list) return;
    var q = (remoteSearch || "").trim().toLowerCase();
    if (q) { renderRemoteSearch(q); return; }
    var node = remoteNode();
    var base = remoteDir.length ? "/" + remoteDir.join("/") : "";
    list.innerHTML = "";
    var count = 0;

    function walk(n, depth, relBase) {
      var items = (n.children || []).slice().sort(function (a, b) {
        if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      items.forEach(function (c) {
        var rel = relBase + "/" + c.name;
        if (c.type === "dir") {
          var open = !!remoteOpenDirs[rel];
          var row = document.createElement("button");
          row.type = "button";
          row.className = "sm-exp-row dir" + (open ? " open" : "");
          row.style.paddingLeft = (5 + depth * 11) + "px";
          row.setAttribute("aria-expanded", String(open));
          row.title = remoteRootPath().replace(/\/$/, "") + rel;
          row.innerHTML = '<span class="ico">' + (open ? "▾" : "▸") + '</span><span class="nm">' + esc(c.name) + '</span><span class="meta">folder</span>';
          row.addEventListener("click", function () {
            clearTimeout(remoteClickTimer);
            remoteClickTimer = setTimeout(function () {
              if (remoteOpenDirs[rel]) delete remoteOpenDirs[rel];
              else remoteOpenDirs[rel] = true;
              renderRemoteFiles();
            }, 220);
          });
          row.addEventListener("dblclick", function (e) {
            e.preventDefault();
            clearTimeout(remoteClickTimer);
            remoteDir = rel.split("/").filter(Boolean);
            remoteOpenDirs = {};
            remoteSearch = "";
            var search = $("#sm-remote-search", remotePop);
            if (search) search.value = "";
            renderRemote();
          });
          list.appendChild(row);
          count++;
          if (open) walk(c, depth + 1, rel);
        } else {
          list.appendChild(remoteFileRow(c.path, depth, ""));
          count++;
        }
      });
    }

    walk(node, 0, base);
    if (!count) {
      var empty = document.createElement("div");
      empty.className = "sm-remote-empty";
      empty.textContent = "This folder is empty.";
      list.appendChild(empty);
    }
    updateRemoteCount();
  }

  function updateRemoteCount() {
    if (!activeComposer || !remotePop) return;
    var st = composerState(activeComposer);
    var el = $("#sm-remote-count", remotePop);
    if (el) {
      var n = remotePending.length;
      var local = st.local.length;
      el.textContent = (n ? n + " selected" : "No files selected") + (local ? " · " + local + " local" : "");
    }
  }

  function renderSelector() {
    if (!activeComposer || !selectPop) return;
    var st = composerState(activeComposer);
    var m = modelById(st.model);
    var title = $("#sm-select-title", selectPop);
    var body = $("#sm-select-body", selectPop);
    if (title) title.textContent = activeSelectKind === "model" ? "Model" : "Reasoning effort";
    if (body) {
      body.innerHTML = "";
      if (activeSelectKind === "model") {
        MODELS.forEach(function (item) {
          var on = item.id === st.model;
          var row = document.createElement("button");
          row.type = "button";
          row.className = "sm-select-row" + (on ? " on" : "");
          row.innerHTML = '<span class="sm-sr-main"><b>' + esc(item.label) + '</b><small>' + esc(item.note) + '</small></span><span class="sm-sr-check">' + (on ? "✓" : "") + "</span>";
          row.addEventListener("click", function () { chooseModel(item.id); });
          body.appendChild(row);
        });
      } else {
        m.efforts.forEach(function (id) {
          var on = id === st.effort;
          var e = effortById(id);
          var row = document.createElement("button");
          row.type = "button";
          row.className = "sm-select-row" + (on ? " on" : "");
          row.innerHTML = '<span class="sm-sr-main"><b>' + esc(e.label) + '</b><small>' + esc(e.note) + '</small></span><span class="sm-sr-check">' + (on ? "✓" : "") + "</span>";
          row.addEventListener("click", function () { chooseEffort(id); });
          body.appendChild(row);
        });
      }
    }
    var foot = $(".sm-pop-f span", selectPop);
    if (foot) foot.textContent = activeSelectKind === "model" ? "Reasoning: " + effortById(st.effort).label : m.label;
  }

  function chooseModel(id) {
    if (!activeComposer) return;
    var st = composerState(activeComposer);
    var m = modelById(id);
    st.model = m.id;
    if (m.efforts.indexOf(st.effort) === -1) st.effort = m.defaultEffort || m.efforts[0];
    updateComposerButtons(activeComposer);
    closeSelector();
  }

  function chooseEffort(id) {
    if (!activeComposer) return;
    var st = composerState(activeComposer);
    var m = modelById(st.model);
    if (m.efforts.indexOf(id) === -1) return;
    st.effort = id;
    updateComposerButtons(activeComposer);
    closeSelector();
  }

