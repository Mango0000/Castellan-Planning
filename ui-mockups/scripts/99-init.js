/* 99-init — boot the mock */

  /* ------------------------------------------------------------- initialize */

  enhanceComposers();
  initQueueSteer();
  buildArchiveConfirm();
  renderArchive();
  renderCtxTabs();
  renderDashboard("acme-web");
  openView("auth", { ws: "acme-web" });

