import type { MobileNavigation } from "./mobileNavigation.js";

export class MobileMenu extends Application {
  nav: MobileNavigation;

  constructor(nav: MobileNavigation) {
    super({
      template: "modules/mobile-improvements/templates/menu.html",
      popOut: false,
    });
    this.nav = nav;
  }
  activateListeners(html: JQuery<HTMLElement>): void {
    html.find("li").on("click", (evt, as) => {
      const [firstClass] = evt.currentTarget.className.split(" ");
      const [_, name] = firstClass.split("-");
      this.selectItem(name);
    });
  }

  toggleOpen() {
    this.element.toggleClass("open");
  }

  selectItem(name: string) {
    console.log(name);
    switch (name) {
      case "fullscreen":
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
        break;
      default:
        break;
    }
    this.nav.closeDrawer();
  }
}
