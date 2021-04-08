import { preloadTemplates } from "./module/preloadTemplates.js";
import { registerSettings, settings, getSetting } from "./module/settings.js";
import * as windowMgr from "./module/windowManager.js";
import { MobileNavigation } from "./module/mobileNavigation.js";
import { MobileImprovementsCore } from "./module/core.js";
import { viewHeight } from "./module/util.js";

// Trigger the recalculation of viewheight often. Not great performance,
// but required to work on different mobile browsers
document.addEventListener("fullscreenchange", event =>
  setTimeout(viewHeight, 100)
);
window.addEventListener("resize", viewHeight);
window.addEventListener("scroll", viewHeight);
viewHeight();

Hooks.once("init", async function () {
  console.log("Mobile Improvements | Initializing Mobile Improvements");
  windowMgr.activate();

  if (MobileImprovementsCore.navigation === undefined) {
    MobileImprovementsCore.navigation = new MobileNavigation();
  }
  registerSettings();
  await preloadTemplates();
});

Hooks.once("ready", function () {
  MobileImprovementsCore.navigation.render(true);
  $(document.body).addClass("mobile-improvements");
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
