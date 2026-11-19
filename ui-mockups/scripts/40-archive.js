/* 40-archive — archive list, restore/delete, blurred confirmations and delete all */

  /* --------------------------------------------------------------- archive */

  function renderArchive() {
    var countLeft = $("#sm-archive-count", shell);
    var countView = $("#sm-archive-pill", shell);
    var deleteAll = $("#sm-archive-delete-all", shell);
    if (countLeft) countLeft.textContent = String(ARCHIVED.length);
    if (countView) countView.textContent = ARCHIVED.length + " archived";
    if (deleteAll) deleteAll.hidden = ARCHIVED.length === 0;
    var list = $("#sm-archive-list", shell);
    if (!list) return;
    list.innerHTML = "";
    if (!ARCHIVED.length) {
      var empty = document.createElement("div");
      empty.className = "sm-archive-empty";
      empty.innerHTML = '<span class="ic">⇩</span><b>Nothing archived yet</b><p>Use the archive button in a task or temporary chat. Archived work disappears from the rail and can be restored here.</p>';
      list.appendChild(empty);
      return;
    }
    ARCHIVED.forEach(function (item) {
      var card = document.createElement("div");
      card.className = "sm-archive-card";
      card.innerHTML =
        '<span class="sm-archive-ico">' + (item.type === "chat" ? "✦" : "⌘") + '</span>' +
        '<div class="sm-archive-copy"><b>' + esc(item.title) + '</b><small>' + esc(item.ws) + ' · ' + item.type + ' · archived just now</small></div>' +
        '<div class="sm-archive-actions"><button class="sm-linkbtn" type="button" data-restore="' + item.key + '">Restore</button>' +
        '<button class="sm-linkbtn danger" type="button" data-delete="' + item.key + '">Delete</button></div>';
      list.appendChild(card);
    });
    $$("[data-restore]", list).forEach(function (b) {
      b.addEventListener("click", function () { restoreArchived(b.dataset.restore); });
    });
    $$("[data-delete]", list).forEach(function (b) {
      b.addEventListener("click", function () { deleteArchived(b.dataset.delete); });
    });
  }

  function archiveItem(key) {
    var base = ARCHIVE_META[key];
    if (!base || ARCHIVED.some(function (a) { return a.key === key; })) return;
    var item = {};
    Object.keys(base).forEach(function (k) { item[k] = base[k]; });
    item.key = key;
    if (item.type === "task" && WS[item.ws]) {
      item.taskData = WS[item.ws].task;
      WS[item.ws].task = null;
      var row = $('.sm-side .sm-ws[data-sm-ws="' + item.ws + '"]', shell);
      var meta = row ? $(".meta", row) : null;
      item.railMeta = meta ? meta.textContent : "";
      if (meta) meta.textContent = "idle";
    }
    $$('.sm-side [data-rail-key="' + key + '"]', shell).forEach(function (el) { el.hidden = true; });
    $$('.sm-views .sm-agentcard[data-sm-view="' + key + '"]', shell).forEach(function (el) { el.hidden = true; });
    ARCHIVED.unshift(item);
    renderArchive();
    openView("archived");
  }

  function restoreArchived(key) {
    var idx = -1;
    ARCHIVED.some(function (a, i) { if (a.key === key) { idx = i; return true; } return false; });
    if (idx === -1) return;
    var item = ARCHIVED[idx];
    ARCHIVED.splice(idx, 1);
    $$('.sm-side [data-rail-key="' + key + '"]', shell).forEach(function (el) { el.hidden = false; });
    $$('.sm-views .sm-agentcard[data-sm-view="' + key + '"]', shell).forEach(function (el) { el.hidden = false; });
    if (item.type === "task" && WS[item.ws]) {
      WS[item.ws].task = item.taskData;
      var row = $('.sm-side .sm-ws[data-sm-ws="' + item.ws + '"]', shell);
      var meta = row ? $(".meta", row) : null;
      if (meta) meta.textContent = item.railMeta || "1 task";
    }
    renderArchive();
    openView(item.view);
  }

  function deleteArchived(key) {
    ARCHIVED = ARCHIVED.filter(function (a) { return a.key !== key; });
    renderArchive();
  }

  function buildArchiveConfirm() {
    if (archiveConfirm) return;
    archiveConfirm = document.createElement("div");
    archiveConfirm.className = "sm-archive-layer";
    archiveConfirm.id = "sm-archive-confirm";
    archiveConfirm.hidden = true;
    archiveConfirm.innerHTML =
      '<div class="sm-archive-modal" role="dialog" aria-modal="true" aria-labelledby="sm-archive-confirm-title">' +
      '<div class="sm-archive-modal-h"><b id="sm-archive-confirm-title">Archive?</b><button class="sm-pop-x" id="sm-archive-confirm-x" type="button" aria-label="Cancel">×</button></div>' +
      '<div class="sm-archive-modal-body"><p id="sm-archive-confirm-text"></p><small id="sm-archive-confirm-note">You can restore it from Archive.</small></div>' +
      '<div class="sm-archive-modal-f"><button class="sm-mini" id="sm-archive-confirm-cancel" type="button">Cancel</button><button class="mbtn primary" id="sm-archive-confirm-yes" type="button">Archive</button></div>' +
      '</div>';
    shell.appendChild(archiveConfirm);
    archiveConfirm.addEventListener("click", function (e) {
      if (e.target === archiveConfirm) closeArchiveConfirm();
    });
    var modal = $(".sm-archive-modal", archiveConfirm);
    if (modal) modal.addEventListener("click", function (e) { e.stopPropagation(); });
    $("#sm-archive-confirm-x", archiveConfirm).addEventListener("click", closeArchiveConfirm);
    $("#sm-archive-confirm-cancel", archiveConfirm).addEventListener("click", closeArchiveConfirm);
    $("#sm-archive-confirm-yes", archiveConfirm).addEventListener("click", function () {
      var mode = archiveConfirmMode;
      var key = pendingArchiveKey;
      closeArchiveConfirm();
      if (mode === "deleteAll") deleteAllArchived();
      else if (key) archiveItem(key);
    });
    addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeArchiveConfirm();
    });
  }

  function closeArchiveConfirm() {
    if (!archiveConfirm) return;
    archiveConfirm.hidden = true;
    pendingArchiveKey = null;
    archiveConfirmBtn = null;
    archiveConfirmMode = "archive";
  }

  function openArchiveConfirm(key, btn) {
    var meta = ARCHIVE_META[key];
    if (!meta) return;
    if (archiveConfirm && !archiveConfirm.hidden && pendingArchiveKey === key) { closeArchiveConfirm(); return; }
    buildArchiveConfirm();
    pendingArchiveKey = key;
    archiveConfirmMode = "archive";
    archiveConfirmBtn = btn;
    var title = $("#sm-archive-confirm-title", archiveConfirm);
    var text = $("#sm-archive-confirm-text", archiveConfirm);
    var note = $("#sm-archive-confirm-note", archiveConfirm);
    var yes = $("#sm-archive-confirm-yes", archiveConfirm);
    if (title) title.textContent = meta.type === "chat" ? "Archive chat?" : "Archive task?";
    if (text) text.textContent = "Move \u201c" + meta.title + "\u201d out of the rail?";
    if (note) note.textContent = "You can restore it from Archive.";
    if (yes) { yes.textContent = "Archive"; yes.className = "mbtn primary"; }
    archiveConfirm.hidden = false;
    var cancel = $("#sm-archive-confirm-cancel", archiveConfirm);
    if (cancel) setTimeout(function () { cancel.focus(); }, 0);
  }

  function openDeleteAllConfirm() {
    if (!ARCHIVED.length) return;
    buildArchiveConfirm();
    pendingArchiveKey = null;
    archiveConfirmMode = "deleteAll";
    var title = $("#sm-archive-confirm-title", archiveConfirm);
    var text = $("#sm-archive-confirm-text", archiveConfirm);
    var note = $("#sm-archive-confirm-note", archiveConfirm);
    var yes = $("#sm-archive-confirm-yes", archiveConfirm);
    var n = ARCHIVED.length;
    if (title) title.textContent = n === 1 ? "Delete the archived item?" : "Delete all archived items?";
    if (text) text.textContent = n === 1 ? "Permanently delete the 1 archived item?" : "Permanently delete all " + n + " archived items?";
    if (note) note.textContent = "This cannot be undone.";
    if (yes) { yes.textContent = "Delete all"; yes.className = "mbtn danger"; }
    archiveConfirm.hidden = false;
    var cancel = $("#sm-archive-confirm-cancel", archiveConfirm);
    if (cancel) setTimeout(function () { cancel.focus(); }, 0);
  }

  function deleteAllArchived() {
    ARCHIVED = [];
    renderArchive();
  }

