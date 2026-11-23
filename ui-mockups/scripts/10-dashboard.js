/* 10-dashboard — workspace dashboard and dev-server state */

  /* ------------------------------------------------------------- dashboard */

  function renderServer(ws) {
    var d = WS[ws];
    if (!d) return;
    var s = d.server;
    var pill = $("#wd-server-pill");
    if (pill) {
      pill.className = "pill " + (s.busy ? "wait" : (s.running ? "run" : ""));
      pill.textContent = s.busy ? (s.running ? "restarting" : "starting") : (s.running ? "running" : "stopped");
      $("#wd-server-url").textContent = s.running ? "localhost:" + s.port : "not running";
      $("#wd-server-meta").textContent = s.running ? (s.busy ? "starting…" : s.cmd + " · " + s.meta) : "start it to open the preview";
      var btn = $("#wd-server-btn");
      btn.textContent = s.busy ? (s.running ? "Restarting…" : "Starting…") : (s.running ? "Restart" : "Start");
      btn.disabled = !!s.busy;
      var state = $("#wd-state");
      if (state) {
        state.className = "pill " + (s.running ? "run" : "");
        state.textContent = s.running ? "dev running" : "idle";
      }
    }
    var pstart = $("#sm-ctx-preview-start");
    if (pstart) pstart.disabled = !!s.busy;
    if (currentWs === ws) renderPreview(ws);
  }

  function renderPreview(ws) {
    var d = WS[ws];
    if (!d) return;
    var s = d.server;
    $("#sm-ctx-url").textContent = s.running ? "localhost:" + s.port : "server stopped";
    $("#sm-ctx-url-dot").className = "sm-dot" + (s.running ? " run" : "");
    show($("#sm-ctx-preview-site"), s.running);
    show($("#sm-ctx-preview-off"), !s.running);
    var name = $("#sm-preview-ws");
    if (name) name.textContent = d.name;
    var term = $("#sm-ctx-term-title");
    if (term) term.textContent = d.name;
  }

  function renderDashboard(ws) {
    var d = WS[ws];
    if (!d) return;
    dashboardWs = ws;
    $("#wd-crumb").textContent = d.name;
    $("#wd-branch").textContent = d.branch;
    $("#wd-branch-chip").textContent = d.branch;
    $("#wd-name").textContent = d.name;
    $("#wd-desc").textContent = d.desc;
    $("#wd-tags").innerHTML = d.tags.map(function (t) { return '<span class="sm-chip-soft">' + t + "</span>"; }).join("");
    $("#wd-about").textContent = d.about;
    $("#wd-about-tags").innerHTML = d.tags.map(function (t) { return '<span class="sm-chip-soft">' + t + "</span>"; }).join("");
    $("#wd-change-file").textContent = d.change.file;
    $("#wd-change-nums").textContent = "+" + d.change.add + " −" + d.change.del;

    if (d.task) {
      $("#wd-task-pill").className = "pill " + d.task.cls;
      $("#wd-task-pill").textContent = d.task.pill;
      $("#wd-task-title").textContent = d.task.title;
      $("#wd-task-meta").textContent = d.task.meta;
      $("#wd-task-open").hidden = false;
    } else {
      $("#wd-task-pill").className = "pill";
      $("#wd-task-pill").textContent = "idle";
      $("#wd-task-title").textContent = "No active session";
      $("#wd-task-meta").textContent = "Start one from the rail";
      $("#wd-task-open").hidden = true;
    }

    $("#wd-extra").hidden = true;
    $("#wd-add-widget").hidden = false;
    $("#sm-dash").classList.remove("editing");
    $("#wd-edit").textContent = "Edit layout";
    renderServer(ws);
  }

  function toggleServer(ws) {
    var s = WS[ws].server;
    if (s.busy) return;
    var wasRunning = s.running;
    s.busy = true;
    renderServer(ws);
    setTimeout(function () {
      s.running = true;
      s.busy = false;
      s.meta = wasRunning ? "restarted just now" : "started just now";
      renderServer(ws);
    }, 700);
  }


  /* ------------------------------------------------------ global dashboard */

  var globalHiddenCards = {};

  function renderGlobalDashboard() {
    var grid = $("#g-dash-grid", shell);
    if (!grid) return;
    $$("[data-g-ws]", grid).forEach(function (el) { el.remove(); });
    var keys = Object.keys(WS).filter(function (id) { return !globalHiddenCards[id]; });
    var active = 0;
    var attention = 0;
    var running = 0;
    keys.forEach(function (id) {
      var d = WS[id];
      var card = document.createElement("section");
      card.className = "sm-gw-card";
      card.dataset.gWs = id;

      var head = document.createElement("div");
      head.className = "sm-gw-head";
      var ic = document.createElement("span");
      ic.className = "ic";
      ic.textContent = "◇";
      var name = document.createElement("b");
      name.textContent = id;
      var branch = document.createElement("span");
      branch.className = "sm-gw-branch";
      branch.textContent = d.branch;
      var pill = document.createElement("span");
      pill.className = "pill " + (d.task ? d.task.cls : "");
      pill.textContent = d.task ? d.task.pill : "idle";
      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "sm-gw-remove";
      remove.textContent = "×";
      remove.title = "Remove " + id + " from dashboard";
      remove.setAttribute("aria-label", "Remove " + id + " from dashboard");
      remove.addEventListener("click", function (e) {
        e.stopPropagation();
        globalHiddenCards[id] = true;
        renderGlobalDashboard();
      });
      head.appendChild(ic);
      head.appendChild(name);
      head.appendChild(branch);
      head.appendChild(pill);
      head.appendChild(remove);

      var task = document.createElement("p");
      task.className = "sm-gw-task" + (d.task ? "" : " idle");
      task.textContent = d.task ? d.task.title : "No active task";
      var meta = document.createElement("div");
      meta.className = "sm-gw-meta";
      var dot = document.createElement("span");
      dot.className = "sm-gw-dot" + (d.server.running ? " run" : "");
      var state = document.createElement("span");
      state.textContent = d.server.running ? "dev running" : "server stopped";
      var change = document.createElement("span");
      change.className = "sm-gw-change";
      change.textContent = (d.change && d.change.file !== "—") ? d.change.file + " +" + d.change.add + " −" + d.change.del : "no changes";
      meta.appendChild(dot);
      meta.appendChild(state);
      meta.appendChild(change);

      var foot = document.createElement("div");
      foot.className = "sm-gw-foot";
      var open = document.createElement("button");
      open.type = "button";
      open.className = "sm-gw-open";
      open.textContent = "Open workspace →";
      open.addEventListener("click", function () { openView("dashboard", { ws: id }); });
      foot.appendChild(open);

      card.appendChild(head);
      card.appendChild(task);
      card.appendChild(meta);
      card.appendChild(foot);
      grid.appendChild(card);

      if (d.task) active++;
      if (d.task && d.task.cls === "wait") attention++;
      if (d.server.running) running++;
    });
    $("#g-dash-count").textContent = keys.length + " workspaces";
    $("#g-stat-ws").textContent = keys.length;
    $("#g-stat-active").textContent = active;
    $("#g-stat-attention").textContent = attention;
    $("#g-stat-servers").textContent = running;
  }

  function applyGlobalDashboardPrompt(prompt) {
    prompt = (prompt || "").trim();
    if (!prompt) return;
    var card = $("#g-dash-ai-card", shell);
    var text = $("#g-dash-ai-text", shell);
    var custom = $("#g-dash-custom", shell);
    if (card) card.hidden = false;
    if (text) text.textContent = "Codex updated this dashboard for: “" + prompt + "”. The view is now grouped around work that needs attention and recent changes.";
    if (custom) custom.innerHTML = '<span class="sm-spark">✦</span> Customized by Codex · just now';
    var promptInput = $("#g-dash-prompt", shell);
    if (promptInput) promptInput.value = "";
    var grid = $("#g-dash-grid", shell);
    if (grid && /attention/i.test(prompt)) {
      var cards = $$("[data-g-ws]", grid);
      cards.sort(function (a, b) {
        var da = WS[a.dataset.gWs], db = WS[b.dataset.gWs];
        var wa = da && da.task && da.task.cls === "wait" ? 0 : 1;
        var wb = db && db.task && db.task.cls === "wait" ? 0 : 1;
        return wa - wb;
      });
      cards.forEach(function (c) { grid.appendChild(c); });
    }
  }

  function initGlobalDashboard() {
    var input = $("#g-dash-prompt", shell);
    var send = $("#g-dash-send", shell);
    if (send) send.addEventListener("click", function () { applyGlobalDashboardPrompt(input ? input.value : ""); });
    if (input) input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); applyGlobalDashboardPrompt(input.value); }
    });
    var aiRow = $("#g-dash-ai-row", shell);
    if (aiRow && !aiRow.__composer) {
      var first = modelById("");
      aiRow.__composer = { model: first.id, effort: first.defaultEffort || "high", files: [], local: [] };
      var aiModel = $("#g-ai-model", shell);
      var aiEffort = $("#g-ai-effort", shell);
      aiRow.__composer.modelBtn = aiModel;
      aiRow.__composer.effortBtn = aiEffort;
      updateComposerButtons(aiRow);
      if (aiModel) aiModel.addEventListener("click", function (e) {
        e.stopPropagation();
        openSelector(aiRow, aiModel, "model");
      });
      if (aiEffort) aiEffort.addEventListener("click", function (e) {
        e.stopPropagation();
        openSelector(aiRow, aiEffort, "effort");
      });
    }
    $$("[data-g-prompt]", shell).forEach(function (b) {
      b.addEventListener("click", function () {
        if (input) input.value = b.dataset.gPrompt || "";
        applyGlobalDashboardPrompt(b.dataset.gPrompt || "");
      });
    });
    var bottom = $("#g-dash-ai-bottom", shell);
    var focus = $("#g-dash-ai-focus", shell);
    var toggle = $("#g-dash-hide", shell);
    function setGlobalAiVisible(visible) {
      if (bottom) bottom.classList.toggle("collapsed", !visible);
      if (toggle) {
        toggle.setAttribute("aria-expanded", String(visible));
        var lbl = toggle.querySelector(".lbl");
        if (lbl) lbl.textContent = visible ? "Hide AI composer" : "Show AI composer";
      }
      if (focus) focus.setAttribute("aria-expanded", String(visible));
    }
    if (toggle) toggle.addEventListener("click", function () {
      var show = bottom.classList.contains("collapsed");
      setGlobalAiVisible(show);
      if (show && input) setTimeout(function () { input.focus(); }, 0);
    });
    if (focus) focus.addEventListener("click", function () {
      setGlobalAiVisible(true);
      if (input) { setTimeout(function () { input.focus(); }, 0); input.scrollIntoView({ block: "nearest" }); }
    });

    var globalView = $('.sm-view[data-sm-view="global"]', shell);
    var edit = $("#g-dash-edit", shell);
    function setGlobalEditing(on) {
      if (globalView) globalView.classList.toggle("editing", on);
      if (bottom) bottom.hidden = on;
      if (edit) {
        edit.textContent = on ? "Save" : "Edit";
        edit.classList.toggle("primary", on);
        edit.title = on ? "Save dashboard layout" : "Edit dashboard cards";
      }
      if (focus) focus.hidden = on;
    }
    if (edit) edit.addEventListener("click", function () {
      setGlobalEditing(!(globalView && globalView.classList.contains("editing")));
    });
  }
