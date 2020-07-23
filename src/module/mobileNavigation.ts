enum ViewState {
  Map,
  Sidebar,
}

declare let ui: { sidebar: Sidebar; hotbar: any };

export class MobileNavigation extends Application {
  element: JQuery<HTMLElement>;
  state: ViewState = ViewState.Map;
  constructor() {
    super({
      template: "modules/mobile-improvements/templates/navigation.html",
      popOut: false,
    });
    // Ensure HUD shows on opening a new window
    Hooks.on("WindowManager:NewRendered", () => {
      $(document.body).removeClass("hide-hud");
    });
  }

  protected activateListeners(html: JQuery<HTMLElement>): void {
    html.find("li").click((evt, as) => {
      const [firstClass] = evt.currentTarget.className.split(" ");
      const [_, name] = firstClass.split("-");
      this.selectItem(name);
    });
    this.updateMode();
  }

  showMap() {
    if (this.state == ViewState.Map) {
      $(document.body).toggleClass("hide-hud");
    }
    this.state = ViewState.Map;
  }

  showSidebar() {
    this.state = ViewState.Sidebar;
    $(document.body).removeClass("hide-hud");
    ui.sidebar.expand();
  }

  showHotbar() {
    if (!$(document.body).hasClass("show-hotbar")) {
      $(document.body).addClass("show-hotbar");
      this.element.find(".navigation-macros").addClass("active");

      ui.hotbar.expand();
    } else {
      // ui.hotbar.collapse();
      $(document.body).removeClass("show-hotbar");
      this.element.find(".navigation-macros").removeClass("active");
    }
  }
  setWindowCount(count: number) {
    this.element.find(".navigation-windows span span").html(count.toString());
  }
  selectItem(name: string) {
    console.log(name);
    switch (name) {
      case "map":
        this.showMap();
        break;
      case "sidebar":
        this.showSidebar();
        break;
      case "macros":
        this.showHotbar();
        break;
      case "windows":
        window.mobileImprovements.windowSelector.toggleOpen();
        break;
      default:
        break;
    }
    this.updateMode();
  }

  updateMode() {
    this.element.find(".active:not(.toggle)").removeClass("active");
    $(document.body).removeClass("show-sidebar");

    switch (this.state) {
      case ViewState.Map:
        this.element.find(".navigation-map").addClass("active");
        break;
      case ViewState.Sidebar:
        this.element.find(".navigation-sidebar").addClass("active");
        $(document.body).addClass("show-sidebar");
        break;
      default:
        break;
    }
  }
}
