/* 99-init — boot the mock */

  /* ------------------------------------------------------------- initialize */

  enhanceComposers();
  initGlobalDashboard();
  initQueueSteer();
  buildArchiveConfirm();
  renderArchive();
  renderCtxTabs();
  renderDashboard("acme-web");
  openView("auth", { ws: "acme-web" });

