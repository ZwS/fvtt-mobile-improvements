import type { MobileNavigation } from "./mobileNavigation.js";
import { getSetting, setSetting, settings } from "./settings.js";
import { About } from "./about.js";
import { noCanvasAvailable } from "./util.js";
export class MobileMenu extends Application {
  nav: MobileNavigation;
  aboutApp: About;

  constructor(nav: MobileNavigation) {
    super({
      template: "modules/mobile-improvements/templates/menu.hbs",
      popOut: false,
    });
    this.nav = nav;
    this.aboutApp = new About();
  }
  activateListeners(html: JQuery<HTMLElement>): void {
    html.find("li").on("click", (evt) => {
      const [firstClass] = evt.currentTarget.className.split(" ");
      const [, name] = firstClass.split("-");
      this.selectItem(name);
    });
    if (!noCanvasAvailable()) {
      html.find(".menu-canvas").detach();
    }
  }

  toggleOpen(): void {
    this.element.toggleClass("open");
  }

  selectItem(name: string): void {
    switch (name) {
      case "about":
        this.aboutApp.render(true);
        break;
      case "fullscreen":
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
        break;
      case "players":
        setSetting(
          settings.SHOW_PLAYER_LIST,
          !getSetting(settings.SHOW_PLAYER_LIST)
        );
        break;
      case "canvas":
        game.settings.set(
          "core",
          "noCanvas",
          !game.settings.get("core", "noCanvas")
        );
        break;
      case "exit":
        setSetting(settings.PIN_MOBILE_MODE, false);
        break;
      default:
        console.log("Unhandled menu item", name);
        break;
    }
    this.nav.closeDrawer();
  }
}
