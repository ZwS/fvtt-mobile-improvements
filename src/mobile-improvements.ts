import { preloadTemplates } from "./module/preloadTemplates.js";
import { WindowSelector } from "./module/windowSelector.js";
import { RenderModes } from "./module/renderModes.js";
import { TouchInput } from "./module/touch-input.js";
import { registerSettings, settings } from "./module/settings.js";
import * as mgr from "./module/windowManager.js";
import { MobileNavigation } from "./module/mobileNavigation.js";

const MODULE_NAME = "mobile-improvements"; // TODO: Better handling

Hooks.once("init", async function () {
  window.mobileImprovements = window.mobileImprovements || {};

  console.log("Mobile Improvements | Initializing Mobile Improvements");
  mgr.activate();
  if (window.mobileImprovements.windowSelector === undefined) {
    window.mobileImprovements.windowSelector = new WindowSelector();
  }
  if (window.mobileImprovements.renderModes === undefined) {
    window.mobileImprovements.renderModes = new RenderModes();
  }

  if (window.mobileImprovements.touchInput === undefined) {
    window.mobileImprovements.touchInput = new TouchInput();
  }
  if (window.mobileImprovements.navigation === undefined) {
    window.mobileImprovements.navigation = new MobileNavigation();
  }
  registerSettings();
  await preloadTemplates();
});

Hooks.once("ready", function () {
  window.mobileImprovements.navigation.render(true);

  window.mobileImprovements.windowSelector.render(true);
  window.mobileImprovements.navigation.render(true);

  if (game.settings.get(MODULE_NAME, settings.RENDERMODES)) {
    window.mobileImprovements.renderModes.render(true);
  }
  $(document.body).addClass("mobile-improvements");
});

Hooks.on("canvasReady", function () {
  window.mobileImprovements.touchInput.hook();
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
