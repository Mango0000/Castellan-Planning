(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  var store = {
    get: function (k, fb) {
      try { var v = localStorage.getItem("blueprint." + k); return v === null ? fb : JSON.parse(v); }
      catch (e) { return fb; }
    },
    set: function (k, v) {
      try { localStorage.setItem("blueprint." + k, JSON.stringify(v)); } catch (e) {}
    }
  };

  /* ---------- theme ---------- */
  var themeBtn = $("#theme-btn");
  var savedTheme = store.get("theme", null);
  var prefersDark = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = savedTheme || (prefersDark ? "dark" : "light");
  function syncTheme() {
    var dark = root.dataset.theme === "dark";
    var label = "Switch to " + (dark ? "light" : "dark") + " theme";
    themeBtn.textContent = dark ? "☀" : "☾";
    themeBtn.setAttribute("aria-label", label);
    themeBtn.setAttribute("aria-pressed", dark ? "true" : "false");
    themeBtn.title = label;
  }
  syncTheme();
  themeBtn.addEventListener("click", function () {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    store.set("theme", root.dataset.theme);
    syncTheme();
    syncMockThemes();
  });

  /* ---------- embedded mockups: theme sync ---------- */
  function syncMockThemes() {
    $$("iframe.mock-frame").forEach(function (f) {
      try {
        if (f.contentWindow) {
          f.contentWindow.postMessage({ type: "mock-theme", theme: root.dataset.theme }, "*");
        }
      } catch (e) {}
    });
  }
  $$("iframe.mock-frame").forEach(function (f) {
    f.addEventListener("load", syncMockThemes);
  });
  addEventListener("message", function (e) {
    if (!e.data) return;
    if (e.data.type === "mock-theme-request") syncMockThemes();
    if (e.data.type === "mock-theme-change" && (e.data.theme === "light" || e.data.theme === "dark")) {
      root.dataset.theme = e.data.theme;
      store.set("theme", e.data.theme);
      syncTheme();
      syncMockThemes();
    }
  });
  addEventListener("load", function () { syncMockThemes(); });
  setTimeout(syncMockThemes, 400);

  /* ---------- reading progress ---------- */
  var readbar = $("#readbar"), ticking = false;
  function paintProgress() {
    var max = root.scrollHeight - root.clientHeight;
    readbar.style.width = (max > 0 ? Math.min(100, (root.scrollTop / max) * 100) : 0) + "%";
    ticking = false;
  }
  addEventListener("scroll", function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function () {
        paintProgress();
        if (root.scrollTop < 180) {
          $$(".toc a").forEach(function (a) { a.classList.remove("on"); });
        }
      });
    }
  }, { passive: true });
  paintProgress();

  /* ---------- mobile contents ---------- */
  var menuBtn = $("#menu-btn"), sidebar = $("#toc");
  function closeMenu() {
    sidebar.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  }
  menuBtn.addEventListener("click", function () {
    var open = sidebar.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  sidebar.addEventListener("click", function (e) { if (e.target.closest("a")) closeMenu(); });
  addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  /* ---------- fold all ---------- */
  var foldBtn = $("#fold-all");
  foldBtn.addEventListener("click", function () {
    var all = $$("details.sec");
    var anyOpen = all.some(function (d) { return d.open; });
    all.forEach(function (d) { d.open = !anyOpen; });
    foldBtn.textContent = anyOpen ? "Expand all" : "Collapse all";
  });
  document.addEventListener("toggle", function (e) {
    var d = e.target;
    if (!d || d.tagName !== "DETAILS" || !d.classList.contains("sec")) return;
    var all = $$("details.sec");
    var open = all.filter(function (x) { return x.open; }).length;
    foldBtn.textContent = open === 0 ? "Expand all" : "Collapse all";
  }, true);

  /* ---------- scroll spy ---------- */
  var tocLinks = $$(".toc a");
  var linkMap = {};
  tocLinks.forEach(function (a) { linkMap[a.getAttribute("href").slice(1)] = a; });
  var sections = $$("main section[id]");
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        tocLinks.forEach(function (a) { a.classList.remove("on"); });
        if (linkMap[en.target.id]) linkMap[en.target.id].classList.add("on");
      });
    }, { rootMargin: "-12% 0px -68% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }
  function openFromHash() {
    var id = location.hash.slice(1);
    if (!id) return;
    var sec = document.getElementById(id);
    if (!sec) return;
    var d = sec.querySelector("details.sec");
    if (d && !d.open) d.open = true;
    if (linkMap[id]) { tocLinks.forEach(function (a) { a.classList.remove("on"); }); linkMap[id].classList.add("on"); }
  }
  addEventListener("hashchange", openFromHash);
  openFromHash();

  /* ---------- checklists ---------- */
  var checks = $$("input.chk");
  var saved = store.get("checks", {});
  checks.forEach(function (c) { c.checked = !!saved[c.dataset.k]; });

  function stats(groupSel) {
    var items = $$(groupSel + " input.chk");
    var done = items.filter(function (i) { return i.checked; }).length;
    return { done: done, total: items.length, pct: items.length ? (done / items.length) * 100 : 0 };
  }
  function renderProgress() {
    var mvp = stats('[data-group="mvp"]');
    var road = stats('[data-group="roadmap"]');
    $("#mvp-bar").style.width = mvp.pct + "%";
    $("#mvp-count").innerHTML = "<b>" + mvp.done + "</b> / " + mvp.total;
    $("#scope-bar").style.width = mvp.pct + "%";
    $("#scope-count").textContent = mvp.done + " / " + mvp.total;
    $("#roadmap-bar").style.width = road.pct + "%";
    $("#roadmap-count").innerHTML = "<b>" + road.done + "</b> / " + road.total;
  }
  checks.forEach(function (c) {
    c.addEventListener("change", function () {
      var s = store.get("checks", {});
      if (c.checked) { s[c.dataset.k] = true; } else { delete s[c.dataset.k]; }
      store.set("checks", s);
      renderProgress();
    });
  });
  renderProgress();
  $("#reset-all").addEventListener("click", function () {
    if (!confirm("Clear every saved tick in this document?")) return;
    store.set("checks", {});
    checks.forEach(function (c) { c.checked = false; });
    renderProgress();
  });

  /* ---------- architecture explorer ---------- */
  var LAYERS = {
    web: {
      title: "Web UI", sub: "Next.js · App Router", pill: ["V1", "run"],
      desc: "Renders state and captures intent. No secrets, no repository paths, no provider credentials — those stop at the API.",
      owns: "rail shell, task views, context rail, dashboard renderer, WS client",
      never: "talks to app-server directly, or stores a provider token",
      fails: "stale view → reconnect and replay after the last sequence number"
    },
    api: {
      title: "Control plane", sub: "FastAPI · Postgres", pill: ["V1", "run"],
      desc: "Owns identity, the task state machine, policy and the append-only event log. The only component that talks to both sides.",
      owns: "auth, projects, tasks, chats, dashboards, dev-server actions, approvals, WS fanout",
      never: "runs agent code, git commands or containers",
      fails: "restart is safe — state lives in Postgres; the runner reconnects"
    },
    agent: {
      title: "Agent layer", sub: "adapter registry + normalizer", pill: ["V1", "run"],
      desc: "One contract, a registry of adapters, and a normalizer that flattens provider events into a stable schema.",
      owns: "capability flags, session mapping, policy translation",
      never: "leaks provider-specific payloads into UI queries — keep them in raw",
      fails: "unknown events are stored as provider.raw, never dropped"
    },
    runner: {
      title: "Runner", sub: "execution box · outbound WSS", pill: ["V1", "run"],
      desc: "Runs next to the repository. Dials out to the API and accepts no inbound connections.",
      owns: "process lifecycle, dev server, stdio JSON-RPC, git, containers, redaction",
      never: "listens publicly, holds user sessions, or stores secrets in the DB",
      fails: "crash → task marked orphaned; resumes by thread id on restart"
    },
    codex: {
      title: "Codex app-server", sub: "JSON-RPC over stdio", pill: ["V1", "run"],
      desc: "The actual agent runtime. Threads, turns, items, approvals and sandbox policy are owned by Codex — not by you.",
      owns: "conversation state, tool execution, sandbox, model access",
      never: "sees your users or your database",
      fails: "version drift → pinned binary plus a schema contract test in CI"
    },
    workspace: {
      title: "Workspace", sub: "worktree + container", pill: ["V1", "run"],
      desc: "A branch per task inside a container, with the project's secrets injected at runtime and never written to disk in the repo.",
      owns: "files, dependencies, build output, test runs",
      never: "is the only copy of the repository",
      fails: "disk pressure → fail fast with a clear error instead of hanging"
    },
    data: {
      title: "Data", sub: "events · audit · artifacts", pill: ["V1", "run"],
      desc: "Postgres is the source of truth. Events are append-only; everything the UI shows can be rebuilt from them.",
      owns: "tasks, events, approvals, dashboards, audit, usage, artifact references",
      never: "stores plaintext secrets or unlimited terminal scrollback",
      fails: "events grow → monthly partitions, archive to object storage after 90 days"
    }
  };
  function renderLayer(key) {
    var l = LAYERS[key], el = $("#arch-detail");
    if (!l || !el) return;
    el.innerHTML =
      '<div class="ad-k"><h4>' + l.title + '</h4><span class="pill ' + l.pill[1] + '">' + l.pill[0] + "</span></div>" +
      '<div class="ad-sub">' + l.sub + "</div><p>" + l.desc + "</p>" +
      '<div class="ad-row"><span>Owns</span><span>' + l.owns + "</span></div>" +
      '<div class="ad-row never"><span>Never</span><span>' + l.never + "</span></div>" +
      '<div class="ad-row"><span>Fails</span><span>' + l.fails + "</span></div>";
  }
  $$(".layer").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $$(".layer").forEach(function (b) { b.setAttribute("aria-selected", "false"); });
      btn.setAttribute("aria-selected", "true");
      renderLayer(btn.dataset.layer);
    });
  });
  renderLayer("web");

  /* ---------- print ---------- */
  addEventListener("beforeprint", function () {
    $$("details").forEach(function (d) { d.dataset.wasOpen = d.open ? "1" : "0"; d.open = true; });
    $$("iframe.mock-frame").forEach(function (f) {
      try { f.contentWindow.postMessage({ type: "mock-theme", theme: "light" }, "*"); } catch (e) {}
    });
  });
  addEventListener("afterprint", function () {
    $$("details").forEach(function (d) { d.open = d.dataset.wasOpen === "1"; });
    syncMockThemes();
  });
})();
