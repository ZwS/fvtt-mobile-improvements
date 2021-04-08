import { settings, getSetting } from "./settings.js";
import { WindowMenu } from "./windowMenu.js";
import { MobileMenu } from "./mobileMenu.js";

enum ViewState {
  Map,
  Sidebar,
}
enum DrawerState {
  None,
  Macros = "macros",
  Menu = "menu",
  Windows = "windows",
}

declare let ui: { sidebar: Sidebar; hotbar: any };

export class MobileNavigation extends Application {
  state: ViewState = ViewState.Map;
  drawerState: DrawerState = DrawerState.None;

  windowMenu: WindowMenu;
  mobileMenu: MobileMenu;

  constructor() {
    super({
      template: "modules/mobile-improvements/templates/navigation.html",
      popOut: false,
    });

    this.windowMenu = new WindowMenu(this);
    this.mobileMenu = new MobileMenu(this);

    // Ensure HUD shows on opening a new window
    Hooks.on("WindowManager:NewRendered", () => {
      $(document.body).removeClass("hide-hud");
    });
  }

  render(force: boolean, ...arg) {
    const r = super.render(force, ...arg);
    this.windowMenu.render(force);
    this.mobileMenu.render(force);
    return r;
  }

  activateListeners(html: JQuery<HTMLElement>): void {
    html.find("li").on("click", (evt, as) => {
      const [firstClass] = evt.currentTarget.className.split(" ");
      const [_, name] = firstClass.split("-");
      this.selectItem(name);
    });
    this.updateMode();
  }

  closeDrawer() {
    this.setDrawerState(DrawerState.None);
  }

  showMap() {
    const minimized = window.WindowManager.minimizeAll();
    console.log(minimized);
    this.state = ViewState.Map;
    //@ts-ignore
    canvas.app.start();
  }

  showSidebar() {
    this.state = ViewState.Sidebar;
    $(document.body).removeClass("hide-hud");
    ui.sidebar.expand();
    window.WindowManager.minimizeAll();
    if (getSetting(settings.SIDEBAR_PAUSES_RENDER) === true) {
      //@ts-ignore
      canvas.app.stop();
    }
  }

  showHotbar() {
    $(document.body).addClass("show-hotbar");
    ui.hotbar.expand();
  }

  hideHotbar() {
    $(document.body).removeClass("show-hotbar");
  }

  setWindowCount(count: number) {
    this.element.find(".navigation-windows span span").html(count.toString());
  }

  setDrawerState(state: DrawerState) {
    $(`body > .drawer`).removeClass("open");
    this.element.find(".toggle.active").removeClass("active");
    this.hideHotbar();
    if (state == DrawerState.None || state == this.drawerState) {
      this.drawerState = DrawerState.None;
      return;
    }

    this.drawerState = state;
    if (state == DrawerState.Macros) {
      this.showHotbar();
    } else {
      $(`body > .drawer.drawer-${state}`).addClass("open");
    }
    this.element.find(`.navigation-${state}`).addClass("active");
  }

  selectItem(name: string) {
    console.log(name);
    switch (name) {
      case "map":
        this.showMap();
        this.setDrawerState(DrawerState.None);
        break;
      case "sidebar":
        this.showSidebar();
        this.setDrawerState(DrawerState.None);
        break;
      default:
        this.setDrawerState(name as DrawerState);
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
