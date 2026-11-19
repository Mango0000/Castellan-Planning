/* 99-init — boot the mock */

  /* ------------------------------------------------------------- initialize */

  enhanceComposers();
  buildArchiveConfirm();
  renderArchive();
  renderCtxTabs();
  renderDashboard("acme-web");
  openView("auth", { ws: "acme-web" });

