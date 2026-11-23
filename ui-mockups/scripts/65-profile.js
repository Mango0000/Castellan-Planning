/* 65-profile — profile menu, Settings dialog and local sign-out state */

(function () {
  var profileBtn = document.getElementById("sm-profile-btn");
  if (!profileBtn) return;

  var menu = document.createElement("div");
  menu.className = "sm-pop sm-profile-pop";
  menu.id = "sm-profile-pop";
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", "Account");
  menu.hidden = true;
  menu.innerHTML =
    '<div class="sm-pop-body sm-profile-menu">' +
    '<button class="sm-profile-action" id="sm-profile-settings" type="button" role="menuitem"><span class="ico" aria-hidden="true">⚙</span><span>Settings</span></button>' +
    '<button class="sm-profile-action" id="sm-profile-logout" type="button" role="menuitem"><span class="ico" aria-hidden="true">⏻</span><span>Log out</span></button>' +
    '</div>';
  shell.appendChild(menu);

  var settings = document.createElement("div");
  settings.className = "sm-settings-layer";
  settings.id = "sm-settings";
  settings.hidden = true;
  settings.innerHTML =
    '<div class="sm-settings-modal" role="dialog" aria-modal="true" aria-labelledby="sm-settings-title">' +
    '<div class="sm-settings-h"><b id="sm-settings-title">Settings</b><button class="sm-pop-x" id="sm-settings-close" type="button" aria-label="Close settings">×</button></div>' +
    '<div class="sm-settings-body">' +
    '<div class="sm-pop-sec"><span class="sm-pop-label">Appearance</span>' +
    '<div class="sm-profile-theme">' +
    '<button type="button" data-profile-theme="light" aria-pressed="true">Light</button>' +
    '<button type="button" data-profile-theme="dark" aria-pressed="false">Dark</button>' +
    '</div></div>' +
    '<div class="sm-profile-about"><span>Castellan</span><small>v0.1 · local mock</small></div>' +
    '</div></div>';
  shell.appendChild(settings);

  var signedOut = document.createElement("div");
  signedOut.className = "sm-signedout";
  signedOut.id = "sm-signedout";
  signedOut.hidden = true;
  signedOut.innerHTML =
    '<span class="sm-signedout-logo" aria-hidden="true"><img class="signedout-logo-light" src="../logo/LogoLight.svg" alt=""><img class="signedout-logo-dark" src="../logo/LogoDark.svg" alt=""></span>' +
    '<b>You\u2019re signed out</b>' +
    '<p>This is a local mock. Your workspaces and settings are still here.</p>' +
    '<button class="mbtn primary" id="sm-signedout-return" type="button">Return to Castellan</button>';
  shell.appendChild(signedOut);

  var settingsAction = document.getElementById("sm-profile-settings");
  var logoutAction = document.getElementById("sm-profile-logout");
  var settingsClose = document.getElementById("sm-settings-close");
  var themeButtons = settings.querySelectorAll("[data-profile-theme]");
  var signedOutReturn = document.getElementById("sm-signedout-return");

  function isDark() {
    return document.documentElement.dataset.theme === "dark";
  }

  function syncTheme() {
    themeButtons.forEach(function (btn) {
      var on = btn.dataset.profileTheme === (isDark() ? "dark" : "light");
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-pressed", String(on));
    });
  }

  function openProfile() {
    menu.hidden = false;
    profileBtn.setAttribute("aria-expanded", "true");
    positionPop(menu, profileBtn);
    setTimeout(function () { settingsAction.focus(); }, 0);
  }

  function closeProfile() {
    if (menu.hidden) return;
    var hadFocus = menu.contains(document.activeElement);
    menu.hidden = true;
    profileBtn.setAttribute("aria-expanded", "false");
    if (hadFocus) profileBtn.focus();
  }

  function openSettings() {
    closeProfile();
    settings.hidden = false;
    syncTheme();
    setTimeout(function () { settingsClose.focus(); }, 0);
  }

  function closeSettings() {
    if (settings.hidden) return;
    var hadFocus = settings.contains(document.activeElement);
    settings.hidden = true;
    if (hadFocus) profileBtn.focus();
  }

  function showSignedOut() {
    closeProfile();
    signedOut.hidden = false;
    setTimeout(function () { signedOutReturn.focus(); }, 0);
  }

  function hideSignedOut() {
    if (signedOut.hidden) return;
    signedOut.hidden = true;
    profileBtn.focus();
  }

  profileBtn.addEventListener("click", function () {
    if (menu.hidden) openProfile();
    else closeProfile();
  });
  settingsAction.addEventListener("click", openSettings);
  logoutAction.addEventListener("click", showSignedOut);
  settingsClose.addEventListener("click", closeSettings);
  menu.addEventListener("click", function (e) { e.stopPropagation(); });

  themeButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (window.CastellanTheme) window.CastellanTheme.set(btn.dataset.profileTheme);
      syncTheme();
    });
  });

  settings.addEventListener("click", function (e) {
    if (e.target === settings) closeSettings();
  });
  var settingsModal = settings.querySelector(".sm-settings-modal");
  if (settingsModal) settingsModal.addEventListener("click", function (e) { e.stopPropagation(); });
  signedOutReturn.addEventListener("click", hideSignedOut);

  document.addEventListener("click", function (e) {
    if (menu.hidden) return;
    if (menu.contains(e.target) || profileBtn.contains(e.target)) return;
    closeProfile();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (!settings.hidden) closeSettings();
    else if (!menu.hidden) closeProfile();
    else if (!signedOut.hidden) hideSignedOut();
  });

  if (window.MutationObserver) {
    new MutationObserver(syncTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }
  syncTheme();
})();
