/* 15-left-rail — left rail workspace selection and unread cleanup */

  function selectWorkspace(name) {
    lastWorkspace = name;
    var label = $("#sm-new-ws");
    if (label) label.textContent = name;
    $$(".sm-wspick button[data-pick]", shell).forEach(function (b) {
      b.classList.toggle("on", b.dataset.pick === name);
    });
  }

  function clearRateUnread() {
    $$(".sm-unread", shell).forEach(function (el) { el.remove(); });
    var up = $("#sm-working-unread");
    if (up) up.remove();
    var uf = $("#sm-unread-filter");
    if (uf) uf.textContent = "Unread 0";
    var af = $(".sm-filters .sm-filter", shell);
    if (af) af.textContent = "All 1";
    var item = $('.sm-side .sm-item[data-sm-view="rate"]', shell);
    if (item) {
      var row = item.closest(".sm-row");
      if (row) row.remove();
      else item.remove();
    }
    var card = $('.sm-agentcard[data-sm-view="rate"]', shell);
    if (card) card.remove();
    var meta = $('.sm-side .sm-ws[data-sm-ws="api-core"] .meta', shell);
    if (meta) meta.textContent = "done";
  }

