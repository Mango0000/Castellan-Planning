/* 25-explorer — file tree, file tabs, Markdown, images, diffs and context sync */

  function fileMeta(path) { return fileMap[path] || null; }

  function extOf(path) {
    var m = /\.([a-z0-9]+)$/i.exec(path || "");
    return m ? m[1].toLowerCase() : "";
  }

  function kindOf(path) {
    var e = extOf(path);
    if (e === "md" || e === "mdx") return "markdown";
    if (["png", "jpg", "jpeg", "gif", "webp", "svg", "avif"].indexOf(e) !== -1) return "image";
    if (e === "html" || e === "htm") return "html";
    return "code";
  }

  function iconFor(kind) {
    return { markdown: "M↓", image: "▧", html: "◫", code: "‹›" }[kind] || "◻";
  }

  function baseName(path) {
    var parts = (path || "").split("/");
    return parts[parts.length - 1] || path;
  }

  function wsRoot() {
    var d = currentWs && WS[currentWs];
    return (d && d.path) || "/home/manuel/Downloads/random_projects/codingPlatform";
  }

  function fullPath(path) {
    return wsRoot().replace(/\/$/, "") + path;
  }

  function countFiles(node) {
    if (!node || !node.children) return 0;
    return node.children.reduce(function (sum, child) {
      return sum + (child.type === "dir" ? countFiles(child) : 1);
    }, 0);
  }

  function renderExplorer() {
    var list = $("#sm-exp-list", shell);
    if (!list || !treeRoot) return;
    var root = wsRoot();
    var pathEl = $("#sm-exp-path", shell);
    if (pathEl) { pathEl.textContent = root; pathEl.title = root; pathEl.scrollLeft = 0; }
    var count = $("#sm-exp-count", shell);
    if (count) count.textContent = countFiles(treeRoot) + " files";
    var savedScroll = list.scrollTop;
    list.innerHTML = "";
    var rows = 0;

    function walk(node, depth, basePath) {
      var items = (node.children || []).slice().sort(function (a, b) {
        if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      items.forEach(function (n) {
        var rel = basePath + "/" + n.name;
        var row = document.createElement("button");
        row.type = "button";
        if (n.type === "dir") {
          var open = !!openDirs[rel];
          row.className = "sm-exp-row dir" + (open ? " open" : "");
          row.style.paddingLeft = (5 + depth * 11) + "px";
          row.setAttribute("aria-expanded", String(open));
          row.title = root.replace(/\/$/, "") + rel;
          row.innerHTML = '<span class="ico">' + (open ? "▾" : "▸") + '</span><span class="nm">' + esc(n.name) + '</span><span class="meta">folder</span>';
          row.addEventListener("click", function () {
            if (openDirs[rel]) delete openDirs[rel];
            else openDirs[rel] = true;
            renderExplorer();
          });
          list.appendChild(row);
          rows++;
          if (open) walk(n, depth + 1, rel);
        } else {
          var f = fileMeta(n.path) || {};
          var kind = f.kind || kindOf(n.path);
          row.className = "sm-exp-row file";
          row.style.paddingLeft = (5 + depth * 11) + "px";
          row.title = fullPath(n.path);
          row.innerHTML = '<span class="ico">' + iconFor(kind) + '</span><span class="nm">' + esc(n.name) + '</span><span class="meta">' + esc(f.size || "file") + '</span>';
          row.addEventListener("click", function () { openFile(n.path); });
          list.appendChild(row);
          rows++;
        }
      });
    }

    walk(treeRoot, 0, "");
    if (!rows) {
      var empty = document.createElement("div");
      empty.className = "sm-exp-empty";
      empty.textContent = "This workspace is empty.";
      list.appendChild(empty);
    }
    list.scrollTop = savedScroll;
  }

  function mdInline(t) {
    t = esc(t);
    t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return t;
  }

  function mdToHtml(md) {
    var lines = (md || "").split("\n");
    var out = [];
    var code = [];
    var inCode = false;
    var inList = false;
    function closeList() { if (inList) { out.push("</ul>"); inList = false; } }
    lines.forEach(function (line) {
      if (/^```/.test(line)) {
        if (inCode) { out.push("<pre><code>" + esc(code.join("\n")) + "</code></pre>"); code = []; inCode = false; }
        else { closeList(); inCode = true; }
        return;
      }
      if (inCode) { code.push(line); return; }
      if (!line.trim()) { closeList(); return; }
      if (/^###\s+/.test(line)) { closeList(); out.push("<h3>" + mdInline(line.replace(/^###\s+/, "")) + "</h3>"); }
      else if (/^##\s+/.test(line)) { closeList(); out.push("<h2>" + mdInline(line.replace(/^##\s+/, "")) + "</h2>"); }
      else if (/^#\s+/.test(line)) { closeList(); out.push("<h1>" + mdInline(line.replace(/^#\s+/, "")) + "</h1>"); }
      else if (/^>\s?/.test(line)) { closeList(); out.push("<blockquote>" + mdInline(line.replace(/^>\s?/, "")) + "</blockquote>"); }
      else if (/^[-*]\s+/.test(line)) {
        if (!inList) { out.push("<ul>"); inList = true; }
        out.push("<li>" + mdInline(line.replace(/^[-*]\s+/, "")) + "</li>");
      } else {
        closeList();
        out.push("<p>" + mdInline(line) + "</p>");
      }
    });
    if (inCode) out.push("<pre><code>" + esc(code.join("\n")) + "</code></pre>");
    closeList();
    return out.join("");
  }

  function renderFile(tab) {
    var f = fileMeta(tab.path);
    if (!f) return;
    var kind = f.kind || kindOf(tab.path);
    var name = baseName(tab.path);
    var full = fullPath(tab.path);
    var ico = $("#sm-file-ico", shell);
    var nm = $("#sm-file-name", shell);
    var pathEl = $("#sm-file-path", shell);
    var kindEl = $("#sm-file-kind", shell);
    var body = $("#sm-file-body", shell);
    if (ico) ico.textContent = iconFor(kind);
    if (nm) nm.textContent = name;
    if (pathEl) { pathEl.textContent = full; pathEl.title = full; }
    if (kindEl) {
      kindEl.textContent = kind === "markdown" ? "Markdown" : kind === "image" ? "Image" :
        kind === "html" ? "HTML" : (f.language ? f.language.toUpperCase() : "Text");
    }
    if (!body) return;
    body.innerHTML = "";
    if (kind === "markdown") {
      body.innerHTML = '<div class="sm-md">' + mdToHtml(f.content) + "</div>";
    } else if (kind === "image") {
      var src = f.src || "";
      if (f.content && f.content.trim().indexOf("<svg") === 0) {
        src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(f.content);
      }
      body.innerHTML = '<div class="sm-imgwrap"><img src="' + src + '" alt="' + esc(name) + '"></div>' +
        '<div class="sm-imgmeta">' + esc(f.size || "") + " · SVG · preview</div>";
    } else if (kind === "html") {
      var site = document.createElement("div");
      site.className = "sm-site-wrap";
      var bar = document.createElement("div");
      bar.className = "sm-site-bar";
      bar.innerHTML = '<span class="sm-dot run"></span> rendered · sandboxed';
      var frame = document.createElement("iframe");
      frame.className = "sm-site-frame";
      frame.title = "Static site preview: " + name;
      frame.setAttribute("sandbox", "allow-scripts");
      frame.srcdoc = f.content;
      site.appendChild(bar);
      site.appendChild(frame);
      body.appendChild(site);
    } else {
      body.innerHTML = '<pre class="sm-file-code">' + hl(f.content) + "</pre>";
    }
  }

  function openFile(path) {
    if (!fileMeta(path)) return;
    var key = "file:" + path;
    if (!findTab(key)) ctxTabs.push({ key: key, kind: "file", path: path });
    ctxOpen = true;
    applyContext();
    setContextTab(key);
  }

  function renderDiff(ws) {
    var d = WS[ws];
    if (!d) return;
    $("#sm-ctx-diff-file").textContent = d.change.file;
    $("#sm-ctx-diff-nums").textContent = "+" + d.change.add + " −" + d.change.del;
    var box = $("#sm-ctx-diff");
    box.innerHTML = "";
    d.diff.forEach(function (row) {
      var div = document.createElement("div");
      div.className = "sm-ctx-dl " + row[0];
      div.textContent = row[1];
      box.appendChild(div);
    });
  }

  function syncContext(ws) {
    if (!ws || !WS[ws]) return;
    if (explorerWs !== ws) {
      openDirs = { "/components": true, "/public": true };
      explorerWs = ws;
    }
    renderDiff(ws);
    renderPreview(ws);
    renderExplorer();
    var t = activeTab();
    if (t && t.kind === "file") renderFile(t);
  }

