/* 30-temp — temporary-chat workspace/folder context */

  /* ----------------------------------------------------------- temp chat */

  function resetTempContext() {
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

