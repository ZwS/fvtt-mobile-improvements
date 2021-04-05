import { preloadTemplates } from "./module/preloadTemplates.js";
import { WindowSelector } from "./module/windowSelector.js";
import { registerSettings, settings, getSetting } from "./module/settings.js";
import * as mgr from "./module/windowManager.js";
import { MobileNavigation } from "./module/mobileNavigation.js";
import { MobileMenu } from "./module/menu.js";
import { MobileImprovementsCore } from "./module/core.js";
import { viewHeight } from "./module/util.js";

document.addEventListener("fullscreenchange", event =>
  setTimeout(viewHeight, 100)
);
viewHeight();
window.addEventListener("resize", viewHeight);
window.addEventListener("scroll", viewHeight);

Hooks.once("init", async function () {
  console.log("Mobile Improvements | Initializing Mobile Improvements");
  mgr.activate();
  if (MobileImprovementsCore.windowSelector === undefined) {
    MobileImprovementsCore.windowSelector = new WindowSelector();
  }

  if (MobileImprovementsCore.navigation === undefined) {
    MobileImprovementsCore.navigation = new MobileNavigation();
  }
  if (MobileImprovementsCore.menu === undefined) {
    MobileImprovementsCore.menu = new MobileMenu();
  }
  registerSettings();
  await preloadTemplates();
});

Hooks.once("ready", function () {
  MobileImprovementsCore.navigation.render(true);

  MobileImprovementsCore.windowSelector.render(true);
  MobileImprovementsCore.navigation.render(true);
  MobileImprovementsCore.menu.render(true);

  $(document.body).addClass("mobile-improvements");
});

Hooks.once("renderPlayerList", (a, b: JQuery<HTMLElement>, c) => {
  b.addClass("collapsed");
  a._collapsed = true;
});

Hooks.on("renderPlayerList", (a, b: JQuery<HTMLElement>, c) => {
  b.find(".fa-users").click(evt => {
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
