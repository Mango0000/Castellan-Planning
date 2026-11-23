/* 70-composer — model/effort state, toolbar and composer chips */

  /* ------------------------------------------------------- composers */

  var MODELS = window.CODEX_MODELS || [];
  var EFFORTS = window.CODEX_EFFORTS || {};
  var MODES = [
    { id: "plan", short: "Plan", label: "Plan mode", note: "Think and propose before changing files" },
    { id: "edit", short: "Edit", label: "Edit mode", note: "Make changes directly in the workspace" },
    { id: "review", short: "Review", label: "Review mode", note: "Read-only inspection and feedback" }
  ];
  var MODEL_FALLBACK = {
    id: "gpt-5.3-codex", short: "5.3 Codex", label: "GPT-5.3 Codex",
    note: "Codex model", efforts: ["low", "medium", "high"], defaultEffort: "high"
  };

  function modelById(id) {
    for (var i = 0; i < MODELS.length; i++) if (MODELS[i].id === id) return MODELS[i];
    return MODELS[0] || MODEL_FALLBACK;
  }

  function effortById(id) {
    return EFFORTS[id] || { label: id || "High", short: id || "High", note: "" };
  }

  function modeById(id) {
    for (var i = 0; i < MODES.length; i++) if (MODES[i].id === id) return MODES[i];
    return MODES[1];
  }

  function composerState(box) {
    if (!box.__composer) {
      var first = modelById("");
      box.__composer = {
        mode: "edit",
        model: first.id,
        effort: first.defaultEffort || "high",
        files: [],
        local: []
      };
    }
    var st = box.__composer;
    var m = modelById(st.model);
    if (m.id !== st.model) st.model = m.id;
    if (m.efforts.indexOf(st.effort) === -1) st.effort = m.defaultEffort || m.efforts[0];
    return st;
  }

  function isTempComposer(box) {
    if (!box) return false;
    var v = box.closest ? box.closest(".sm-view") : null;
    return !!v && (v.dataset.smView === "temp" || v.dataset.smView === "temp-new");
  }

  function updateComposerButtons(box) {
    var st = box.__composer;
    if (!st || !st.modelBtn) return;
    var m = modelById(st.model);
    var e = effortById(st.effort);
    if (st.modeBtn) {
      var mode = modeById(st.mode);
      st.modeBtn.querySelector(".sm-modelabel").textContent = mode.short;
      st.modeBtn.title = "Mode: " + mode.label;
    }
    st.modelBtn.querySelector(".sm-mlabel").textContent = m.short;
    st.modelBtn.title = "Model: " + m.label;
    st.effortBtn.querySelector(".sm-elabel").textContent = e.short;
    st.effortBtn.title = "Reasoning effort: " + e.label;
    if (box.closest && box.closest('.sm-view[data-sm-view="auth"]')) syncQueueSteer(box);
  }

  function syncQueueSteer(box) {
    var queued = $(".sm-queued", shell);
    if (!queued) return;
    var buttons = $$("[data-queue-steer]", queued);
    if (!buttons.length) return;
    var support = $(".sm-queue-support", queued);
    var st = composerState(box);
    var m = modelById(st.model);
    var supported = !!m.steer;
    buttons.forEach(function (btn) {
      btn.disabled = !supported;
      btn.textContent = "Steer current run";
      btn.title = supported ? "Steer the current run toward this queued task" : m.label + " does not support live steering";
    });
    if (support) {
      support.textContent = supported ? m.short + " supports live steering" : m.short + " cannot steer a running run";
      support.title = support.textContent;
    }
  }

  function addSteerEvent(name) {
    var chat = $('.sm-view[data-sm-view="auth"] .sm-chat', shell);
    if (!chat) return;
    var ev = document.createElement("div");
    ev.className = "sm-steer-event";
    ev.innerHTML = '<span class="ic">↳</span><span><b>Steering current run</b> — <code></code> was added to this turn. No second agent was started.</span>';
    var code = ev.querySelector("code");
    if (code) code.textContent = name;
    chat.appendChild(ev);
    chat.scrollTop = chat.scrollHeight;
  }

  function initQueueSteer() {
    var queued = $(".sm-queued", shell);
    if (!queued) return;
    var authBox = $('.sm-view[data-sm-view="auth"] .sm-inputbox', shell);

    function updateQueue() {
      var items = $$("[data-queue-item]", queued);
      var count = items.length;
      var countEl = $("[data-queue-count]", queued);
      if (countEl) countEl.textContent = count === 1 ? "1 task" : count + " tasks";
      var note = $("[data-queue-note]", queued);
      if (note) note.innerHTML = count === 1
        ? "One agent at a time. 1 task is queued for <code>acme-web</code>."
        : "One agent at a time. " + count + " tasks are queued for <code>acme-web</code>.";
      if (!count) {
        queued.remove();
        return;
      }
      syncQueueSteer(authBox);
    }

    $$("[data-queue-item]", queued).forEach(function (item) {
      var removeBtn = $("[data-queue-remove]", item);
      if (removeBtn) {
        removeBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          item.remove();
          updateQueue();
        });
      }
      var steerBtn = $("[data-queue-steer]", item);
      if (steerBtn) {
        steerBtn.addEventListener("click", function () {
          if (!authBox) return;
          var m = modelById(composerState(authBox).model);
          if (!m.steer) return;
          var nameEl = $(".sm-queued-copy b", item);
          var name = nameEl ? nameEl.textContent : "Queued task";
          item.remove();
          addSteerEvent(name);
          updateQueue();
        });
      }
    });
    if (authBox) syncQueueSteer(authBox);
  }

  function chipEl(icon, label, title, cls, onRemove) {
    var chip = document.createElement("span");
    chip.className = "sm-ctxchip " + cls;
    chip.title = title || label;
    var ic = document.createElement("span");
    ic.className = "ci";
    ic.textContent = icon;
    var tx = document.createElement("span");
    tx.className = "tx";
    tx.textContent = label;
    var x = document.createElement("button");
    x.type = "button";
    x.className = "x";
    x.textContent = "×";
    x.setAttribute("aria-label", "Remove " + label);
    x.addEventListener("click", function (e) {
      e.stopPropagation();
      onRemove();
    });
    chip.appendChild(ic);
    chip.appendChild(tx);
    chip.appendChild(x);
    return chip;
  }

  function fileSize(bytes) {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function renderComposerChips(box) {
    if (!box || !box.__composer || !box.__composer.chips) return;
    var st = box.__composer;
    var wrap = st.chips;
    wrap.innerHTML = "";
    st.files.forEach(function (path) {
      var f = fileMeta(path) || {};
      var kind = f.kind || kindOf(path);
      wrap.appendChild(chipEl(iconFor(kind), baseName(path), fullPath(path), "file", function () {
        st.files = st.files.filter(function (p) { return p !== path; });
        renderComposerChips(box);
        if (remotePop && !remotePop.hidden) renderRemote();
      }));
    });
    (st.local || []).forEach(function (file) {
      wrap.appendChild(chipEl("⇪", file.name, "Local file · " + fileSize(file.size), "local", function () {
        st.local = st.local.filter(function (f) { return f !== file; });
        renderComposerChips(box);
      }));
    });
    wrap.hidden = wrap.children.length === 0;
  }

  function renderAllComposerChips() {
    $$(".sm-views .sm-inputbox, .sm-views .sm-bigta", shell).forEach(function (box) {
      if (box.__composer) renderComposerChips(box);
    });
  }

  function enhanceComposers() {
    $$(".sm-views .sm-inputbox, .sm-views .sm-bigta", shell).forEach(function (box) {
      if (box.__composer) return;
      var st = composerState(box);
      var isInput = box.classList.contains("sm-inputbox");
      var plusHTML = '<button class="sm-plusbtn" type="button" aria-label="Add context" title="Add files or context" aria-expanded="false">＋</button>';
      var isTemp = isTempComposer(box);
      var selectorsHTML =
        (isTemp ? "" : '<button class="sm-modebtn" type="button"><span class="sm-modelabel"></span><i>▾</i></button>') +
        '<button class="sm-modelbtn" type="button"><span class="sm-mlabel"></span><i>▾</i></button>' +
        '<button class="sm-effortbtn" type="button"><span class="sm-elabel"></span><i>▾</i></button>' +
        (isTemp ? "" : '<button class="sm-ctxusage" type="button" aria-label="Context usage: 68%" aria-haspopup="dialog" aria-expanded="false" title="Context usage · 68%"><span class="ring" style="--pct:68%"></span><span class="pct">68%</span></button>');
      var tools = document.createElement("div");
      tools.className = "sm-compose-tools sm-compose-toolbar";
      var chips = document.createElement("div");
      chips.className = "sm-compose-files";
      chips.hidden = true;

      if (isInput) {
        var ph = $(".ph, .sm-compose-input", box);
        var send = document.createElement("button");
        send.type = "button";
        send.className = "send";
        send.textContent = "↑";
        send.setAttribute("aria-label", "Send");
        send.title = "Send";
        var row = document.createElement("div");
        row.className = "sm-compose-row";
        row.innerHTML = plusHTML;
        var rowPlus = $(".sm-plusbtn", row);
        if (ph) row.appendChild(ph);
        row.appendChild(send);
        box.appendChild(row);
        box.insertBefore(chips, row);
        tools.innerHTML = selectorsHTML;
        if (box.parentNode) box.parentNode.insertBefore(tools, box.nextSibling);
        st.plus = rowPlus;
      } else {
        var bigRow = document.createElement("div");
        bigRow.className = "sm-compose-row sm-bigta-row";
        bigRow.innerHTML = plusHTML + '<span class="sm-bigta-sp"></span><span class="send">↑</span>';
        box.appendChild(bigRow);
        box.insertBefore(chips, bigRow);
        tools.innerHTML = selectorsHTML;
        if (box.parentNode) box.parentNode.insertBefore(tools, box.nextSibling);
        st.plus = $(".sm-plusbtn", bigRow);
      }
      st.tools = tools;
      st.chips = chips;
      st.modeBtn = $(".sm-modebtn", tools);
      st.modelBtn = $(".sm-modelbtn", tools);
      st.effortBtn = $(".sm-effortbtn", tools);
      st.usage = $(".sm-ctxusage", tools);
      updateComposerButtons(box);
      renderComposerChips(box);

      st.plus.addEventListener("click", function (e) {
        e.stopPropagation();
        openAttach(box, st.plus);
      });
      if (st.modeBtn) st.modeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        openSelector(box, st.modeBtn, "mode");
      });
      st.modelBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        openSelector(box, st.modelBtn, "model");
      });
      st.effortBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        openSelector(box, st.effortBtn, "effort");
      });
      if (st.usage) {
        st.usage.addEventListener("click", function (e) {
          e.stopPropagation();
          openUsage(st.usage, box);
        });
      }
    });
    buildPickers();
  }

  var usagePop = null;
  var usageBtn = null;

  function buildUsage() {
    if (usagePop) return;
    usagePop = document.createElement("div");
    usagePop.className = "sm-pop sm-usage-pop";
    usagePop.id = "sm-usage-pop";
    usagePop.setAttribute("role", "dialog");
    usagePop.setAttribute("aria-label", "Context usage");
    usagePop.hidden = true;
    usagePop.innerHTML =
      '<div class="sm-usage-body">' +
      '<div class="sm-usage-meterrow"><div class="sm-usage-meter">' +
      '<i style="width:9.375%;background:var(--accent)"></i>' +
      '<i style="width:17.1875%;background:var(--blue)"></i>' +
      '<i style="width:24.21875%;background:var(--success)"></i>' +
      '<i style="width:13.28125%;background:var(--warn)"></i>' +
      '<i style="width:3.90625%;background:var(--rose)"></i>' +
      '</div><span class="sm-usage-meterlabel">87k / 128k</span></div>' +
      '<div class="sm-usage-row"><span class="sm-usage-dot" style="background:var(--accent)"></span><span class="nm">Workspace &amp; instructions</span><b>12k</b><small>9%</small></div>' +
      '<div class="sm-usage-row"><span class="sm-usage-dot" style="background:var(--blue)"></span><span class="nm">Open files</span><b>22k</b><small>17%</small></div>' +
      '<div class="sm-usage-row"><span class="sm-usage-dot" style="background:var(--success)"></span><span class="nm">Task thread</span><b>31k</b><small>24%</small></div>' +
      '<div class="sm-usage-row"><span class="sm-usage-dot" style="background:var(--warn)"></span><span class="nm">Tool output</span><b>17k</b><small>13%</small></div>' +
      '<div class="sm-usage-row"><span class="sm-usage-dot" style="background:var(--rose)"></span><span class="nm">Attachments</span><b>5k</b><small>4%</small></div>' +
      '</div>';
    shell.appendChild(usagePop);
    usagePop.addEventListener("click", function (e) { e.stopPropagation(); });
    addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeUsage();
    });
    document.addEventListener("click", function (e) {
      if (!usagePop || usagePop.hidden) return;
      if (usagePop.contains(e.target) || (usageBtn && usageBtn.contains(e.target))) return;
      closeUsage();
    });
  }

  function renderUsage(box) {
    if (!usagePop) return;
    var body = $(".sm-usage-body", usagePop);
    if (!body) return;
    var temp = box && isTempComposer(box);
    var rows = temp ? [
      { color: "var(--accent)", label: "System & instructions", tokens: "8k", pct: "6%", width: 6.25 },
      { color: "var(--blue)", label: "Conversation", tokens: "52k", pct: "41%", width: 40.625 },
      { color: "var(--success)", label: "Attached files", tokens: "14k", pct: "11%", width: 10.9375 },
      { color: "var(--warn)", label: "Tool output", tokens: "13k", pct: "10%", width: 10.15625 }
    ] : [
      { color: "var(--accent)", label: "Workspace & instructions", tokens: "12k", pct: "9%", width: 9.375 },
      { color: "var(--blue)", label: "Open files", tokens: "22k", pct: "17%", width: 17.1875 },
      { color: "var(--success)", label: "Task thread", tokens: "31k", pct: "24%", width: 24.21875 },
      { color: "var(--warn)", label: "Tool output", tokens: "17k", pct: "13%", width: 13.28125 },
      { color: "var(--rose)", label: "Attachments", tokens: "5k", pct: "4%", width: 3.90625 }
    ];
    var html = '<div class="sm-usage-meterrow"><div class="sm-usage-meter">';
    rows.forEach(function (r) {
      html += '<i style="width:' + r.width + '%;background:' + r.color + '"></i>';
    });
    html += '</div><span class="sm-usage-meterlabel">87k / 128k</span></div>';
    rows.forEach(function (r) {
      html += '<div class="sm-usage-row"><span class="sm-usage-dot" style="background:' + r.color + '"></span><span class="nm">' + r.label + '</span><b>' + r.tokens + '</b><small>' + r.pct + '</small></div>';
    });
    body.innerHTML = html;
  }

  function openUsage(btn, box) {
    buildUsage();
    if (!usagePop || (usageBtn === btn && !usagePop.hidden)) {
      closeUsage();
      return;
    }
    closeUsage();
    closeSelector();
    closeAttach();
    closeRemote();
    usageBtn = btn;
    renderUsage(box);
    btn.classList.add("on");
    btn.setAttribute("aria-expanded", "true");
    usagePop.hidden = false;
    positionPop(usagePop, btn, true);
  }

  function closeUsage() {
    if (usageBtn) {
      usageBtn.classList.remove("on");
      usageBtn.setAttribute("aria-expanded", "false");
    }
    if (usagePop) usagePop.hidden = true;
    usageBtn = null;
  }

