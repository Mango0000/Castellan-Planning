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

