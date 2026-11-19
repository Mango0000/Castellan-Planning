/* 30-temp — temporary-chat workspace/folder context */

  /* ----------------------------------------------------------- temp chat */

  function setTempWorkspace(ws, box) {
    var target = box || activeComposer;
    tempWs = ws || "";
    tempFolder = "";
    if (remotePop && !remotePop.hidden) {
      remoteWsId = tempWs;
      remoteDir = [];
      remoteOpenDirs = {};
      remoteSearch = "";
      var rsearch = $("#sm-remote-search", remotePop);
      if (rsearch) rsearch.value = "";
    }
    if (tempWs) {
      currentWs = tempWs;
      ctxAvailable = true;
      ctxOpen = true;
      syncContext(tempWs);
      addContextTab("explorer");
    } else {
      currentWs = null;
      ctxAvailable = false;
      ctxOpen = false;
    }
    applyContext();
    if (target) activeComposer = target;
    renderAllComposerChips();
    if (remotePop && !remotePop.hidden) renderRemote();
  }

  function setTempFolder(path, box) {
    var target = box || activeComposer;
    tempFolder = (path || "").trim();
    if (!tempFolder) {
      tempFolder = "";
    }
    tempWs = "";
    currentWs = null;
    ctxAvailable = false;
    ctxOpen = false;
    applyContext();
    if (target) activeComposer = target;
    renderAllComposerChips();
    if (remotePop && !remotePop.hidden) renderRemote();
  }

  function resetTempContext() {
    tempWs = "";
    tempFolder = "";
    currentWs = null;
    ctxAvailable = false;
    ctxOpen = false;
    applyContext();
    var box = $("#sm-temp-new-box", shell);
    if (box && box.__composer) box.__composer.files = [];
    renderAllComposerChips();
    if (attachPop) attachPop.hidden = true;
    if (selectPop) selectPop.hidden = true;
    if (remoteBack) remoteBack.hidden = true;
    if (remotePop) remotePop.hidden = true;
  }

