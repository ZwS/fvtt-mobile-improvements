import { preloadTemplates } from "./module/preloadTemplates.js";
import { registerSettings, settings, getSetting } from "./module/settings.js";
import * as windowMgr from "./module/windowManager.js";
import { MobileNavigation } from "./module/mobileNavigation.js";
import { viewHeight } from "./module/util.js";

class MobileMode {
  static enabled = false;
  static navigation: MobileNavigation;

  static enter() {
    if (MobileMode.enabled) return;
    MobileMode.enabled = true;
    document.body.classList.add("mobile-improvements");
  }
  static leave() {
    if (!MobileMode.enabled) return;
    MobileMode.enabled = false;
    document.body.classList.remove("mobile-improvements");
  }

  static viewResize() {
    if (window.innerWidth < 800) {
      MobileMode.enter();
    } else {
      MobileMode.leave();
    }

    if (MobileMode.enabled) viewHeight();
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
  registerSettings();
  await preloadTemplates();
});

Hooks.once("ready", function () {
  MobileMode.navigation.render(true);
});

Hooks.once("renderPlayerList", (a, b: JQuery<HTMLElement>, c) => {
  b.addClass("collapsed");
  a._collapsed = true;
});

Hooks.on("renderPlayerList", (a, b: JQuery<HTMLElement>, c) => {
  b.find(".fa-users").on("click", evt => {
    evt.preventDefault();
    evt.stopPropagation();
    a._collapsed = !a._collapsed;
    b.toggleClass("collapsed");
  });
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
