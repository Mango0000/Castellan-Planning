/* 70-composer — model/effort state, toolbar and composer chips */

  /* ------------------------------------------------------- composers */

  var MODELS = window.CODEX_MODELS || [];
  var EFFORTS = window.CODEX_EFFORTS || {};
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

  function composerState(box) {
    if (!box.__composer) {
      var first = modelById("");
      box.__composer = {
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
    st.modelBtn.querySelector(".sm-mlabel").textContent = m.short;
    st.modelBtn.title = "Model: " + m.label;
    st.effortBtn.querySelector(".sm-elabel").textContent = e.short;
    st.effortBtn.title = "Reasoning effort: " + e.label;
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
    if (isTempComposer(box)) {
      if (tempWs) {
        wrap.appendChild(chipEl("◈", tempWs, "Workspace context · read-only", "ws", function () {
          setTempWorkspace("", box);
        }));
      } else if (tempFolder) {
        var seg = tempFolder.split("/").filter(Boolean);
        wrap.appendChild(chipEl("▸", seg.length ? seg[seg.length - 1] : tempFolder, tempFolder, "folder", function () {
          setTempFolder("", box);
        }));
      }
    }
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
      var tools = document.createElement("div");
      tools.className = "sm-compose-tools";
      tools.innerHTML =
        '<button class="sm-plusbtn" type="button" aria-label="Add context" title="Add files or context" aria-expanded="false">＋</button>' +
        '<span class="sm-tools-sp"></span>' +
        '<button class="sm-modelbtn" type="button"><span class="sm-mlabel"></span><i>▾</i></button>' +
        '<button class="sm-effortbtn" type="button"><span class="sm-elabel"></span><i>▾</i></button>';
      box.insertBefore(tools, box.firstChild);
      var chips = document.createElement("div");
      chips.className = "sm-compose-files";
      chips.hidden = true;
      box.insertBefore(chips, tools.nextSibling);
      st.tools = tools;
      st.chips = chips;
      st.plus = $(".sm-plusbtn", tools);
      st.modelBtn = $(".sm-modelbtn", tools);
      st.effortBtn = $(".sm-effortbtn", tools);
      updateComposerButtons(box);
      renderComposerChips(box);

      st.plus.addEventListener("click", function (e) {
        e.stopPropagation();
        openAttach(box, st.plus);
      });
      st.modelBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        openSelector(box, st.modelBtn, "model");
      });
      st.effortBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        openSelector(box, st.effortBtn, "effort");
      });
    });
    buildPickers();
  }

