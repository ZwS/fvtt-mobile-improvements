import { preloadTemplates } from "./module/preloadTemplates.js";
import {
  registerSettings,
  settings,
  getSetting,
  setSetting,
} from "./module/settings.js";
import * as windowMgr from "./module/windowManager.js";
import { MobileNavigation, ViewState } from "./module/mobileNavigation.js";
import { viewHeight } from "./module/util.js";

class MobileMode {
  static enabled = false;
  static navigation: MobileNavigation;

  static enter() {
    if (MobileMode.enabled) return;
    MobileMode.enabled = true;
    document.body.classList.add("mobile-improvements");
    ui.nav?.collapse();
    viewHeight();
    Hooks.call("mobile-improvements:enter");
  }

  static leave() {
    if (!MobileMode.enabled) return;
    MobileMode.enabled = false;
    document.body.classList.remove("mobile-improvements");
    Hooks.call("mobile-improvements:leave");
  }

  static viewResize() {
    if (MobileMode.enabled) viewHeight();

    if (game.settings && getSetting(settings.PIN_MOBILE_MODE))
      return MobileMode.enter();
    if (localStorage.getItem("mobile-improvements.pinMobileMode") === "true")
      return MobileMode.enter();

    if (window.innerWidth < 800) {
      MobileMode.enter();
    } else {
      MobileMode.leave();
    }
  }
}

function togglePlayerList(show: boolean) {
  if (show) {
    document.getElementById("players").classList.add("mobile-hidden");
  } else {
    document.getElementById("players").classList.remove("mobile-hidden");
  }
}

// Trigger the recalculation of viewheight often. Not great performance,
// but required to work on different mobile browsers
document.addEventListener("fullscreenchange", event =>
  setTimeout(MobileMode.viewResize, 100)
);
window.addEventListener("resize", MobileMode.viewResize);
window.addEventListener("scroll", MobileMode.viewResize);
MobileMode.viewResize();

Hooks.once("init", async function () {
  console.log("Mobile Improvements | Initializing Mobile Improvements");
  windowMgr.activate();

  if (MobileMode.navigation === undefined) {
    MobileMode.navigation = new MobileNavigation();
  }
  registerSettings({
    [settings.SHOW_PLAYER_LIST]: togglePlayerList,
    [settings.PIN_MOBILE_MODE]: enabled => {
      if (enabled) MobileMode.enter();
      else MobileMode.leave();
    },
  });
  await preloadTemplates();
  MobileMode.navigation.render(true);

  const button = $(
    `<a id="mobile-improvements-toggle"><i class="fas fa-mobile-alt"></i> Enable Mobile Mode</a>`
  );
  $("body").append(button);
  button.on("click", () => {
    setSetting(settings.PIN_MOBILE_MODE, true);
  });
});

Hooks.once("renderSceneNavigation", () => {
  if (MobileMode.enabled) ui.nav?.collapse();
});

Hooks.once("renderPlayerList", () =>
  togglePlayerList(getSetting(settings.SHOW_PLAYER_LIST))
);

Hooks.on("createChatMessage", (message: ChatMessage) => {
  if (!MobileMode.enabled || !message.isAuthor) return;

  const shouldBloop =
    MobileMode.navigation.state === ViewState.Map ||
    window.WindowManager.minimizeAll() ||
    ui.sidebar.activeTab !== "chat";

  MobileMode.navigation.showSidebar();
  ui.sidebar.activateTab("chat");

  if (shouldBloop) {
    Hooks.once("renderChatMessage", (obj: ChatMessage, html: JQuery) => {
      if (obj.id !== message.id) return; // Avoid possible race condition?

      html.addClass("bloop");
      setTimeout(() => html.removeClass("bloop"), 10000);
    });
  }
});

const notificationQueueProxy = {
  get: function (target, key) {
    if (key === "__isProxy") return true;

    if (key === "push") {
      return (...arg) => {
        if (Hooks.call("queuedNotification", ...arg)) {
          target.push(...arg);
        }
      };
    }
    return target[key];
  },
};

Hooks.once("renderNotifications", app => {
  if (!app.queue.__isProxy) {
    app.queue = new Proxy(app.queue, notificationQueueProxy);
  }
});

Hooks.on("queuedNotification", notif => {
  if (typeof notif.message === "string") {
    const regex = /\s.+px/g;
    const message = notif.message?.replace(regex, "");
    //@ts-ignore
    const match = game.i18n.translations.ERROR.LowResolution.replace(regex, "");

    if (message == match) {
      console.log("notification suppressed", notif);
      return false;
    }
  }
});
